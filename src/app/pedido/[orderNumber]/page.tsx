import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicOrder } from "@/actions/store";
import { confirmPayment } from "@/lib/payments";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";
import { AutoRefresh, CopyPix, PayButton, RefreshStatus } from "./PixActions";
import {
  ORDER_STATUS_LABEL,
  ORDER_STEPS,
  ORDER_STEPS_DELIVERY,
} from "@/lib/order-status";
import { SiteHeader } from "@/components/SiteHeader";
import { ui, brl } from "@/design/ui";

type Search = Record<string, string | string[] | undefined>;
type Props = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<Search>;
};

const METHOD_LABEL: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
};

export default function OrderPage(props: Props) {
  return (
    <main className="flex-1 bg-ink text-paper">
      <SiteHeader />
      <Suspense
        fallback={
          <p className={`${ui.container} py-12 text-muted`}>
            Carregando pedido...
          </p>
        }
      >
        <OrderDetails {...props} />
      </Suspense>
    </main>
  );
}

// Volta do checkout da InfinitePay: a query traz só identificadores. confirmPayment confere tudo no payment_check.
async function confirmFromRedirect(orderNumber: string, q: Search) {
  const s = (k: string) => (typeof q[k] === "string" ? (q[k] as string) : "");
  if (s("order_nsu") !== orderNumber || !s("transaction_nsu")) return;
  try {
    await confirmPayment(
      { orderNumber, transactionNsu: s("transaction_nsu"), slug: s("slug") },
      { receiptUrl: s("receipt_url") },
    );
  } catch (e) {
    console.error(
      "Conferência na volta do pagamento falhou; o webhook confirma depois.",
      e,
    );
  }
}

async function OrderDetails({ params, searchParams }: Props) {
  await connection();
  const orderNumber = decodeURIComponent((await params).orderNumber);
  await confirmFromRedirect(orderNumber, await searchParams);
  const order = await getPublicOrder(orderNumber);
  if (!order) notFound();

  const delivery = order.deliveryMethod === "MOTOBOY";
  const pending = order.status === "PENDING";
  const paid = order.paymentStatus === "APPROVED";
  const whatsappText = encodeURIComponent(
    `Olá! Sou ${order.firstName}, meu pedido na Tropa da Mauá é o ${order.orderNumber}.`,
  );
  const hhmm = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  const createdLabel = new Date(order.createdAt)
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    })
    .replace(",", " às");
