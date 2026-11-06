import { Suspense } from "react";
import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/orders";
import { changeOrderStatusAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminHead, Pill } from "@/components/admin/AdminHead";
import { STATUS_LABEL, brl, inputCls, nextStep } from "@/components/admin/labels";
import { ui } from "@/design/ui";

export const metadata = { title: "Pedidos | Painel Tropa da Mauá" };

type SP = Promise<{ status?: string; q?: string; erro?: string }>;

const FINAL: OrderStatus[] = ["DELIVERED", "CANCELLED"];
// Quantas das 4 etapas (pago, separação, pronto/saiu, entregue) o pedido já cumpriu.
const STEPS_DONE: Record<OrderStatus, number> = { PENDING: 0, PAID: 1, PREPARING: 2, READY_FOR_PICKUP: 3, OUT_FOR_DELIVERY: 3, DELIVERED: 4, CANCELLED: 0 };
const stClass = (s: OrderStatus) => (s === "PENDING" ? ui.stAct : FINAL.includes(s) ? ui.stDone : ui.stRun);
const time = (d: Date, withDay: boolean) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", ...(withDay ? { day: "2-digit", month: "2-digit" } : {}) }).replace(",", "");
const phone = (p: string) => (p.length === 11 ? `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}` : p);

const withItems = {
  items: { include: { variant: { select: { product: { select: { images: { where: { isMain: true }, take: 1, select: { imageUrl: true } } } } } } } },
} satisfies Prisma.OrderInclude;
type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof withItems }>;

