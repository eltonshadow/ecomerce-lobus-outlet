import { confirmPayment } from "@/lib/payments";

// Aviso de pagamento aprovado da InfinitePay. A doc pede 200 rápido e reenvia quando recebe 400.
// O corpo não tem assinatura: serve só para disparar a conferência no payment_check.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new Response("corpo inválido", { status: 400 });
  try {
    const r = await confirmPayment(
      { orderNumber: body.order_nsu, transactionNsu: body.transaction_nsu, slug: body.invoice_slug ?? body.slug },
      { receiptUrl: body.receipt_url, fromWebhook: true },
    );
    // Pedido desconhecido não melhora com reenvio.
    if (r === "not_found" || r === "invalid") console.warn("webhook InfinitePay ignorado:", r, body.order_nsu);
    return new Response("ok");
  } catch (e) {
    console.error("webhook InfinitePay: conferência falhou, pedindo reenvio", e);
    return new Response("tente de novo", { status: 400 });
  }
}
