import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/orders";
import { infinitePayEnabled } from "@/lib/infinitepay";
import { payState, type PayState } from "@/lib/payments";
import { markRefundedAction, recheckPaymentAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminHead, Pill } from "@/components/admin/AdminHead";
import { brl } from "@/components/admin/labels";
import { ui } from "@/design/ui";

export const metadata = { title: "Pagamentos | Painel LOBUS" };

type Props = { searchParams: Promise<{ f?: string; m?: string; q?: string }> };

const STATES: [PayState, string][] = [
  ["aguardando", "Aguardando"],
  ["conferir", "Conferir"],
  ["aprovado", "Aprovados"],
  ["sem-pagamento", "Sem pagamento"],
  ["estornado", "Estornados"],
];
const LABEL: Record<PayState, string> = { aguardando: "Aguardando", conferir: "Conferir", aprovado: "Aprovado", "sem-pagamento": "Sem pagamento", estornado: "Estornado" };
const badge = "px-2 py-1 font-body text-label-sm uppercase whitespace-nowrap";
const TONE: Record<PayState, string> = { aguardando: ui.stAct, conferir: `${badge} bg-ink text-gold`, aprovado: `${badge} bg-ink text-paper`, "sem-pagamento": ui.stDone, estornado: ui.stDone };
const METHOD: Record<string, string> = { pix: "Pix", credit_card: "Crédito" };

const when = (d: Date) => d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).replace(",", "");
const isToday = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) === new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const sum = (xs: { total: unknown }[]) => xs.reduce((a, o) => a + Number(o.total), 0);

async function load() {
  await expireStaleOrders();
  // ponytail: últimos 300 pedidos filtrados em memória; paginar quando o volume pedir.
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return orders.map((o) => ({ ...o, state: payState(o) }));
}
type Row = Awaited<ReturnType<typeof load>>[number];

