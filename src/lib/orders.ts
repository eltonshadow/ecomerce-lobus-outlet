import { randomBytes } from "node:crypto";
import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isValidCpf } from "@/lib/cpf";
import { infinitePayEnabled } from "@/lib/infinitepay";

export const PIX_TTL_MS = 20 * 60 * 1000;
// Link da InfinitePay tem cartão e 3DS: um pouco mais de tempo para pagar.
const LINK_TTL_MS = 30 * 60 * 1000;

export type CheckoutItemInput = { variantId: string; quantity: number };

export type QuoteInput = {
  items: CheckoutItemInput[];
  deliveryMethod: "PICKUP" | "MOTOBOY";
  cep?: string;
  couponCode?: string;
};

export type Quote = {
  lines: { variantId: string; productName: string; sku: string; size: string; colorName: string | null; quantity: number; unitPrice: number; totalPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  deliveryZoneName: string | null;
  discountValue: number;
  couponId: string | null;
  total: number;
};

export class CheckoutError extends Error {}

// Foto principal do produto de cada item (pedido guarda só o snapshot do nome).
export const ITEM_IMAGE = { variant: { select: { product: { select: { images: { orderBy: { displayOrder: "asc" as const }, take: 1, select: { imageUrl: true } } } } } } };

const round2 = (n: number) => Math.round(n * 100) / 100;
const onlyDigits = (s: string) => s.replace(/\D/g, "");

// Preço, frete e desconto sempre recalculados aqui, nunca vindos do cliente.
export async function buildQuote(input: QuoteInput, db: Prisma.TransactionClient = prisma): Promise<Quote> {
  if (!input.items.length) throw new CheckoutError("Carrinho vazio.");

  const qtyById = new Map<string, number>();
  for (const it of input.items) {
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 20) throw new CheckoutError("Quantidade inválida.");
    qtyById.set(it.variantId, (qtyById.get(it.variantId) ?? 0) + it.quantity);
  }

  const variants = await db.productVariant.findMany({
    where: { id: { in: [...qtyById.keys()] } },
    include: { product: true },
  });

  const lines = [...qtyById].map(([variantId, quantity]) => {
    const v = variants.find((x) => x.id === variantId);
    if (!v || !v.product.active) throw new CheckoutError("Um dos produtos não está mais disponível.");
    if (v.stockQuantity < quantity) throw new CheckoutError(`Estoque insuficiente: ${v.product.name} (${v.size}). Disponível: ${v.stockQuantity}.`);
    const unitPrice = Number(v.priceOverride ?? v.product.price);
    return { variantId, productName: v.product.name, sku: v.sku, size: v.size, colorName: v.colorName, quantity, unitPrice, totalPrice: round2(unitPrice * quantity) };
  });

  const subtotal = round2(lines.reduce((a, l) => a + l.totalPrice, 0));

  let deliveryFee = 0;
  let deliveryZoneName: string | null = null;
  if (input.deliveryMethod === "MOTOBOY") {
    const cep = onlyDigits(input.cep ?? "");
    if (cep.length !== 8) throw new CheckoutError("Informe um CEP válido.");
    const zones = await db.deliveryZone.findMany({ where: { active: true } });
    const zone = zones.find((z) => z.cepPrefixes.some((p) => cep.startsWith(p)));
    if (!zone) throw new CheckoutError("CEP fora da área de entrega por motoboy. Escolha retirada na loja ou fale com a gente no WhatsApp.");
    deliveryZoneName = zone.name;
    const freeAbove = zone.freeShippingAbove ? Number(zone.freeShippingAbove) : null;
    deliveryFee = freeAbove !== null && subtotal >= freeAbove ? 0 : Number(zone.deliveryFee);
  }

  let discountValue = 0;
  let couponId: string | null = null;
  const code = input.couponCode?.trim().toUpperCase();
  if (code) {
    const c = await db.coupon.findUnique({ where: { code } });
    if (!c || !c.active) throw new CheckoutError("Cupom inválido.");
    if (c.validUntil && c.validUntil < new Date()) throw new CheckoutError("Cupom expirado.");
    if (c.maxUses !== null && c.usedCount >= c.maxUses) throw new CheckoutError("Cupom esgotado.");
    if (c.minOrderValue && subtotal < Number(c.minOrderValue)) throw new CheckoutError(`Cupom válido para pedidos a partir de R$ ${Number(c.minOrderValue).toFixed(2).replace(".", ",")}.`);
    discountValue = c.discountType === "PERCENTAGE" ? round2((subtotal * Number(c.discountValue)) / 100) : Math.min(subtotal, Number(c.discountValue));
    couponId = c.id;
  }

  return { lines, subtotal, deliveryFee, deliveryZoneName, discountValue, couponId, total: round2(subtotal - discountValue + deliveryFee) };
}

