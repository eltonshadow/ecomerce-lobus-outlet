import { Suspense } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { expireStaleOrders, ITEM_IMAGE } from "@/lib/orders";
import { zoneForCep } from "@/lib/address";
import { infinitePayEnabled } from "@/lib/infinitepay";
import { ORDER_STATUS_LABEL, ORDER_STEPS, ORDER_STEPS_DELIVERY } from "@/lib/order-status";
import { logoutCustomerAction } from "@/actions/account";
import { SiteHeader } from "@/components/SiteHeader";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";
import { PayButton } from "@/app/pedido/[orderNumber]/PixActions";
import { ui, brl } from "@/design/ui";
import { AddressBook, PasswordCard, ProfileCard } from "./AccountPanels";
import { AccountTabs } from "./AccountTabs";

export const metadata = { title: "Minha conta | Tropa da Mauá" };

const ACTIVE: OrderStatus[] = ["PAID", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"];

// Status na lista: pede ação = bloco dourado; em andamento = contorno dourado; finalizado = apagado.
const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-gold text-ink",
  PAID: "border border-gold text-gold",
  PREPARING: "border border-gold text-gold",
  READY_FOR_PICKUP: "border border-gold text-gold",
  OUT_FOR_DELIVERY: "border border-gold text-gold",
  DELIVERED: "border border-line text-muted",
  CANCELLED: "border border-line text-muted line-through",
};

const day = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
const hhmm = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default function ContaPage() {
  return (
    <>
      <SiteHeader />
      <main className={`${ui.container} flex-1 py-8 lg:py-10`}>
        <Suspense fallback={<p className="text-muted">Carregando sua conta...</p>}>
          <Account />
        </Suspense>
      </main>
    </>
  );
}

async function loadAccount(customerId: string) {
  await expireStaleOrders();
  const [customer, orders, addresses] = await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId } }),
    prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, include: { items: { include: ITEM_IMAGE } } }),
    prisma.customerAddress.findMany({ where: { customerId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
  ]);
  const zones = await Promise.all(addresses.map((a) => zoneForCep(a.cep)));
  return { customer, orders, addresses: addresses.map((a, i) => ({ ...a, zone: zones[i] })) };
}

type Orders = Awaited<ReturnType<typeof loadAccount>>["orders"];

async function Account() {
  const me = await requireCustomer("/conta");
  const { customer, orders, addresses } = await loadAccount(me.id);
  const active = orders.find((o) => ACTIVE.includes(o.status));
  const pending = orders.find((o) => o.status === "PENDING");

  return (
    <AccountTabs
      aside={
        <div className="flex items-end justify-between gap-4 lg:block">
          <div className="min-w-0">
            <p className={ui.eyebrow}>Minha conta</p>
            <h1 className={`${ui.pageTitle} mt-2 break-words`}>Olá, {customer.name.split(" ")[0]}</h1>
            <p className="mt-2 text-body-md text-muted break-all">{customer.email}</p>
          </div>
          <form action={logoutCustomerAction} className="lg:mt-5">
            <button type="submit" className={ui.linkUnderline}>
              Sair
            </button>
          </form>
        </div>
      }
      footer={
        <div className="text-body-md text-muted">
          <p className="font-body text-label-sm uppercase text-paper mb-1">Loja · {PICKUP_STORE_INFO.neighborhood}</p>
          {PICKUP_STORE_INFO.openingHours.split(" | ").map((h) => (
            <p key={h}>{h}</p>
          ))}
          <p>{PICKUP_STORE_INFO.time}</p>
        </div>
      }
      tabs={[
        {
          id: "pedidos",
          label: "Pedidos",
          count: orders.length,
          content: (
            <div className="flex flex-col gap-6">
              {(active || pending) && (
                <div className={`grid gap-4 ${active && pending ? "xl:grid-cols-[1fr_400px]" : ""}`}>
                  {active && <Tracking order={active} addressLabel={addresses.find((a) => a.cep === active.shippingCep && a.number === active.shippingNumber)?.label} />}
                  {pending && <PayAlert order={pending} />}
                </div>
              )}
              <History orders={orders} />
            </div>
          ),
        },
        {
          id: "enderecos",
          label: "Endereços",
          count: addresses.length,
          content: <AddressBook addresses={addresses.map(({ id, label, cep, street, number, complement, neighborhood, city, state, reference, isDefault, zone }) => ({ id, label, cep, street, number, complement, neighborhood, city, state, reference, isDefault, zone }))} />,
        },
        {
          id: "dados",
          label: "Dados",
          content: (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
              <ProfileCard me={{ name: customer.name, email: customer.email, phone: customer.phone, cpf: customer.cpf, birthDate: customer.birthDate?.toISOString().slice(0, 10) ?? "" }} />
              <PasswordCard />
            </div>
          ),
        },
      ]}
    />
  );
}

