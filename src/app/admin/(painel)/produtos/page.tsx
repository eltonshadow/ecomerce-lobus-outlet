import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createProductAction, updateProductAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { inputCls } from "@/components/admin/labels";

export const metadata = { title: "Produtos | Painel LOBUS" };

const money = (v: { toString(): string } | null) => (v === null ? "" : Number(v).toFixed(2));

async function Products() {
  const admin = await requireAdmin(["ADMIN", "EXPEDICAO"]);
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, variants: { orderBy: { size: "asc" } }, images: { where: { isMain: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {admin.role === "ADMIN" && (
        <details className="bg-surface-container p-4 rounded">
          <summary className="cursor-pointer font-semibold">Novo produto</summary>
          <ActionForm action={createProductAction} submitLabel="Criar produto" className="grid md:grid-cols-2 gap-3 mt-4">
            <label className="flex flex-col gap-1 text-sm">Nome<input name="name" required className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm">Slug (URL)<input name="slug" required placeholder="camiseta-preta-oversized" className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm">Categoria
              <select name="categoryId" required className={inputCls}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">URL da imagem (https)<input name="imageUrl" type="url" className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm">Preço (por)<input name="price" required inputMode="decimal" placeholder="89.90" className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm">Preço de (riscado, opcional)<input name="originalPrice" inputMode="decimal" className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">Descrição<textarea name="description" rows={3} className={inputCls} /></label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">Variants, uma por linha: TAMANHO;SKU;ESTOQUE
              <textarea name="variants" rows={4} required placeholder={"P;LOB-CAM-XXX-P;3\nM;LOB-CAM-XXX-M;5"} className={`${inputCls} font-mono`} />
            </label>
          </ActionForm>
        </details>
      )}

      {products.map((p) => (
        <ActionForm key={p.id} action={updateProductAction} className="bg-surface-container p-4 rounded flex flex-wrap gap-4 items-end">
          <input type="hidden" name="productId" value={p.id} />
          <div className="flex gap-3 items-center basis-full">
            {p.images[0] && <img src={p.images[0].imageUrl} alt="" className="w-14 h-14 object-cover rounded" />}
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-on-surface-variant">{p.category.name} · /{p.slug}</p>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm">Preço<input name="price" defaultValue={money(p.price)} required inputMode="decimal" className={`${inputCls} w-28`} /></label>
          <label className="flex flex-col gap-1 text-sm">Preço de<input name="originalPrice" defaultValue={money(p.originalPrice)} inputMode="decimal" className={`${inputCls} w-28`} /></label>
          <label className="flex items-center gap-2 text-sm py-2"><input type="checkbox" name="active" defaultChecked={p.active} className="w-5 h-5" />Ativo</label>
          <fieldset className="flex flex-wrap gap-2 basis-full">
            <legend className="text-sm text-on-surface-variant mb-1">Estoque por tamanho</legend>
            {p.variants.map((v) => (
              <label key={v.id} className="flex flex-col gap-1 text-xs" title={v.sku}>
                {v.size}{v.colorName ? ` · ${v.colorName}` : ""}
                <input name={`stock_${v.id}`} type="number" min={0} defaultValue={v.stockQuantity} className={`${inputCls} w-20`} />
              </label>
            ))}
          </fieldset>
        </ActionForm>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Produtos</h1>
      <Suspense fallback={<p className="text-on-surface-variant">Carregando produtos...</p>}>
        <Products />
      </Suspense>
    </>
  );
}
