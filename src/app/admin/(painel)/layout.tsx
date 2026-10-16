import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/admin";
import { ROLE_LABEL } from "@/components/admin/labels";

// Rotas do painel leem a sessão (cookies) em toda requisição: navegação bloqueia no servidor.
export const instant = false;

async function Sidebar() {
  const admin = await requireAdmin();
  const links = [
    { href: "/admin", label: "Pedidos", show: true },
    { href: "/admin/produtos", label: "Produtos", show: admin.role !== "ATENDIMENTO" },
    { href: "/admin/cupons", label: "Cupons", show: admin.role === "ADMIN" },
    { href: "/admin/usuarios", label: "Usuários", show: admin.role === "ADMIN" },
  ];
  return (
    <>
      <nav aria-label="Painel" className="flex md:flex-col flex-wrap gap-1">
        {links.filter((l) => l.show).map((l) => (
          <Link key={l.href} href={l.href} className="px-3 py-2 rounded text-sm text-on-surface hover:bg-surface-container-high hover:text-primary">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="md:mt-auto text-sm text-on-surface-variant flex md:flex-col gap-2 items-start">
        <span>
          {admin.name}
          <br />
          <span className="text-primary text-xs uppercase tracking-wider">{ROLE_LABEL[admin.role]}</span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="text-xs underline hover:text-primary">Sair</button>
        </form>
      </div>
    </>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface">
      <aside className="md:w-56 md:min-h-screen bg-surface-container-lowest p-4 flex md:flex-col gap-4 flex-wrap items-center md:items-stretch">
        <Link href="/admin" aria-label="Painel LOBUS">
          <img src="/logo.png" alt="LOBUS Outlet" className="h-14 w-auto" />
        </Link>
        <Suspense fallback={<span className="text-sm text-on-surface-variant">Carregando...</span>}>
          <Sidebar />
        </Suspense>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <Suspense fallback={<p className="text-on-surface-variant">Carregando...</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
