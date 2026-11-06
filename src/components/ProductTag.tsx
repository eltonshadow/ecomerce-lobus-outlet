"use client";

import type { Product } from "@/types/store";
import { brl } from "@/design/ui";

// Card de produto do design system: etiqueta de estoque (furo, SKU, grade, preço outlet).
// Clique abre o ProductModal para escolher tamanho.
export function ProductTag({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const sizes = product.variants.filter((v) => v.stockQuantity > 0).map((v) => v.size);
  const sku = product.variants[0]?.sku.replace(/-[^-]+$/, "") ?? "";
  const off = product.originalPrice && product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      aria-label={`${product.name}, ${brl(product.price)}. Escolher tamanho`}
      className="group relative flex flex-col text-left bg-tag text-ink transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      <span aria-hidden="true" className="absolute top-3.5 left-1/2 -ml-[9px] w-[18px] h-[18px] rounded-full bg-ink" />
      <span className="flex justify-between gap-3 px-[18px] pt-11 pb-3 font-mono text-[12px] font-semibold">
        <span className="truncate">{sku}</span>
        <span className="shrink-0">{sizes.join(" ")}</span>
      </span>
      <span className="relative block aspect-square mx-[18px] overflow-hidden bg-[#0E0D0C]">
        {product.images[0] && <img src={product.images[0]} alt="" loading="lazy" className="w-full h-full object-cover" />}
        {off > 0 && <span className="absolute top-2 left-2 bg-ink text-gold font-mono text-[11px] font-semibold px-2 py-1">-{off}%</span>}
      </span>
      <span className="flex flex-1 flex-col gap-2.5 px-[18px] pt-4 pb-5">
        <span className="flex-1 font-mono text-[14px] font-medium uppercase leading-snug">{product.name}</span>
        <span className="flex items-end justify-between gap-3 border-t border-dashed border-ink pt-2.5 font-mono text-[12px] uppercase">
          <span className="flex flex-col">
            {off > 0 && <span className="line-through opacity-60">{brl(product.originalPrice!)}</span>}
            Preço torcedor
          </span>
          <span className="font-display text-[30px] leading-none tabular-nums">{brl(product.price)}</span>
        </span>
      </span>
    </button>
  );
}
