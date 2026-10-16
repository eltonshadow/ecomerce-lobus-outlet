import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NEXT_STATUS } from "@/lib/orders";
import { changeOrderStatusAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { STATUS_LABEL, PAYMENT_LABEL, brl, dateTime } from "@/components/admin/labels";

export const metadata = { title: "Pedido | Painel LOBUS" };

const ACTION_LABEL: Record<string, string> = {
  PAID: "Marcar como pago",
  PREPARING: "Iniciar separação",
  READY_FOR_PICKUP: "Pronto p/ retirada",
  OUT_FOR_DELIVERY: "Saiu p/ entrega",
  DELIVERED: "Marcar como entregue",
  CANCELLED: "Cancelar pedido",
};

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const o = await prisma.order.findUnique({ where: { id }, include: { items: true, coupon: true } });
  if (!o) notFound();
  const canEdit = admin.role !== "ATENDIMENTO";
  const next = NEXT_STATUS[o.status];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="text-2xl font-semibold font-mono">{o.orderNumber}</h1>
        <span className="px-2 py-1 rounded bg-surface-container-high text-primary text-sm">{STATUS_LABEL[o.status]}</span>
        <span className="text-sm text-on-surface-variant">Pagamento: {PAYMENT_LABEL[o.paymentStatus]} (Pix{o.paymentGatewayId ? "" : " simulado"})</span>
      </div>
      <p className="text-sm text-on-surface-variant">
        Criado em {dateTime(o.createdAt)}
        {o.paidAt && <> · Pago em {dateTime(o.paidAt)}</>}
        {o.status === "PENDING" && o.pixExpiresAt && <> · Pix vence {dateTime(o.pixExpiresAt)}</>}
      </p>

      {canEdit && next.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {next.map((to) => (
            <ActionForm
              key={to}
              action={changeOrderStatusAction}
              submitLabel={ACTION_LABEL[to]}
              confirm={to === "CANCELLED" ? "Cancelar o pedido e devolver os itens ao estoque?" : undefined}
              className="flex flex-col gap-1"
              submitClassName={
                to === "CANCELLED"
                  ? "px-4 py-2 border border-error text-error rounded text-sm disabled:opacity-50"
                  : "px-4 py-2 bg-primary text-on-primary font-semibold rounded text-sm disabled:opacity-50"
              }
            >
              <input type="hidden" name="orderId" value={o.id} />
              <input type="hidden" name="status" value={to} />
            </ActionForm>
          ))}
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface-container p-4 rounded">
          <h2 className="font-semibold mb-2">Cliente</h2>
          <p className="text-sm">{o.customerName}</p>
          <p className="text-sm">WhatsApp: {o.customerPhone}</p>
          <p className="text-sm">E-mail: {o.customerEmail}</p>
          <p className="text-sm">CPF: {o.customerCpf}</p>
        </div>
        <div className="bg-surface-container p-4 rounded">
          <h2 className="font-semibold mb-2">{o.deliveryMethod === "PICKUP" ? "Retirada na loja" : "Entrega por motoboy"}</h2>
          {o.deliveryMethod === "MOTOBOY" ? (
            <>
              <p className="text-sm">{o.shippingStreet}, {o.shippingNumber}{o.shippingComplement ? ` - ${o.shippingComplement}` : ""}</p>
              <p className="text-sm">{o.shippingNeighborhood} · {o.shippingCity}/{o.shippingState} · CEP {o.shippingCep}</p>
              <p className="text-sm text-on-surface-variant">Zona: {o.deliveryZoneName}</p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">Cliente retira no balcão com o número do pedido.</p>
          )}
          {o.deliveryNotes && <p className="text-sm mt-2">Obs.: {o.deliveryNotes}</p>}
        </div>
      </section>

      <section className="bg-surface-container p-4 rounded overflow-x-auto">
        <h2 className="font-semibold mb-2">Itens</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-on-surface-variant">
            <tr><th className="py-1 pr-4">Produto</th><th className="py-1 pr-4">SKU</th><th className="py-1 pr-4">Tam.</th><th className="py-1 pr-4 text-right">Qtd</th><th className="py-1 pr-4 text-right">Unit.</th><th className="py-1 text-right">Total</th></tr>
          </thead>
          <tbody>
            {o.items.map((i) => (
              <tr key={i.id} className="border-t border-outline-variant/40">
                <td className="py-1 pr-4">{i.productName}{i.colorName ? ` (${i.colorName})` : ""}</td>
                <td className="py-1 pr-4 font-mono">{i.sku}</td>
                <td className="py-1 pr-4">{i.size}</td>
                <td className="py-1 pr-4 text-right">{i.quantity}</td>
                <td className="py-1 pr-4 text-right">{brl(i.unitPrice)}</td>
                <td className="py-1 text-right">{brl(i.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 text-sm grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 max-w-xs ml-auto">
          <dt>Subtotal</dt><dd className="text-right">{brl(o.subtotal)}</dd>
          <dt>Desconto{o.coupon ? ` (${o.coupon.code})` : ""}</dt><dd className="text-right">- {brl(o.discountValue)}</dd>
          <dt>Frete</dt><dd className="text-right">{brl(o.deliveryFee)}</dd>
          <dt className="font-semibold">Total</dt><dd className="text-right font-semibold text-primary">{brl(o.total)}</dd>
        </dl>
      </section>

      <Link href="/admin" className="text-sm underline">← Voltar para pedidos</Link>
    </div>
  );
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Carregando pedido...</p>}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