function Thumb({ src }: { src?: string | null }) {
  return src ? <img src={src} alt="" className="w-14 h-14 shrink-0 object-cover bg-tag" /> : <span className="w-14 h-14 shrink-0 bg-tag" />;
}

function Tracking({ order, addressLabel }: { order: Orders[number]; addressLabel?: string }) {
  const delivery = order.deliveryMethod === "MOTOBOY";
  const steps = delivery ? ORDER_STEPS_DELIVERY : ORDER_STEPS;
  const current = steps.indexOf(order.status);
  return (
    <section aria-label="Pedido em andamento" className="border border-line bg-surface-container-low p-5 lg:p-6 flex flex-col gap-5 min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-body text-label-sm uppercase text-muted">Pedido em andamento</span>
        <span className="font-mono text-[14px] font-semibold">{order.orderNumber}</span>
      </div>
      <h2 className="font-display uppercase text-[clamp(2.25rem,4vw,3rem)] leading-[0.95]">{ORDER_STATUS_LABEL[order.status]}</h2>
      <ol aria-label="Andamento" className="grid grid-cols-5 gap-1.5">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === current ? "step" : undefined} className="flex flex-col gap-2 min-w-0">
            <span className={`h-1 ${i <= current ? "bg-gold" : "bg-line"}`} />
            <span className={`hidden sm:block font-body text-label-sm uppercase leading-tight ${i === current ? "text-gold" : i < current ? "text-paper" : "text-stroke"}`}>{ORDER_STATUS_LABEL[s]}</span>
          </li>
        ))}
      </ol>
      <p className="sm:hidden -mt-3 font-body text-label-sm uppercase text-muted">
        Passo {current + 1} de {steps.length}
      </p>
      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr_auto] items-end border-t border-line pt-5">
        <div className="text-body-sm">
          <p className="font-body text-label-sm uppercase text-muted mb-1">{delivery ? `Entrega${addressLabel ? ` · ${addressLabel}` : ""}` : "Retirada na loja"}</p>
          {delivery ? (
            <p>
              {order.shippingStreet}, {order.shippingNumber}
              {order.shippingComplement ? `, ${order.shippingComplement}` : ""}
              <br />
              {order.shippingNeighborhood}
            </p>
          ) : (
            <p>{PICKUP_STORE_INFO.address}</p>
          )}
        </div>
        <ul className="flex flex-col gap-2 min-w-0">
          {order.items.slice(0, 3).map((it) => (
            <li key={it.id} className="flex items-center gap-3 min-w-0">
              <Thumb src={it.variant.product.images[0]?.imageUrl} />
              <span className="min-w-0 font-mono text-[13px] leading-tight">
                <span className="block truncate">{it.productName}</span>
                <span className="text-muted">
                  {it.size} · ×{it.quantity}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 items-stretch md:items-end">
          <span className="font-display text-[32px] leading-none tabular-nums">{brl(Number(order.total))}</span>
          <Link href={`/pedido/${order.orderNumber}`} className={ui.btnGhost}>
            Ver pedido
          </Link>
        </div>
      </div>
    </section>
  );
}

function PayAlert({ order }: { order: Orders[number] }) {
  const first = order.items[0];
  return (
    <section aria-label="Pagamento pendente" className="border border-gold p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="px-2 py-1 bg-gold text-ink font-body text-label-sm uppercase">Aguardando pagamento</span>
        <span className="font-mono text-[14px] font-semibold">{order.orderNumber}</span>
      </div>
      <h2 className="font-display text-headline-md uppercase">Falta pagar para separarmos seu pedido</h2>
      <div className="flex items-center gap-3">
        <Thumb src={first?.variant.product.images[0]?.imageUrl} />
        <p className="font-mono text-[13px] leading-tight min-w-0">
          {first?.productName}
          {order.items.length > 1 && ` + ${order.items.length - 1}`}
          <span className="block text-muted">{order.deliveryMethod === "PICKUP" ? "Retirada na loja" : "Motoboy"}</span>
        </p>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
        <span className="font-display text-[30px] leading-none text-gold tabular-nums">{brl(Number(order.total))}</span>
        {order.pixExpiresAt && <span className="text-body-sm text-muted">reservado até {hhmm(order.pixExpiresAt)}</span>}
      </div>
      {infinitePayEnabled() ? (
        <PayButton orderNumber={order.orderNumber} label="Pagar agora" />
      ) : (
        <Link href={`/pedido/${order.orderNumber}`} className={ui.btnPrimary}>
          Pagar agora
        </Link>
      )}
    </section>
  );
}

function History({ orders }: { orders: Orders }) {
  return (
    <section aria-label="Histórico de pedidos" className="min-w-0">
      <div className="flex items-baseline gap-3 border-b border-line pb-3">
        <h2 className="font-display text-headline-md uppercase">Histórico</h2>
        <span className="font-mono text-[14px] text-muted">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
        </span>
      </div>
      {orders.length === 0 ? (
        <div className="py-10 flex flex-col items-start gap-4">
          <p className="text-body-lg text-muted">Você ainda não fez pedidos com esta conta.</p>
          <Link href="/#vitrine" className={ui.btnPrimary}>
            Ver o drop
          </Link>
        </div>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} className="border-b border-line">
              <Link href={`/pedido/${o.orderNumber}`} className="grid grid-cols-[56px_1fr] sm:grid-cols-[56px_minmax(0,1fr)_auto_auto] items-center gap-x-5 gap-y-2 py-4 px-2 -mx-2 hover:bg-surface-container-low transition-colors">
                <Thumb src={o.items[0]?.variant.product.images[0]?.imageUrl} />
                <span className="min-w-0">
                  <span className="font-mono text-[14px] font-semibold">{o.orderNumber}</span> <span className="font-mono text-[13px] text-muted">{day(o.createdAt)}</span>
                  <span className="block text-body-lg truncate">
                    {o.items[0]?.productName}
                    {o.items.length > 1 && ` + ${o.items.length - 1}`}
                  </span>
                  <span className="block text-body-md text-muted">{o.deliveryMethod === "PICKUP" ? "Retirada na loja" : "Motoboy"}</span>
                </span>
                <span className={`hidden sm:inline-block px-2 py-1 font-body text-label-sm uppercase whitespace-nowrap ${TONE[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                <span className="col-start-2 sm:col-start-auto flex flex-wrap flex-row-reverse sm:flex-col items-center sm:items-end justify-between gap-2 text-right">
                  <span className="block font-display text-[26px] leading-none tabular-nums whitespace-nowrap">{brl(Number(o.total))}</span>
                  <span className={`sm:hidden inline-block px-1.5 py-0.5 font-body text-label-sm uppercase ${TONE[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                  <span className="hidden sm:block font-body text-label-sm uppercase text-muted">Ver pedido</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