function Ticket({ o, canEdit }: { o: OrderWithItems; canEdit: boolean }) {
  const next = canEdit ? nextStep(o.status, o.deliveryMethod) : null;
  const today = new Date().toDateString() === o.createdAt.toDateString();
  return (
    <article className={`${ui.tagCard} flex flex-col pt-8 px-[18px] pb-4`}>
      <span aria-hidden="true" className={`${ui.hole} top-3 left-1/2 -ml-2`} />
      <div className="flex items-center justify-between gap-2">
        <span className={stClass(o.status)}>{STATUS_LABEL[o.status]}</span>
        <span className="font-mono text-label-sm text-stroke whitespace-nowrap">{time(o.createdAt, !today)}</span>
      </div>
      <div aria-hidden="true" className="grid grid-cols-4 gap-1 mt-2 mb-3">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-[3px] ${n <= STEPS_DONE[o.status] ? "bg-ink" : "bg-muted"}`} />
        ))}
      </div>
      <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-headline-sm hover:underline underline-offset-4">{o.orderNumber}</Link>
      <div className="flex items-baseline justify-between gap-2 mt-2 mb-3 pb-3 border-b border-muted">
        <b className="font-body text-body-md font-bold truncate">{o.customerName}</b>
        <span className="font-mono text-label-sm whitespace-nowrap">{phone(o.customerPhone)}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {o.items.slice(0, 2).map((i) => {
          const img = i.variant.product.images[0]?.imageUrl;
          return (
            <li key={i.id} className="grid grid-cols-[36px_1fr_auto] gap-2.5 items-center">
              {img ? <img src={img} alt="" className="w-9 h-9 object-cover border border-muted" /> : <span className="w-9 h-9 border border-muted" />}
              <span className="text-body-sm leading-tight line-clamp-2">{i.productName}</span>
              <span className="font-mono text-label-sm uppercase whitespace-nowrap">{i.size} · {i.quantity}un</span>
            </li>
          );
        })}
        {o.items.length > 2 && <li className="font-mono text-label-sm text-stroke">+ {o.items.length - 2} itens</li>}
      </ul>
      <p className="mt-auto pt-3 text-body-sm">
        <span className={`${ui.eyebrowMuted} mr-2`}>Entrega</span>
        {o.deliveryMethod === "PICKUP" ? "Retirada na loja" : `Motoboy · ${o.shippingNeighborhood ?? o.deliveryZoneName ?? ""}`}
      </p>
      <div className="relative mt-3 pt-3 border-t border-dashed border-stroke flex items-end justify-between gap-3">
        <span aria-hidden="true" className={`${ui.hole} -left-[26px] -top-2`} />
        <span aria-hidden="true" className={`${ui.hole} -right-[26px] -top-2`} />
        <span>
          <span className={`${ui.eyebrowMuted} block`}>Total · Pix</span>
          <span className="font-display text-headline-md tabular-nums">{brl(o.total)}</span>
        </span>
        {next ? (
          <ActionForm action={changeOrderStatusAction} submitLabel={next.label} submitClassName={ui.btnInk} className="flex flex-col items-end gap-1" messageClassName="text-right">
            <input type="hidden" name="orderId" value={o.id} />
            <input type="hidden" name="status" value={next.to} />
          </ActionForm>
        ) : (
          <Link href={`/admin/pedidos/${o.id}`} className={ui.btnInkGhost}>{o.status === "PENDING" ? "Ver Pix" : "Ver"}</Link>
        )}
      </div>
    </article>
  );
}

async function Orders({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdmin();
  const { status, q, erro } = await searchParams;
  await expireStaleOrders();

  const where: Prisma.OrderWhereInput = {};
  if (status === "FINAL") where.status = { in: FINAL };
  else if (status && status in STATUS_LABEL) where.status = status as OrderStatus;
  else where.status = { notIn: FINAL };
  const term = q?.trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customerName: { contains: term, mode: "insensitive" } },
      ...(digits.length >= 4 ? [{ customerPhone: { contains: digits } }] : []),
    ];
  }
  const showFinalStrip = !status && !term;
  // ponytail: sem paginação, limite fixo de 200; paginar quando o volume passar disso.
  const [orders, grouped, recentFinal] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: withItems }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    showFinalStrip ? prisma.order.findMany({ where: { status: { in: FINAL } }, orderBy: { updatedAt: "desc" }, take: 4 }) : Promise.resolve([]),
  ]);
  const count = Object.fromEntries(grouped.map((g) => [g.status, g._count])) as Partial<Record<OrderStatus, number>>;
  const n = (s: OrderStatus) => count[s] ?? 0;
  const finalCount = n("DELIVERED") + n("CANCELLED");
  const openCount = grouped.reduce((a, g) => a + g._count, 0) - finalCount;
  const canEdit = admin.role !== "ATENDIMENTO";
  const qs = (s?: string) => `/admin?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(term ? { q: term } : {}) })}`;
  const today = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "2-digit" });

  return (
    <>
      <AdminHead
        eyebrow={`Expedição · ${today}`}
        title="Pedidos"
        counts={
          <>
            <span><b className="text-gold">{n("PENDING")}</b> aguardando Pix</span>
            <span><b className="text-paper">{openCount - n("PENDING")}</b> em andamento</span>
            <span><b className="text-paper">{finalCount}</b> finalizados</span>
          </>
        }
      >
        <form role="search" action="/admin">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={term} placeholder="Buscar nº, nome ou telefone" aria-label="Buscar pedidos" className={`${inputCls} w-72 max-w-full`} />
        </form>
      </AdminHead>
      {erro === "permissao" && <p role="alert" className="mb-4 text-body-sm text-danger">Seu perfil não tem acesso a essa seção.</p>}

      <nav aria-label="Filtrar por status" className="flex flex-wrap gap-1.5 mb-4">
        <Pill href={qs()} on={!status} label="Em aberto" count={openCount} />
        {(["PENDING", "PAID", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] as OrderStatus[]).map((s) => (
          <Pill key={s} href={qs(s)} on={status === s} label={STATUS_LABEL[s]} count={n(s)} />
        ))}
        <Pill href={qs("FINAL")} on={status === "FINAL"} label="Finalizados" count={finalCount} />
      </nav>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
        {orders.map((o) => <Ticket key={o.id} o={o} canEdit={canEdit} />)}
        {showFinalStrip && recentFinal.length > 0 && (
          <section className="col-span-full xl:col-span-2 border border-dashed border-stroke p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-headline-md uppercase">Finalizados <span className="text-muted">({finalCount})</span></h2>
              <Link href={qs("FINAL")} className={ui.btnGhost}>Ver todos</Link>
            </div>
            {recentFinal.map((o) => (
              <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 bg-surface-container border-l border-stroke px-4 min-h-[52px] hover:bg-surface-container-high">
                <span className="font-mono text-body-sm font-semibold">{o.orderNumber}</span>
                <span className="text-body-sm text-muted truncate">{o.customerName}</span>
                <span className="font-body text-label-sm uppercase text-muted">{STATUS_LABEL[o.status]}</span>
                <span className="font-display text-headline-sm text-muted tabular-nums">{brl(o.total)}</span>
              </Link>
            ))}
          </section>
        )}
      </div>
      {orders.length === 0 && <p className="mt-6 text-muted">Nenhum pedido nesse filtro.</p>}
    </>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-muted">Carregando pedidos...</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}
