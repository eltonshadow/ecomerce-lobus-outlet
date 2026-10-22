"use server";

import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import type { MeasurementsGuide, Product } from "@/types/store";
import { buildQuote, createOrder, expireStaleOrders, ITEM_IMAGE, CheckoutError, type CreateOrderInput, type QuoteInput } from "@/lib/orders";
import { infinitePayEnabled } from "@/lib/infinitepay";
import { payLinkFor } from "@/lib/payments";

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
// Ordena grade: letras na ordem PP..XGG ("P (38)" conta como P), depois numeração.
function bySize(a: { size: string }, b: { size: string }) {
  const rank = (s: string) => {
    const i = SIZE_ORDER.indexOf(s.split(" ")[0].toUpperCase());
    return i >= 0 ? i : 100 + (parseInt(s, 10) || 999);
  };
  return rank(a.size) - rank(b.size);
}

export async function getStoreProducts(filter?: { categorySlug?: string; size?: string }) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(filter?.categorySlug && filter.categorySlug !== "todas"
          ? { category: { slug: filter.categorySlug } }
          : {}),
        // Catálogo só mostra produto com algum tamanho em estoque.
        variants: {
          some: {
            stockQuantity: { gt: 0 },
            ...(filter?.size && filter.size !== "todos" ? { size: { contains: filter.size } } : {}),
          },
        },
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: true,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    });

    const data: Product[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        categorySlug: p.category.slug,
        description: p.description || "",
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        price: Number(p.price),
        isOutletDiscount: p.isOutletDiscount,
        featured: p.featured,
        images: p.images.map((img) => img.imageUrl),
        variants: [...p.variants].sort(bySize).map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName || undefined,
          colorHex: v.colorHex || undefined,
          stockQuantity: v.stockQuantity,
        })),
        measurementsGuide: (p.measurementsGuide ?? undefined) as MeasurementsGuide | undefined,
      }));
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar produtos do banco:", error);
    return { success: false, data: [] as Product[] };
  }
}

export async function getDeliveryZonesFromDB() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { deliveryFee: "asc" },
    });
    return { success: true, data: zones };
  } catch (error) {
    console.error("Erro ao buscar zonas de frete:", error);
    return { success: false, data: [] };
  }
}

// Checkout: o cliente manda só variantId + quantidade. Preço, frete e cupom são recalculados no servidor.
export async function quoteCheckoutAction(input: QuoteInput) {
  try {
    const q = await buildQuote(input);
    return { success: true as const, quote: { subtotal: q.subtotal, deliveryFee: q.deliveryFee, deliveryZoneName: q.deliveryZoneName, discountValue: q.discountValue, total: q.total, payOnline: infinitePayEnabled() } };
  } catch (e) {
    return { success: false as const, error: e instanceof CheckoutError ? e.message : "Não foi possível calcular o pedido." };
  }
}

export async function createOrderAction(input: CreateOrderInput) {
  try {
    // Conta vem da sessão no servidor, nunca do cliente.
    const customer = await getCustomer();
    const order = await createOrder(input, customer?.id ?? null);
    return { success: true as const, orderNumber: order.orderNumber, checkoutUrl: await safePayLink(order.orderNumber) };
  } catch (e) {
    if (!(e instanceof CheckoutError)) console.error("Erro ao criar pedido:", e);
    return { success: false as const, error: e instanceof CheckoutError ? e.message : "Falha ao gravar pedido. Tente novamente." };
  }
}

// Link falhou: o pedido continua pendente e a página dele mostra "Pagar agora", que tenta de novo.
async function safePayLink(orderNumber: string) {
  if (!infinitePayEnabled()) return null;
  try {
    return await payLinkFor(orderNumber);
  } catch (e) {
    console.error("InfinitePay: link não criado para", orderNumber, e);
    return null;
  }
}

// Botão "Pagar agora" da página do pedido e da conta. Pedido de conta só abre para o dono:
// o link leva nome, e-mail e telefone pré-preenchidos.
export async function payOrderAction(orderNumber: string) {
  const [order, me] = await Promise.all([prisma.order.findUnique({ where: { orderNumber }, select: { customerId: true } }), getCustomer()]);
  if (order?.customerId && order.customerId !== me?.id) return { error: "Entre na sua conta para pagar este pedido." };
  const url = await safePayLink(orderNumber);
  return url ? { url } : { error: "Não foi possível abrir o pagamento agora. Tente de novo em instantes ou fale com a loja no WhatsApp." };
}

// Página pública do pedido (/pedido/[orderNumber]). Expõe só o necessário: sem CPF, e-mail ou telefone.
export async function getPublicOrder(orderNumber: string) {
  await expireStaleOrders();
  const o = await prisma.order.findUnique({ where: { orderNumber }, include: { items: { include: ITEM_IMAGE } } });
  if (!o) return null;
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    firstName: o.customerName.split(" ")[0],
    deliveryMethod: o.deliveryMethod,
    deliveryZoneName: o.deliveryZoneName,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    discountValue: Number(o.discountValue),
    total: Number(o.total),
    pixCopyPaste: o.status === "PENDING" ? o.pixCopyPaste : null,
    pixExpiresAt: o.pixExpiresAt?.toISOString() ?? null,
    payOnline: infinitePayEnabled() && o.status === "PENDING",
    captureMethod: o.captureMethod,
    installments: o.installments,
    receiptUrl: o.paymentStatus === "APPROVED" ? o.receiptUrl : null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ productName: i.productName, size: i.size, colorName: i.colorName, quantity: i.quantity, unitPrice: Number(i.unitPrice), totalPrice: Number(i.totalPrice), image: i.variant.product.images[0]?.imageUrl ?? null })),
  };
}