async function Payments({ searchParams }: Props) {
  await requireAdmin(["ADMIN"]);
  const { f, m, q } = await searchParams;
  const all = await load();
  const by = (s: PayState) => all.filter((o) => o.state === s);
  const needle = q?.trim().toLowerCase();
  const rows = all.filter(
    (o) =>
      (!f || o.state === f) &&
      (!m || o.captureMethod === m) &&
      (!needle || [o.orderNumber, o.customerName, o.transactionNsu ?? ""].some((x) => x.toLowerCase().includes(needle))),
  );
  const paidToday = by("aprovado").filter((o) => o.paidAt && isToday(o.paidAt));
  const href = (p: { f?: string; m?: string }) => {
    const sp = new URLSearchParams(Object.entries({ f, m, q, ...p }).filter(([, v]) => v) as [string, string][]);
    return `/admin/pagamentos${sp.size ? `?${sp}` : ""}`;
  };
  const lastHook = all.filter((o) => o.webhookAt).sort((a, b) => b.webhookAt!.getTime() - a.webhookAt!.getTime())[0];

  return (
    <>
      <AdminHead
        eyebrow="InfinitePay · Pix e cartão"
        title="Pagamentos"
        counts={
          <>
            <span><b className="text-paper">{by("aguardando").length}</b> aguardando</span>
            <span><b className={by("conferir").length ? "text-gold" : "text-paper"}>{by("conferir").length}</b> para conferir</span>
          </>
        }
      >
        <form action="/admin/pagamentos" className="flex gap-2">
          {f && <input type="hidden" name="f" value={f} />}
          <input name="q" defaultValue={q} placeholder="Nº do pedido, cliente ou NSU" aria-label="Buscar pagamento" className={`${ui.input} w-[min(320px,80vw)]`} />
        </form>
      </AdminHead>

      <nav aria-label="Filtros" className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Pill href={href({ f: "" })} on={!f} label="Todos" count={all.length} />
        {STATES.map(([s, l]) => (
          <Pill key={s} href={href({ f: s })} on={f === s} label={l} count={by(s).length} />
        ))}
        <span className="w-px bg-line mx-1 shrink-0" />
        <Pill href={href({ m: m === "pix" ? "" : "pix" })} on={m === "pix"} label="Pix" />
        <Pill href={href({ m: m === "credit_card" ? "" : "credit_card" })} on={m === "credit_card"} label="Crédito" />
      </nav>

      <div className="grid gap-5 xl:grid-cols-[1fr_290px] items-start">
        <div className="min-w-0 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stub label="Aprovado hoje" value={brl(sum(paidToday))} note={`${paidToday.length} pagamentos`} />
            <Stub label="Para conferir" value={brl(sum(by("conferir")))} note="Aviso chegou e a consulta não confirmou, ou pago depois de cancelar" act={by("conferir").length > 0} />
            <Stub label="Links abertos" value={brl(sum(by("aguardando")))} note={`${by("aguardando").length} pedidos esperando o cliente pagar`} />
          </div>
          <div className={`${ui.tagCard} px-4 sm:pl-9 pb-2 pt-3`}>
            {[24, 200, 380].map((t) => (
              <span key={t} aria-hidden="true" className={`${ui.hole} hidden sm:block left-3 w-3.5 h-3.5`} style={{ top: t }} />
            ))}
            <div className="hidden md:grid grid-cols-[96px_minmax(0,1fr)_90px_90px_110px_130px] gap-3 py-2 border-b-2 border-ink font-body text-label-sm uppercase text-stroke">
              <span>Pedido</span><span>Cliente</span><span>Meio</span><span className="text-right">Pedido</span><span className="text-right">Pagou</span><span>Situação</span>
            </div>
            {rows.map((o) => (
              <PaymentRow key={o.id} o={o} />
            ))}
            {rows.length === 0 && <p className="py-6 text-stroke">Nenhum pagamento neste filtro.</p>}
          </div>
        </div>

        <aside className="xl:border-l xl:border-line xl:pl-5 flex flex-col gap-4 text-body-sm">
          <h2 className="font-display text-headline-md uppercase">Integração</h2>
          <dl className="border-t border-line">
            <Kv label="Conta InfinitePay" value={infinitePayEnabled() ? "Ligada (INFINITEPAY_HANDLE)" : "Desligada: loja no Pix simulado"} warn={!infinitePayEnabled()} />
            <Kv label="Aviso de pagamento" value="/api/webhooks/infinitepay" mono />
            <Kv label="Último aviso" value={lastHook ? `${when(lastHook.webhookAt!)} · ${lastHook.orderNumber}` : "nenhum ainda"} mono />
            <Kv label="Confirmação" value="Todo aviso é conferido no payment_check, com o valor, antes de liberar o pedido para separação." />
          </dl>
          <p className="border border-line p-3 text-muted">
            <b className="text-paper">Estorno não sai por aqui.</b> A API da InfinitePay não estorna. Cancele a venda no app ou no navegador em Suas vendas › Cancelar venda (crédito até 180 dias, débito até 90). Depois marque aqui como estornado para o pedido e o estoque acompanharem.
          </p>
        </aside>
      </div>
    </>
  );
}

function Stub({ label, value, note, act }: { label: string; value: string; note: string; act?: boolean }) {
  return (
    <div className={`border p-4 flex flex-col gap-1.5 ${act ? "border-gold" : "border-line"}`}>
      <span className={`font-body text-label-sm uppercase ${act ? "text-gold" : "text-muted"}`}>{label}</span>
      <span className={`font-display text-[30px] leading-none tabular-nums ${act ? "text-gold" : ""}`}>{value}</span>
      <small className="text-body-sm text-muted">{note}</small>
    </div>
  );
}

function Kv({ label, value, mono, warn }: { label: string; value: string; mono?: boolean; warn?: boolean }) {
  return (
    <div className="py-2.5 border-b border-line flex flex-col gap-0.5">
      <dt className="font-body text-label-sm uppercase text-muted">{label}</dt>
      <dd className={`${mono ? "font-mono break-all" : ""} ${warn ? "text-danger" : ""}`}>{value}</dd>
    </div>
  );
}

