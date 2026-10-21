"use client";

import { useState } from "react";

// Contador de estoque de um tamanho na etiqueta: − e + mexem no campo, o formulário salva tudo junto.
export function StockStepper({ name, size, sku, defaultValue }: { name: string; size: string; sku: string; defaultValue: number }) {
  const [v, setV] = useState(defaultValue);
  const zero = v === 0;
  const changed = v !== defaultValue;
  return (
    <div title={sku} className={`grid grid-rows-[24px_40px] border ${zero ? "bg-danger border-ink" : "border-stroke"} ${changed ? "outline outline-2 outline-gold -outline-offset-2" : ""}`}>
      <label className="flex items-center justify-between gap-1 px-1.5 font-mono text-label-sm uppercase whitespace-nowrap">
        <span className={`min-w-0 truncate tracking-normal ${zero ? "line-through" : ""}`}>{size}</span>
        <input
          name={name}
          type="number"
          min={0}
          value={v}
          onChange={(e) => setV(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          aria-label={`Estoque ${size}`}
          className={`w-[3.5ch] shrink-0 bg-transparent text-right font-mono text-body-md font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${v === 1 ? "underline decoration-2 underline-offset-2" : ""}`}
        />
      </label>
      <div className="grid grid-cols-2 border-t border-stroke">
        <button type="button" onClick={() => setV((x) => Math.max(0, x - 1))} disabled={zero} aria-label={`Tirar 1 do ${size}`} className="font-mono text-body-lg hover:bg-ink hover:text-paper disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink">
          −
        </button>
        <button type="button" onClick={() => setV((x) => x + 1)} aria-label={`Somar 1 ao ${size}`} className="border-l border-stroke font-mono text-body-lg hover:bg-ink hover:text-paper">
          +
        </button>
      </div>
    </div>
  );
}
