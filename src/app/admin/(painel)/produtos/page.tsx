import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createProductAction, updateProductAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminHead, Pill } from "@/components/admin/AdminHead";
import { StockStepper } from "@/components/admin/StockStepper";
import { inputCls } from "@/components/admin/labels";
import { ui } from "@/design/ui";

export const metadata = { title: "Mantos & Produtos | Painel Tropa da Mauá" };

type SP = Promise<{ f?: string; cat?: string; q?: string }>;

const money = (v: { toString(): string } | null) => (v === null ? "" : Number(v).toFixed(2));
// SKU da etiqueta = SKU da variant sem o sufixo de tamanho (LOB-CAM-WLF-BLK-G → LOB-CAM-WLF-BLK).
const skuBase = (sku?: string) => sku?.split("-").slice(0, -1).join("-") ?? "";
// Ordem de prateleira: letras (PP→XG), depois numeração, depois o resto.
const LETTERS = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
const sizeRank = (s: string) => {
  const l = LETTERS.indexOf(s.split(" ")[0].toUpperCase());
  if (l >= 0) return l;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 1000 : 100 + n;
};
const bySize = (a: { size: string }, b: { size: string }) => sizeRank(a.size) - sizeRank(b.size);
const labelCls = "flex flex-col gap-1 font-body text-label-sm uppercase text-muted";