function PaymentRow({ o }: { o: Row }) {
  const paid = o.paidAmount ? Number(o.paidAmount) : null;
  const extra = paid !== null ? paid - Number(o.total) : 0;
  return (
    <details className="group border-b border-ink/15 last:border-0">
      <summary className="list-none cursor-pointer grid grid-cols-[1fr_auto] md:grid-cols-[96px_minmax(0,1fr)_90px_90px_110px_130px] gap-x-3 gap-y-1 items-center py-3 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[14px] font-semibold">{o.orderNumber}</span>
        <span className="min-w-0 order-3 md:order-none col-span-2 md:col-span-1">
          <b className="block truncate font-semibold">{o.customerName}</b>
          <small className="block truncate text-body-sm text-stroke">{o.deliveryMethod === "PICKUP" ? "Retirada" : `Motoboy${o.deliveryZoneName ? ` · ${o.deliveryZoneName}` : ""}`} · {when(o.createdAt)}</small>
        </span>
        <span className="hidden md:block font-mono text-[12px] font-semibold uppercase">
          {o.captureMethod ? METHOD[o.captureMethod] ?? o.captureMethod : "—"}
          {o.installments && o.installments > 1 && <small className="block font-normal normal-case text-stroke">{o.installments}x</small>}
        </span>
        <span className="hidden md:block text-right font-display text-[18px] tabular-nums">{brl(o.total).replace("R$ ", "")}</span>
        <span className={`hidden md:block text-right font-display text-[18px] tabular-nums ${paid === null ? "text-stroke" : ""}`}>
          {paid === null ? "—" : brl(paid).replace("R$ ", "")}
          {extra > 0.005 && <small className="block font-mono text-[12px] text-stroke">+{brl(extra).replace("R$ ", "")} juros</small>}
        </span>
        <span className={`${TONE[o.state]} justify-self-end md:justify-self-start`}>{LABEL[o.state]}</span>
      </summary>
      <PaymentDetail o={o} />
    </details>
  );
}

function PaymentDetail({ o }: { o: Row }) {
  const fields: [string, string | null][] = [
    ["order_nsu", o.orderNumber],
    ["invoice_slug", o.invoiceSlug],
    ["transaction_nsu", o.transactionNsu],
    ["capture_method", o.captureMethod],
    ["installments", o.installments?.toString() ?? null],
    ["paid_amount", o.paidAmount ? brl(o.paidAmount) : null],
    ["aviso recebido", o.webhookAt ? when(o.webhookAt) : null],
    ["status do pedido", o.status],
  ];
  return (
    <div className="pb-4 grid gap-4 md:grid-cols-[1fr_auto]">
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
        {fields.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="font-mono text-[12px] text-stroke">{k}</dt>
            <dd className="font-mono text-[13px] break-all">{v ?? "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap md:flex-col gap-2 items-start">
        {o.transactionNsu && o.state !== "estornado" && (
          <ActionForm action={recheckPaymentAction} submitLabel="Conferir agora" submitClassName={ui.btnInk} className="flex flex-col gap-1">
            <input type="hidden" name="orderId" value={o.id} />
          </ActionForm>
        )}
        {o.receiptUrl && (
          <a href={o.receiptUrl} target="_blank" rel="noopener noreferrer" className={ui.btnInkGhost}>
            Ver comprovante
          </a>
        )}
        {o.paymentStatus === "APPROVED" && (
          <ActionForm action={markRefundedAction} submitLabel="Marcar estornado" submitClassName={ui.btnInkGhost} confirm={`Marcar ${o.orderNumber} como estornado? Faça o estorno no app da InfinitePay antes.`} className="flex flex-col gap-1">
            <input type="hidden" name="orderId" value={o.id} />
          </ActionForm>
        )}
      </div>
    </div>
  );
}

export default function PagamentosPage(props: Props) {
  return (
    <Suspense fallback={<p className="text-muted">Carregando pagamentos...</p>}>
      <Payments {...props} />
    </Suspense>
  );
}