>>>>>>> origin/main

  return (
    <div
      className={`${ui.container} py-10 lg:py-14 grid gap-10 lg:grid-cols-[1fr_440px] lg:gap-16 items-start`}
    >
      <div className="flex flex-col gap-6 min-w-0">
        <div>
          <p className={ui.eyebrow}>
            Pedido {order.orderNumber} · {createdLabel}
          </p>
          <h1 className="font-display uppercase text-[clamp(3rem,8vw,7rem)] leading-[0.86] mt-3">
            {pending ? (
              <>
                Falta só <span className="text-gold">pagar</span>
              </>
            ) : paid && order.status === "PAID" ? (
              <>
                Pagamento <span className="text-gold">aprovado</span>
              </>
            ) : (
              ORDER_STATUS_LABEL[order.status]
            )}
          </h1>
        </div>

        {paid && (
          <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-4">
            <Info
              label="Pago com"
              value={`${METHOD_LABEL[order.captureMethod ?? ""] ?? "Pix"}${order.installments && order.installments > 1 ? ` · ${order.installments}x` : ""}`}
            />
            <Info label="Valor" value={brl(order.total)} />
            <Info
              label="Entrega"
              value={delivery ? "Motoboy" : "Retirada na loja"}
            />
          </dl>
        )}

        {order.status !== "CANCELLED" && (
          <Timeline status={order.status} delivery={delivery} />
        )}

        {pending && order.payOnline && (
          <section className="flex flex-col gap-4 max-w-xl">
            <div className="bg-gold text-ink p-4 flex flex-col gap-1">
              <b className="font-display text-headline-md uppercase">
                Aguardando pagamento
              </b>
              {order.pixExpiresAt && (
                <span className="text-body-md">
                  As peças ficam reservadas para você até as{" "}
                  <strong>{hhmm(order.pixExpiresAt)}</strong>.
                </span>
              )}
            </div>
            <p className="text-muted text-body-md">
              Pix, crédito à vista ou parcelado, Apple Pay e Google Pay, tudo no
              checkout seguro da InfinitePay.
            </p>
            <PayButton
              orderNumber={order.orderNumber}
              label={`Pagar ${brl(order.total)}`}
            />
            <p className="text-body-sm text-muted text-center">
              Já pagou? A página atualiza sozinha em alguns segundos.
            </p>
            <AutoRefresh />
          </section>
        )}

        {pending && !order.payOnline && order.pixCopyPaste && (
          <section className="border border-line p-5 flex flex-col gap-4 max-w-xl">
            <p
              role="note"
              className="text-body-sm border border-danger text-danger p-3"
            >
              PIX SIMULADO: o gateway de pagamento ainda não está ligado. Este
              código não cobra de verdade. A loja confirma o pagamento
              manualmente.
            </p>
            <div>
              <h2 className="font-display text-headline-md uppercase">
                Pix copia e cola
              </h2>
              <p className="text-body-sm text-muted">
                Total: <strong className="text-gold">{brl(order.total)}</strong>
                {order.pixExpiresAt && (
                  <>
                    {" "}
                    · válido até {hhmm(order.pixExpiresAt)}. Depois disso o
                    pedido é cancelado e as peças voltam ao estoque.
                  </>
                )}
              </p>
            </div>
            <textarea
              readOnly
              aria-label="Código Pix copia e cola"
              value={order.pixCopyPaste}
              rows={3}
              className={`${ui.input} font-mono text-body-sm break-all`}
            />
            <CopyPix code={order.pixCopyPaste} />
            <RefreshStatus />
          </section>
        )}

        {order.status === "CANCELLED" && (
          <p className="border border-line p-4 text-muted">
            Este pedido foi cancelado. Se a reserva venceu, é só montar a sacola
            de novo ou falar com a gente no WhatsApp.
          </p>
        )}

        {!pending && order.status !== "CANCELLED" && (
          <p className="text-muted max-w-xl">
            {delivery
              ? "Avisamos no WhatsApp quando o motoboy sair."
              : `Retire no balcão: ${PICKUP_STORE_INFO.address}. ${PICKUP_STORE_INFO.openingHours}. Apresente o número ${order.orderNumber}.`}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {order.receiptUrl && (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={ui.btnGhost}
            >
              Ver comprovante
            </a>
          )}
          <Link href="/conta" className={`${ui.btnGhost} border-line`}>
            Meus pedidos
          </Link>
        </div>
      </div>

      <section
        aria-label="Resumo do pedido"
        className={`${ui.tagCard} px-6 pt-10 pb-6 flex flex-col gap-4`}
      >
        <span
          aria-hidden="true"
          className={`${ui.hole} top-3 left-1/2 -ml-2`}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[22px] font-semibold">
            {order.orderNumber}
          </span>
          {paid && (
            <span className="px-2 py-1 bg-ink text-paper font-body text-label-sm uppercase">
              Pago
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-3">
          {order.items.map((it, i) => (
            <li
              key={i}
              className="grid grid-cols-[48px_1fr_auto] gap-3 items-center"
            >
              {it.image ? (
                <img
                  src={it.image}
                  alt=""
                  className="w-12 h-12 object-cover bg-paper"
                />
              ) : (
                <span className="w-12 h-12 bg-paper" />
              )}
              <span className="min-w-0">
                <b className="block font-mono text-[13px] font-semibold uppercase leading-tight">
                  {it.productName}
                </b>
                <small className="font-mono text-[12px] text-stroke">
                  {[it.colorName, it.size, `×${it.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </span>
              <span className="font-display text-[18px] tabular-nums">
                {brl(it.totalPrice).replace("R$ ", "")}
              </span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col text-body-sm">
          {order.discountValue > 0 && (
            <Row label="Desconto" value={`- ${brl(order.discountValue)}`} />
          )}
          <Row
            label={
              delivery
                ? `Entrega${order.deliveryZoneName ? ` · ${order.deliveryZoneName}` : ""}`
                : "Retirada na loja"
            }
            value={order.deliveryFee === 0 ? "Grátis" : brl(order.deliveryFee)}
          />
        </dl>
        <div className="flex items-baseline justify-between">
          <span className="font-body text-label-sm uppercase">
            {paid ? "Total pago" : "Total"}
          </span>
          <span className="font-display text-[40px] leading-none tabular-nums">
            {brl(order.total)}
          </span>
        </div>
        <a
          href={`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className={ui.btnInk}
        >
          Falar com a loja no WhatsApp
        </a>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-body text-label-sm uppercase text-muted">{label}</dt>
      <dd className="font-display text-[24px] leading-none uppercase tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink/15 py-2">
      <dt className="text-stroke">{label}</dt>
      <dd className="whitespace-nowrap">{value}</dd>
    </div>
  );
}

function Timeline({ status, delivery }: { status: string; delivery: boolean }) {
  const steps = delivery ? ORDER_STEPS_DELIVERY : ORDER_STEPS;
  const current = steps.indexOf(status as (typeof steps)[number]);
  return (
    <div className="flex flex-col gap-2">
      <ol aria-label="Andamento do pedido" className="grid grid-cols-5 gap-1.5">
        {steps.map((s, i) => (
          <li
            key={s}
            aria-current={i === current ? "step" : undefined}
            className="flex flex-col gap-2"
          >
            <span className={`h-1 ${i <= current ? "bg-gold" : "bg-line"}`} />
            <span
              className={`hidden sm:block font-body text-label-sm uppercase leading-tight ${i === current ? "text-paper" : i < current ? "text-muted" : "text-stroke"}`}
            >
              {ORDER_STATUS_LABEL[s]}
            </span>
          </li>
        ))}
      </ol>
      <p className="sm:hidden font-body text-label-sm uppercase text-muted">
        Passo {current + 1} de {steps.length} ·{" "}
        {ORDER_STATUS_LABEL[steps[current]]}
      </p>
    </div>
  );
}
