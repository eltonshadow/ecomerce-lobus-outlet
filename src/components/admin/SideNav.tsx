"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Links da sidebar do painel; precisa do pathname para marcar o item ativo.
export function SideNav({ links }: { links: { href: string; label: string; count?: number }[] }) {
  const path = usePathname();
  const isOn = (href: string) => (href === "/admin" ? path === "/admin" || path.startsWith("/admin/pedidos") : path.startsWith(href));
  return (
    <nav aria-label="Painel" className="flex md:flex-col border-t border-line overflow-x-auto">
      {links.map((l) => {
        const on = isOn(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`shrink-0 md:shrink min-h-[52px] flex items-center justify-between gap-3 px-4 md:pl-6 md:pr-5 border-b border-line md:border-l-[3px] font-body text-label-lg uppercase transition-colors ${
              on ? "text-paper bg-surface-container md:border-l-gold" : "text-muted md:border-l-transparent hover:text-paper hover:bg-surface-container"
            }`}
          >
            {l.label}
            {!!l.count && (
              <span title={l.href === "/admin" ? "Pagos esperando separação ou em separação" : "Pagamentos para conferir"} className="min-w-6 h-6 px-1.5 inline-flex items-center justify-center bg-gold text-ink font-mono text-label-sm">
                {l.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