async function Products({ searchParams }: { searchParams: SP }) {
  const admin = await requireAdmin(["ADMIN", "EXPEDICAO"]);
  const { f, cat, q } = await searchParams;
  const [all, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, variants: { orderBy: { createdAt: "asc" } }, images: { where: { isMain: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  const isLow = (p: (typeof all)[number]) => p.variants.some((v) => v.stockQuantity === 1);
  const isOut = (p: (typeof all)[number]) => p.variants.some((v) => v.stockQuantity === 0);
  const term = q?.trim().toLowerCase();
  // ponytail: filtro em memória; o catálogo é pequeno. Levar para o where do Prisma se passar de algumas centenas.
  const products = all.filter(
    (p) =>
      (!cat || p.category.slug === cat) &&
      (f !== "baixo" || isLow(p)) &&
      (f !== "esgotado" || isOut(p)) &&
      (f !== "inativo" || !p.active) &&
      (!term || p.name.toLowerCase().includes(term) || p.variants.some((v) => v.sku.toLowerCase().includes(term))),
  );
  const pieces = all.reduce((a, p) => a + p.variants.reduce((b, v) => b + v.stockQuantity, 0), 0);
  const zeroSizes = all.reduce((a, p) => a + p.variants.filter((v) => v.stockQuantity === 0).length, 0);
  const qs = (next: { f?: string; cat?: string }) => {
    const m = { f, cat, q: q?.trim(), ...next };
    return `/admin/produtos?${new URLSearchParams(Object.entries(m).filter(([, v]) => v) as [string, string][])}`;
  };

  return (
    <>
      <AdminHead
        eyebrow="Estoque · etiquetas penduradas"
        title="Produtos"
        counts={
          <>
            <span><b className="text-paper">{all.length}</b> etiquetas</span>
            <span><b className="text-paper">{pieces}</b> peças</span>
            <span><b className={zeroSizes ? "text-danger" : "text-paper"}>{zeroSizes}</b> tamanhos zerados</span>
          </>
        }
      >
        <form role="search" action="/admin/produtos">
          {f && <input type="hidden" name="f" value={f} />}
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input name="q" defaultValue={q} placeholder="Buscar nome ou SKU" aria-label="Buscar produtos" className={`${inputCls} w-60 max-w-full`} />
        </form>
      </AdminHead>

      <nav aria-label="Filtrar produtos" className="flex flex-col gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          <Pill href={qs({ f: "" })} on={!f} label="Todos" count={all.length} />
          <Pill href={qs({ f: "baixo" })} on={f === "baixo"} label="Última peça" count={all.filter(isLow).length} />
          <Pill href={qs({ f: "esgotado" })} on={f === "esgotado"} label="Tamanho esgotado" count={all.filter(isOut).length} />
          <Pill href={qs({ f: "inativo" })} on={f === "inativo"} label="Inativo" count={all.filter((p) => !p.active).length} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`${ui.eyebrowMuted} mr-2`}>Categoria</span>
          <Pill href={qs({ cat: "" })} on={!cat} label="Todas" />
          {categories.map((c) => <Pill key={c.id} href={qs({ cat: c.slug })} on={cat === c.slug} label={c.name} />)}
        </div>
      </nav>

      {admin.role === "ADMIN" && (
        <details className="mb-5 group">
          <summary className={`${ui.btnPrimary} cursor-pointer list-none w-fit`}>Nova etiqueta</summary>
          <ActionForm action={createProductAction} submitLabel="Criar produto" className="mt-3 grid md:grid-cols-2 gap-4 p-5 border border-dashed border-stroke bg-surface-container-low">
            <label className={labelCls}>Nome<input name="name" required className={inputCls} /></label>
            <label className={labelCls}>Slug (URL)<input name="slug" required placeholder="camiseta-preta-oversized" className={inputCls} /></label>
            <label className={labelCls}>Categoria
              <select name="categoryId" required className={inputCls}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className={labelCls}>URL da imagem (https)<input name="imageUrl" type="url" className={inputCls} /></label>
            <label className={labelCls}>Preço por<input name="price" required inputMode="decimal" placeholder="89.90" className={inputCls} /></label>
            <label className={labelCls}>Preço de (riscado, opcional)<input name="originalPrice" inputMode="decimal" className={inputCls} /></label>
            <label className={`${labelCls} md:col-span-2`}>Descrição<textarea name="description" rows={3} className={`${inputCls} py-2`} /></label>
            <label className={`${labelCls} md:col-span-2`}>Tamanhos, um por linha: TAMANHO;SKU;ESTOQUE
              <textarea name="variants" rows={4} required placeholder={"P;LOB-CAM-XXX-P;3\nM;LOB-CAM-XXX-M;5"} className={`${inputCls} py-2 font-mono`} />
            </label>
          </ActionForm>
        </details>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-4">
        {products.map((p) => {
          const img = p.images[0]?.imageUrl;
          const off = p.originalPrice ? Math.round((1 - Number(p.price) / Number(p.originalPrice)) * 100) : 0;
          const selo = !p.active ? ["Inativo", "bg-ink text-paper"] : isOut(p) ? ["Tam. esgotado", "bg-danger text-ink"] : isLow(p) ? ["Última peça", "border border-ink"] : null;
          return (
            <ActionForm
              key={p.id}
              action={updateProductAction}
              submitLabel="Salvar etiqueta"
              submitClassName={`${ui.btnInk} ml-14 mr-4 mb-4`}
              messageClassName="pl-14 pr-4 pb-3"
              className={`${ui.tagCard} flex flex-col`}
            >
              <input type="hidden" name="productId" value={p.id} />
              <div className="grid grid-cols-[40px_1fr] flex-1">
                <label className={`relative border-r-[1.5px] border-dashed border-stroke flex flex-col items-center justify-end gap-2 pb-3 cursor-pointer ${p.active ? "" : "bg-ink text-paper"}`}>
                  <span aria-hidden="true" className={`${p.active ? ui.hole : ui.hole.replace("bg-ink", "bg-tag")} top-1/2 left-1/2 -ml-2 -mt-2`} />
                  <input type="checkbox" name="active" defaultChecked={p.active} className="w-4 h-4 accent-ink" />
                  <span className="[writing-mode:vertical-rl] rotate-180 font-body text-label-sm uppercase">Ativo</span>
                </label>
                <div className={`min-w-0 px-4 pt-3 pb-3 flex flex-col gap-2.5 ${p.active ? "" : "opacity-50"}`}>
                  <div className="flex items-center justify-between gap-2 font-mono text-label-sm uppercase">
                    <span className="truncate">{skuBase(p.variants[0]?.sku)}</span>
                    {selo ? <span className={`px-1.5 py-1 font-body text-label-sm uppercase whitespace-nowrap ${selo[1]}`}>{selo[0]}</span> : <span className="whitespace-nowrap">{p.category.name}</span>}
                  </div>
                  <div className="grid grid-cols-[76px_1fr] gap-3">
                    <div className="relative w-[76px] h-[76px] bg-surface-container-low">
                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <span className="absolute inset-0 grid place-items-center font-mono text-label-sm uppercase text-muted">Sem foto</span>}
                      {off > 0 && <span className="absolute top-1.5 left-1.5 px-1 bg-ink text-gold font-mono text-label-sm">-{off}%</span>}
                    </div>
                    <div className="min-w-0 flex flex-col justify-between gap-2">
                      <p className="font-mono text-body-sm uppercase leading-snug line-clamp-2">{p.name}</p>
                      <div className="flex items-end gap-2">
                        <label className="flex flex-col gap-0.5 font-mono text-label-sm uppercase text-stroke">
                          Por
                          <input name="price" defaultValue={money(p.price)} required inputMode="decimal" className="w-24 h-9 px-2 border border-stroke bg-tag text-ink font-display text-headline-sm focus:outline-none focus:border-gold" />
                        </label>
                        <label className="flex flex-col gap-0.5 font-mono text-label-sm uppercase text-stroke">
                          De
                          <input name="originalPrice" defaultValue={money(p.originalPrice)} inputMode="decimal" className="w-24 h-9 px-2 border border-stroke bg-tag text-stroke font-mono text-body-sm line-through focus:outline-none focus:border-gold" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className={`grid gap-1.5 ${p.variants.some((v) => v.size.length > 3) ? "grid-cols-[repeat(auto-fit,minmax(88px,1fr))]" : "grid-cols-[repeat(auto-fit,minmax(68px,1fr))]"}`}>
                    {[...p.variants].sort(bySize).map((v) => (
                      <StockStepper key={v.id} name={`stock_${v.id}`} size={v.size} sku={v.sku} defaultValue={v.stockQuantity} />
                    ))}
                  </div>
                </div>
              </div>
            </ActionForm>
          );
        })}
      </div>
      {products.length === 0 && <p className="mt-6 text-muted">Nenhum produto nesse filtro.</p>}
    </>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<p className="text-muted">Carregando produtos...</p>}>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}
