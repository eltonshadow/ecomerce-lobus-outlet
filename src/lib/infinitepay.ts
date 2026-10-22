import type { Order, OrderItem } from "@prisma/client";
import { headers } from "next/headers";

// Checkout Integrado da InfinitePay: https://www.infinitepay.io/checkout-documentacao
// Sem INFINITEPAY_HANDLE a loja segue no Pix simulado.
// INFINITEPAY_API_BASE existe para apontar para um stub local nos testes.
const API = () => process.env.INFINITEPAY_API_BASE || "https://api.checkout.infinitepay.io";
const handle = () => (process.env.INFINITEPAY_HANDLE ?? "").trim().replace(/^\$/, "");

export const infinitePayEnabled = () => handle() !== "";

const cents = (n: number) => Math.round(n * 100);

// URL pública da loja. Em produção vem de APP_URL (nunca do Host da requisição, que o cliente controla).
export async function appUrl() {
  const fixed = process.env.APP_URL?.replace(/\/$/, "");
  if (fixed) return fixed;
  if (process.env.NODE_ENV === "production") throw new Error("APP_URL não configurada");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

type LinkItem = { quantity: number; price: number; description: string };

// Itens em centavos somando exatamente o total. Com cupom, vira uma linha só (desconto não é item).
export function linkItems(order: Pick<Order, "orderNumber" | "total" | "deliveryFee" | "discountValue">, items: Pick<OrderItem, "productName" | "size" | "quantity" | "unitPrice">[]): LinkItem[] {
  if (Number(order.discountValue) > 0) return [{ quantity: 1, price: cents(Number(order.total)), description: `Pedido ${order.orderNumber} (com cupom)` }];
  const lines = items.map((i) => ({ quantity: i.quantity, price: cents(Number(i.unitPrice)), description: `${i.productName} (${i.size})` }));
  if (Number(order.deliveryFee) > 0) lines.push({ quantity: 1, price: cents(Number(order.deliveryFee)), description: "Entrega por motoboy" });
  return lines;
}

async function post(path: string, body: unknown) {
  const r = await fetch(`${API()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const reply = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`InfinitePay ${path} respondeu ${r.status}`);
  return reply as Record<string, unknown>;
}

// Cria o link de pagamento. A doc não fixa o nome do campo da URL na resposta, por isso a lista.
export async function createCheckoutLink(order: Order & { items: OrderItem[] }) {
  const base = await appUrl();
  const created = await post("/links", {
    handle: handle(),
    order_nsu: order.orderNumber,
    items: linkItems(order, order.items),
    redirect_url: `${base}/pedido/${order.orderNumber}`,
    webhook_url: `${base}/api/webhooks/infinitepay`,
    // Endereço fica fora: entrega é da loja, e o link não precisa expor onde o cliente mora.
    customer: { name: order.customerName, email: order.customerEmail, phone_number: `+55${order.customerPhone.replace(/^55/, "")}` },
  });
  const url = [created.url, created.payment_url, created.checkout_url, created.link].find((v): v is string => typeof v === "string" && v.startsWith("https://"));
  if (!url) throw new Error(`InfinitePay /links sem URL na resposta (campos: ${Object.keys(created).join(", ")})`);
  return url;
}

export type PaymentRef = { orderNumber: string; transactionNsu: string; slug: string };
export type PaymentCheck = { paid: boolean; amount: number; paidAmount: number; installments: number | null; captureMethod: string | null };

export async function paymentCheck(ref: PaymentRef): Promise<PaymentCheck> {
  const d = await post("/payment_check", { handle: handle(), order_nsu: ref.orderNumber, transaction_nsu: ref.transactionNsu, slug: ref.slug });
  return {
    paid: d.success === true && d.paid === true,
    amount: Number(d.amount ?? 0),
    paidAmount: Number(d.paid_amount ?? 0),
    installments: typeof d.installments === "number" ? d.installments : null,
    captureMethod: typeof d.capture_method === "string" ? d.capture_method : null,
  };
}

// Pago de verdade = consulta diz paid e o valor bate com o total do pedido (em centavos).
export function isPaidInFull(check: PaymentCheck, orderTotal: number) {
  return check.paid && check.amount === cents(orderTotal);
}
