import Link from "next/link";
import { ui } from "@/design/ui";

// Cabeçalho das telas do painel: eyebrow dourada, título Anton, contadores em mono e ferramentas à direita.
export function AdminHead({ eyebrow, title, counts, children }: { eyebrow: string; title: string; counts?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-5">
      <div className="min-w-0">
        <p className={`${ui.eyebrow} mb-2`}>{eyebrow}</p>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h1 className={ui.pageTitle}>{title}</h1>
          {counts && <p className="font-mono text-label-sm uppercase text-muted flex flex-wrap gap-4">{counts}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

// Filtro em pill quadrada com contagem; link, para o filtro ficar na URL.
export function Pill({ href, on, label, count }: { href: string; on: boolean; label: string; count?: number }) {
  return (
    <Link href={href} aria-current={on ? "true" : undefined} className={`${ui.pill} inline-flex items-center gap-2 whitespace-nowrap ${on ? ui.pillOn : ui.pillOff}`}>
      {label}
      {count !== undefined && <span className="font-mono">{count}</span>}
    </Link>
  );
}
