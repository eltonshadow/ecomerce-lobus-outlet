import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicOrder } from "@/actions/store";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";
import { CopyPix, RefreshStatus } from "./PixActions";
import { ORDER_STATUS_LABEL, ORDER_STEPS, ORDER_STEPS_DELIVERY } from "@/lib/order-status";
import { SiteHeader } from "@/components/SiteHeader";

type Params = { params: Promise<{ orderNumber: string }> };

const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;


export default function OrderPage({ params }: Params) {
  return (
    <main className="flex-1 bg-background text-on-surface">
      <SiteHeader />
      <Suspense fallback={<p className="max-w-3xl mx-auto px-gutter-mobile py-space-xl text-on-surface-variant">Carregando pedido...</p>}>
        <OrderDetails params={params} />
      </Suspense>
    </main>
  );
}

async function OrderDetails({ params }: Params) {
  await connection();
  const { orderNumber } = await params;
  const order = await getPublicOrder(decodeURIComponent(orderNumber));
  if (!order) notFound();

  const whatsappText = encodeURIComponent(`Olá! Sou ${order.firstName}, meu pedido na LOBUS Outlet é o ${order.orderNumber}.`);
  const expiresAt = order.pixExpiresAt ? new Date(order.pixExpiresAt) : null;
  const expiresLabel = expiresAt
    ? expiresAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-gutter-mobile py-space-xl flex flex-col gap-space-lg">
      <div>
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Pedido {order.orderNumber}</span>
        <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg uppercase mt-1">
          {order.status === "PENDING" ? `${order.firstName}, falta só o Pix` : ORDER_STATUS_LABEL[order.status]}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Status: <strong className="text-on-surface">{ORDER_STATUS_LABEL[order.status]}</strong>
        </p>
      </div>

      {order.status !== "CANCELLED" && <Timeline status={order.status} delivery={order.deliveryMethod === "MOTOBOY"} />}

      {order.status === "PENDING" && order.pixCopyPaste && (
        <section className="bg-surface-container rounded-lg p-space-lg flex flex-col gap-space-md">
          <p role="note" className="font-body-sm text-body-sm bg-error-container text-on-error-container rounded p-space-sm">
            PIX SIMULADO: o gateway de pagamento ainda não está ligado. Este código não cobra de verdade. A loja confirma o pagamento manualmente.
          </p>
          <div>
            <h2 className="font-headline-sm text-headline-sm uppercase">Pix copia e cola</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Total: <strong className="text-primary">{brl(order.total)}</strong>
              {expiresLabel && <> · válido até {expiresLabel}. Depois disso o pedido é cancelado e as peças voltam ao estoque.</>}
            </p>
          </div>
          <textarea
            readOnly
            aria-label="Código Pix copia e cola"
            value={order.pixCopyPaste}
            rows={3}
            className="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm p-space-sm rounded break-all"
          />
          <CopyPix code={order.pixCopyPaste} />
          <RefreshStatus />
        </section>
      )}

      {order.status === "CANCELLED" && (
        <p className="bg-surface-container rounded-lg p-space-md font-body-md text-body-md text-on-surface-variant">
          Este pedido foi cancelado. Se o Pix venceu, é só montar a sacola de novo ou falar com a gente no WhatsApp.
        </p>
      )}

      <section className="bg-surface-container rounded-lg p-space-lg">
        <h2 className="font-headline-sm text-headline-sm uppercase mb-space-sm">Itens</h2>
        <ul className="flex flex-col gap-space-xs">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-space-md font-body-md text-body-md">
              <span>
                {it.quantity}x {it.productName} <span className="text-on-surface-variant">(Tam. {it.size})</span>
              </span>
              <span className="whitespace-nowrap">{brl(it.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-space-md pt-space-sm border-t border-outline-variant flex flex-col gap-1 font-body-sm text-body-sm">
          <div className="flex justify-between"><dt className="text-on-surface-variant">Subtotal</dt><dd>{brl(order.subtotal)}</dd></div>
          {order.discountValue > 0 && (
            <div className="flex justify-between"><dt className="text-on-surface-variant">Desconto</dt><dd>- {brl(order.discountValue)}</dd></div>
          )}
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">{order.deliveryMethod === "PICKUP" ? "Retirada na loja" : "Entrega por motoboy"}</dt>
            <dd>{order.deliveryFee === 0 ? "Grátis" : brl(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between font-headline-sm text-headline-sm pt-1"><dt>Total</dt><dd className="text-primary">{brl(order.total)}</dd></div>
        </dl>
      </section>

      <section className="bg-surface-container rounded-lg p-space-lg font-body-md text-body-md flex flex-col gap-space-xs">
        {order.deliveryMethod === "PICKUP" ? (
          <>
            <h2 className="font-headline-sm text-headline-sm uppercase">Retirada na loja</h2>
            <p>{PICKUP_STORE_INFO.address}</p>
            <p className="text-on-surface-variant">{PICKUP_STORE_INFO.openingHours}</p>
            <p className="text-on-surface-variant">Apresente o número {order.orderNumber} no balcão. Avisamos no WhatsApp quando estiver pronto.</p>
          </>
        ) : (
          <>
            <h2 className="font-headline-sm text-headline-sm uppercase">Entrega por motoboy</h2>
            {order.deliveryZoneName && <p>{order.deliveryZoneName}</p>}
            <p className="text-on-surface-variant">Depois do pagamento aprovado, avisamos no WhatsApp quando o motoboy sair.</p>
          </>
        )}
      </section>

      <a
        href={`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-label-lg text-label-lg uppercase tracking-wider transition-colors"
      >
        Falar com a loja no WhatsApp
      </a>
    </div>
  );
}

function Timeline({ status, delivery }: { status: string; delivery: boolean }) {
  const steps = delivery ? ORDER_STEPS_DELIVERY : ORDER_STEPS;
  const current = steps.indexOf(status as (typeof steps)[number]);
  return (
    <ol aria-label="Andamento do pedido" className="grid grid-cols-5 gap-1">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined} className="flex flex-col gap-2">
          <span className={`h-1 ${i <= current ? "bg-gold" : "bg-line"}`} />
          <span className={`font-body text-[11px] font-semibold uppercase tracking-[0.08em] leading-tight ${i === current ? "text-gold" : i < current ? "text-paper" : "text-muted"}`}>
            {ORDER_STATUS_LABEL[s]}
          </span>
        </li>
      ))}
    </ol>
  );
}
