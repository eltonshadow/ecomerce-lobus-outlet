"use client";

import { useState } from "react";

type Tab = { id: string; label: string; count?: number; content: React.ReactNode };

// Abas da conta. Os painéis chegam renderizados do servidor; aqui só alterna qual aparece.
// Desktop: coluna lateral com títulos grandes. Mobile: faixa de abas acima do conteúdo.
export function AccountTabs({ tabs, aside, footer }: { tabs: Tab[]; aside: React.ReactNode; footer: React.ReactNode }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 items-start">
      <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
        {aside}
        <div role="tablist" aria-label="Seções da conta" className="grid grid-cols-3 lg:grid-cols-1 border-b lg:border-b-0 lg:border-t border-line">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={on}
                aria-controls={`painel-${t.id}`}
                onClick={() => setActive(t.id)}
                className={`flex items-baseline justify-center lg:justify-between gap-2 py-3 lg:py-4 border-b-2 lg:border-b font-display uppercase text-[22px] lg:text-headline-lg leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                  on ? "text-gold border-gold lg:border-line" : "text-paper border-transparent lg:border-line hover:text-gold"
                }`}
              >
                {t.label}
                {t.count !== undefined && <span className="font-mono text-[13px] font-semibold tabular-nums">{String(t.count).padStart(2, "0")}</span>}
              </button>
            );
          })}
        </div>
        <div className="hidden lg:block">{footer}</div>
      </aside>
      <div className="min-w-0">
        {tabs.map((t) => (
          <div key={t.id} role="tabpanel" id={`painel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== active}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
