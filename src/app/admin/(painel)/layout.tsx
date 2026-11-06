import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/actions/admin";
import { ROLE_LABEL, initials } from "@/components/admin/labels";
import { SideNav } from "@/components/admin/SideNav";

// Rotas do painel leem a sessão (cookies) em toda requisição: navegação bloqueia no servidor.
export const instant = false;

async function Sidebar() {
  const admin = await requireAdmin();
  const [actionCount, checkCount] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PAID", "PREPARING"] } } }),
    // Mesma regra de "Conferir" do payState: aviso sem confirmação, ou pago depois de cancelar.
    prisma.order.count({ where: { paymentStatus: { not: "REFUNDED" }, OR: [{ paymentStatus: "PENDING", webhookAt: { not: null } }, { paymentStatus: "APPROVED", status: "CANCELLED" }] } }),
  ]);
  const links = [
    { href: "/admin", label: "Pedidos", show: true, count: actionCount },
    { href: "/admin/pagamentos", label: "Pagamentos", show: admin.role === "ADMIN", count: checkCount },
    { href: "/admin/produtos", label: "Produtos", show: admin.role !== "ATENDIMENTO" },
    { href: "/admin/cupons", label: "Cupons", show: admin.role === "ADMIN" },
    { href: "/admin/usuarios", label: "Usuários", show: admin.role === "ADMIN" },
  ].filter((l) => l.show);
  return (
    <>
      <SideNav links={links} />
      <div className="md:mt-auto border-t border-line px-5 py-4 flex items-center gap-3">
        <span aria-hidden="true" className="w-10 h-10 shrink-0 rounded-full border border-stroke grid place-items-center font-display text-body-lg">
          {initials(admin.name)}
        </span>
        <span className="flex-1 min-w-0">
          <b className="block font-body text-body-sm font-semibold truncate">{admin.name}</b>
          <span className="block text-body-sm text-muted">{ROLE_LABEL[admin.role]}</span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="min-h-[40px] px-1 font-body text-label-sm uppercase text-muted hover:text-paper">Sair</button>
        </form>
      </div>
    </>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink text-paper">
      <aside className="md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-line flex flex-col">
        <Link href="/admin" aria-label="Painel Tropa da Mauá" className="flex items-center gap-3 px-5 pt-6 pb-7">
          <img src="/logo.png" alt="" className="w-12 h-12" />
          <span>
            <b className="block font-display text-xl uppercase leading-none">TROPA DA MAUÁ</b>
            <span className="font-body text-label-sm uppercase text-muted">Gestão do Clube</span>
          </span>
        </Link>
        <Suspense fallback={<span className="px-5 text-body-sm text-muted">Carregando...</span>}>
          <Sidebar />
        </Suspense>
      </aside>
      <main className="flex-1 min-w-0 px-4 md:px-6 py-6">
        <Suspense fallback={<p className="text-muted">Carregando...</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
