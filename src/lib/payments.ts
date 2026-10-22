import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { changeOrderStatus, CheckoutError, NEXT_STATUS } from "@/lib/orders";
import { createCheckoutLink, isPaidInFull, paymentCheck, type PaymentCheck, type PaymentRef } from "@/lib/infinitepay";

const okRef = (s: unknown): s is string => typeof s === "string" && s.length > 0 && s.length <= 200;

const httpsUrl = (u: unknown) => (typeof u === "string" && u.startsWith("https://") ? u : undefined);

type Extra = { receiptUrl?: unknown; fromWebhook?: boolean };

// Webhook e volta do cliente trazem só identificadores, sem assinatura. Nada é gravado antes do
// payment_check responder, e pedido já pago não muda mais (ninguém troca o comprovante depois).
// Lança em falha de rede para o webhook responder 400 e a InfinitePay tentar de novo.
export async function confirmPayment(ref: PaymentRef, extra: Extra = {}) {
  if (![ref.orderNumber, ref.transactionNsu, ref.slug].every(okRef)) return "invalid" as const;
  const order = await prisma.order.findUnique({ where: { orderNumber: ref.orderNumber } });
  if (!order) return "not_found" as const;
  if (order.paymentStatus === "APPROVED" || order.paymentStatus === "REFUNDED") return "paid" as const;
  return applyCheck(order, ref, await paymentCheck(ref), extra);
}

async function applyCheck(order: Order, ref: PaymentRef, check: PaymentCheck, extra: Extra) {
  const seen = {
    invoiceSlug: ref.slug,
    transactionNsu: ref.transactionNsu,
    captureMethod: check.captureMethod,
    installments: check.installments,
    paidAmount: check.paidAmount ? check.paidAmount / 100 : null,
    webhookAt: extra.fromWebhook ? new Date() : undefined,
  };
  // Não pago: guarda os ids para o admin poder "Conferir agora" depois. Comprovante só de pagamento confirmado.
  if (!isPaidInFull(check, Number(order.total))) {
    await prisma.order.update({ where: { id: order.id }, data: seen });
    return "unpaid" as const;
  }
  if (order.status === "PENDING") await toPaid(order.id);
  // Pedido já cancelado (reserva venceu) e pago depois: fica APPROVED + CANCELLED e o admin vê em "Conferir".
  await prisma.order.update({
    where: { id: order.id },
    data: { ...seen, receiptUrl: httpsUrl(extra.receiptUrl), paymentStatus: "APPROVED", paidAt: order.paidAt ?? new Date(), paymentMethod: check.captureMethod === "credit_card" ? "CREDIT_CARD" : "PIX" },
  });
  return "paid" as const;
}

async function toPaid(orderId: string) {
  try {
    await changeOrderStatus(orderId, "PAID");
  } catch (e) {
    if (!(e instanceof CheckoutError)) throw e; // outra requisição confirmou antes
  }
}

// Link do pedido pendente: reaproveita o salvo ou cria outro (se a criação falhou na hora do checkout).
export async function payLinkFor(orderNumber: string) {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order || order.status !== "PENDING" || (order.pixExpiresAt && order.pixExpiresAt < new Date())) return null;
  if (order.checkoutUrl) return order.checkoutUrl;
  const url = await createCheckoutLink(order);
  await prisma.order.update({ where: { id: order.id }, data: { checkoutUrl: url } });
  return url;
}

export async function recheckPayment(orderId: string) {
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o?.transactionNsu || !o.invoiceSlug) throw new CheckoutError("Sem dados da InfinitePay para conferir: o cliente ainda não pagou.");
  return confirmPayment({ orderNumber: o.orderNumber, transactionNsu: o.transactionNsu, slug: o.invoiceSlug });
}

// Estorno acontece no app da InfinitePay. Aqui só registra, cancela o pedido e devolve o estoque quando ainda dá.
export async function markRefunded(orderId: string) {
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o) throw new CheckoutError("Pedido não encontrado.");
  if (o.paymentStatus !== "APPROVED") throw new CheckoutError("Só pagamento aprovado pode ser estornado.");
  if (NEXT_STATUS[o.status].includes("CANCELLED")) await changeOrderStatus(o.id, "CANCELLED");
  await prisma.order.update({ where: { id: o.id }, data: { paymentStatus: "REFUNDED", refundedAt: new Date() } });
}

export type PayState = "aguardando" | "conferir" | "aprovado" | "sem-pagamento" | "estornado";

export function payState(o: Pick<Order, "status" | "paymentStatus" | "webhookAt">): PayState {
  if (o.paymentStatus === "REFUNDED") return "estornado";
  if (o.paymentStatus === "APPROVED") return o.status === "CANCELLED" ? "conferir" : "aprovado";
  if (o.webhookAt) return "conferir";
  return o.status === "PENDING" ? "aguardando" : "sem-pagamento";
}
