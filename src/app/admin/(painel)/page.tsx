import { Suspense } from "react";
import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/orders";
import { STATUS_LABEL, PAYMENT_LABEL, brl, dateTime, inputCls } from "@/components/admin/labels";

export const metadata = { title: "Pedidos | Painel LOBUS" };

type SP = Promise<{ status?: string; q?: string; erro?: string }>;

async function Orders({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const { status, q, erro } = await searchParams;
  await expireStaleOrders();

  const where: Prisma.OrderWhereInput = {};
  if (status && status in STATUS_LABEL) where.status = status as OrderStatus;
  const term = q?.trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customerName: { contains: term, mode: "insensitive" } },
      ...(digits.length >= 4 ? [{ customerPhone: { contains: digits } }] : []),
    ];
  }
  // ponytail: sem paginação, limite fixo de 200; paginar quando o volume passar disso.
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      {erro === "permissao" && <p role="alert" className="mb-4 text-error text-sm">Seu perfil não tem acesso a essa seção.</p>}
      <form className="flex flex-wrap gap-2 mb-6" role="search">
        <input name="q" defaultValue={term} placeholder="Número, nome ou telefone" aria-label="Buscar pedidos" className={`${inputCls} flex-1 min-w-48`} />
        <select name="status" defaultValue={status ?? ""} aria-label="Filtrar por status" className={inputCls}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-primary text-on-primary font-semibold rounded text-sm">Filtrar</button>
      </form>
      {orders.length === 0 ? (
        <p className="text-on-surface-variant">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="py-2 pr-4">Pedido</th>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Entrega</th>
                <th className="py-2 pr-4 text-right">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-outline-variant/40 hover:bg-surface-container">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-primary underline font-mono">{o.orderNumber}</Link>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{dateTime(o.createdAt)}</td>
                  <td className="py-2 pr-4">{o.customerName}<br /><span className="text-on-surface-variant">{o.customerPhone}</span></td>
                  <td className="py-2 pr-4">{o.deliveryMethod === "PICKUP" ? "Retirada" : "Motoboy"}</td>
                  <td className="py-2 pr-4 text-right whitespace-nowrap">{brl(o.total)}</td>
                  <td className="py-2 pr-4">{STATUS_LABEL[o.status]}</td>
                  <td className="py-2">{PAYMENT_LABEL[o.paymentStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Pedidos</h1>
      <Suspense fallback={<p className="text-on-surface-variant">Carregando pedidos...</p>}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}
