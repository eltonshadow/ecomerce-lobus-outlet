import { Suspense } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/orders";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { logoutCustomerAction } from "@/actions/account";
import { SiteHeader } from "@/components/SiteHeader";
import { ui, brl } from "@/design/ui";

export const metadata = { title: "Minha conta | LOBUS Outlet" };

const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: "bg-gold text-ink",
  PAID: "border border-gold text-gold",
  PREPARING: "border border-gold text-gold",
  READY_FOR_PICKUP: "bg-paper text-ink",
  OUT_FOR_DELIVERY: "bg-paper text-ink",
  DELIVERED: "border border-line text-muted",
  CANCELLED: "border border-line text-muted line-through",
};

export default function ContaPage() {
  return (
    <>
      <SiteHeader />
      <main className={`${ui.container} flex-1 py-12`}>
        <Suspense fallback={<p className="text-muted">Carregando sua conta...</p>}>
          <Account />
        </Suspense>
      </main>
    </>
  );
}

async function Account() {
  const me = await requireCustomer("/conta");
  await expireStaleOrders();
  const orders = await prisma.order.findMany({
    where: { customerId: me.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true } } },
  });
  const open = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className={ui.eyebrow}>Minha conta</p>
          <h1 className={ui.pageTitle}>Olá, {me.name.split(" ")[0]}</h1>
          <p className="text-muted text-body-sm">
            {me.email} · WhatsApp {me.phone}
          </p>
        </div>
        <form action={logoutCustomerAction}>
          <button type="submit" className={ui.btnGhost}>
            Sair
          </button>
        </form>
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 className="font-display text-headline-md uppercase">Meus pedidos</h2>
          <span className={`${ui.mono} text-muted`}>
            {orders.length} no total · {open.length} em andamento
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 flex flex-col items-start gap-4">
            <p className="text-muted">Você ainda não fez pedidos com esta conta.</p>
            <Link href="/#vitrine" className={ui.btnPrimary}>
              Ver o drop
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col">
            {orders.map((o) => {
              const units = o.items.reduce((a, i) => a + i.quantity, 0);
              return (
                <li key={o.id} className="border-b border-line">
                  <Link
                    href={`/pedido/${o.orderNumber}`}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[180px_1fr_auto_auto] items-center gap-x-6 gap-y-2 py-5 hover:bg-surface-container-low transition-colors px-2 -mx-2"
                  >
                    <span className="font-mono text-[14px] font-semibold">{o.orderNumber}</span>
                    <span className="text-body-sm text-muted sm:order-none order-3">
                      {o.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} · {units} {units === 1 ? "peça" : "peças"} ·{" "}
                      {o.deliveryMethod === "PICKUP" ? "Retirada na loja" : "Motoboy"}
                    </span>
                    <span className={`justify-self-end sm:justify-self-auto px-3 py-1 font-body text-label-sm uppercase ${STATUS_TONE[o.status]}`}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                    <span className="justify-self-end font-display text-[24px] leading-none tabular-nums order-4 sm:order-none">{brl(Number(o.total))}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