// Não sequencial de propósito: o número do pedido é a "chave" da página pública do pedido.
function newOrderNumber() {
  return `TDM-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// PIX simulado enquanto não há credencial real de gateway (ver README/pendências).
function fakePixCopyPaste(orderNumber: string, total: number) {
  return `00020126580014br.gov.bcb.pix0136${orderNumber}52040000530398654${String(total.toFixed(2).length).padStart(2, "0")}${total.toFixed(2)}5802BR5913TROPA DA MAUA6004MAUA62070503***6304SIMU`;
}

export type CreateOrderInput = QuoteInput & {
  customer: { name: string; phone: string; email: string; cpf: string };
  shipping?: { street?: string; number?: string; complement?: string; neighborhood?: string; notes?: string };
};

// Limite de pedidos aguardando Pix por cliente: impede travar o estoque com pedidos falsos.
// ponytail: limite por telefone/CPF/conta; limite por IP fica no proxy reverso de produção.
export const MAX_PENDING_PER_CUSTOMER = 2;

export async function createOrder(input: CreateOrderInput, customerId: string | null = null) {
  const name = input.customer.name.trim();
  const phone = onlyDigits(input.customer.phone);
  const email = input.customer.email.trim();
  const cpf = onlyDigits(input.customer.cpf);
  if (name.length < 3) throw new CheckoutError("Informe seu nome completo.");
  if (phone.length < 10 || phone.length > 13) throw new CheckoutError("Informe um WhatsApp válido com DDD.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new CheckoutError("Informe um e-mail válido.");
  if (!isValidCpf(cpf)) throw new CheckoutError("Informe um CPF válido.");
  if (input.deliveryMethod === "MOTOBOY" && (!input.shipping?.street?.trim() || !input.shipping?.number?.trim() || !input.shipping?.neighborhood?.trim())) {
    throw new CheckoutError("Preencha rua, número e bairro para a entrega.");
  }

  return prisma.$transaction(async (tx) => {
    // Trava por cliente durante a transação: dois checkouts simultâneos não furam o limite.
    for (const key of [customerId ?? "", `cpf:${cpf}`, `tel:${phone}`].filter(Boolean).sort()) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
    }
    // Logado: conta só os pedidos da própria conta (outra pessoa digitando o CPF dele não o bloqueia).
    // Convidado: conta pedidos de convidado com o mesmo telefone ou CPF.
    const pending = await tx.order.count({
      where: {
        status: "PENDING",
        pixExpiresAt: { gt: new Date() },
        ...(customerId ? { customerId } : { customerId: null, OR: [{ customerPhone: phone }, { customerCpf: cpf }] }),
      },
    });
    if (pending >= MAX_PENDING_PER_CUSTOMER) {
      throw new CheckoutError("Você já tem pedidos aguardando pagamento. Pague ou aguarde o Pix vencer antes de fazer outro.");
    }

    const q = await buildQuote(input, tx);
    const orderNumber = newOrderNumber();

    // Reserva de estoque: só decrementa se ainda houver saldo. 0 linhas = alguém comprou antes.
    for (const l of q.lines) {
      const r = await tx.productVariant.updateMany({
        where: { id: l.variantId, stockQuantity: { gte: l.quantity } },
        data: { stockQuantity: { decrement: l.quantity } },
      });
      if (r.count === 0) throw new CheckoutError(`Estoque esgotou agora: ${l.productName} (${l.size}).`);
    }

    if (q.couponId) {
      // Incremento condicional e atômico: dois checkouts simultâneos não passam do maxUses.
      const used = await tx.$executeRaw`
        UPDATE coupons SET "usedCount" = "usedCount" + 1, "updatedAt" = now()
        WHERE id = ${q.couponId} AND active
          AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
          AND ("validUntil" IS NULL OR "validUntil" > now())`;
      if (used === 0) throw new CheckoutError("Cupom esgotado ou expirado.");
    }

    return tx.order.create({
      data: {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerCpf: cpf,
        deliveryMethod: input.deliveryMethod,
        deliveryFee: q.deliveryFee,
        deliveryZoneName: q.deliveryZoneName,
        shippingCep: input.deliveryMethod === "MOTOBOY" ? onlyDigits(input.cep ?? "") : null,
        shippingStreet: input.shipping?.street?.trim() || null,
        shippingNumber: input.shipping?.number?.trim() || null,
        shippingComplement: input.shipping?.complement?.trim() || null,
        shippingNeighborhood: input.shipping?.neighborhood?.trim() || null,
        deliveryNotes: input.shipping?.notes?.trim() || null,
        subtotal: q.subtotal,
        discountValue: q.discountValue,
        total: q.total,
        couponId: q.couponId,
        customerId,
        paymentMethod: "PIX",
        pixCopyPaste: infinitePayEnabled() ? null : fakePixCopyPaste(orderNumber, q.total),
        pixExpiresAt: new Date(Date.now() + (infinitePayEnabled() ? LINK_TTL_MS : PIX_TTL_MS)),
        items: { create: q.lines.map(({ variantId, productName, sku, size, colorName, quantity, unitPrice, totalPrice }) => ({ variantId, productName, sku, size, colorName, quantity, unitPrice, totalPrice })) },
      },
      include: { items: true },
    });
  });
}

// Devolve ao estoque os itens de um pedido. Usado ao cancelar.
async function restock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    await tx.productVariant.update({ where: { id: it.variantId }, data: { stockQuantity: { increment: it.quantity } } });
  }
}

// Transições permitidas. Cancelar devolve o estoque; pagar marca paidAt.
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function changeOrderStatus(orderId: string, to: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new CheckoutError("Pedido não encontrado.");
    if (!NEXT_STATUS[order.status].includes(to)) throw new CheckoutError(`Transição inválida: ${order.status} → ${to}.`);
    // Guarda contra corrida: só atualiza se o status ainda for o lido.
    const r = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: {
        status: to,
        ...(to === "PAID" ? { paymentStatus: "APPROVED", paidAt: new Date() } : {}),
        ...(to === "CANCELLED" && order.paymentStatus === "PENDING" ? { paymentStatus: "FAILED" } : {}),
      },
    });
    if (r.count === 0) throw new CheckoutError("Pedido foi alterado por outra pessoa. Recarregue.");
    if (to === "CANCELLED") {
      await restock(tx, orderId);
      if (order.couponId) await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { decrement: 1 } } });
    }
  });
}

// Pix vencido sem pagamento: cancela e devolve estoque. Chamado de forma preguiçosa (listagem admin, página do pedido).
// ponytail: sem cron; se o volume crescer, mover para um job agendado.
export async function expireStaleOrders() {
  const stale = await prisma.order.findMany({
    where: { status: "PENDING", pixExpiresAt: { lt: new Date() } },
    select: { id: true },
  });
  for (const o of stale) {
    try {
      await changeOrderStatus(o.id, "CANCELLED");
    } catch {
      // outra requisição já mexeu no pedido
    }
  }
}
