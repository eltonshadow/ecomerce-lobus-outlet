import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createCouponAction, toggleCouponAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { brl, inputCls } from "@/components/admin/labels";

export const metadata = { title: "Cupons | Painel LOBUS" };

async function Coupons() {
  await requireAdmin(["ADMIN"]);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <ActionForm action={createCouponAction} submitLabel="Criar cupom" className="bg-surface-container p-4 rounded flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">Código<input name="code" required className={`${inputCls} uppercase w-36`} /></label>
        <label className="flex flex-col gap-1 text-sm">Tipo
          <select name="discountType" className={inputCls}>
            <option value="PERCENTAGE">Percentual (%)</option>
            <option value="FIXED_AMOUNT">Valor fixo (R$)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">Valor<input name="discountValue" required inputMode="decimal" className={`${inputCls} w-24`} /></label>
        <label className="flex flex-col gap-1 text-sm">Pedido mínimo<input name="minOrderValue" inputMode="decimal" className={`${inputCls} w-28`} /></label>
        <label className="flex flex-col gap-1 text-sm">Máx. usos<input name="maxUses" type="number" min={1} className={`${inputCls} w-24`} /></label>
        <label className="flex flex-col gap-1 text-sm">Validade<input name="validUntil" type="date" className={inputCls} /></label>
      </ActionForm>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-on-surface-variant border-b border-outline-variant">
            <tr><th className="py-2 pr-4">Código</th><th className="py-2 pr-4">Desconto</th><th className="py-2 pr-4">Mínimo</th><th className="py-2 pr-4">Usos</th><th className="py-2 pr-4">Validade</th><th className="py-2 pr-4">Status</th><th /></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-outline-variant/40">
                <td className="py-2 pr-4 font-mono">{c.code}</td>
                <td className="py-2 pr-4">{c.discountType === "PERCENTAGE" ? `${Number(c.discountValue)}%` : brl(c.discountValue)}</td>
                <td className="py-2 pr-4">{c.minOrderValue ? brl(c.minOrderValue) : "-"}</td>
                <td className="py-2 pr-4">{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                <td className="py-2 pr-4">{c.validUntil ? c.validUntil.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "-"}</td>
                <td className="py-2 pr-4">{c.active ? "Ativo" : "Inativo"}</td>
                <td className="py-2">
                  <ActionForm action={toggleCouponAction} submitLabel={c.active ? "Desativar" : "Ativar"} submitClassName="text-xs underline hover:text-primary" className="flex flex-col">
                    <input type="hidden" name="couponId" value={c.id} />
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Cupons</h1>
      <Suspense fallback={<p className="text-on-surface-variant">Carregando cupons...</p>}>
        <Coupons />
      </Suspense>
    </>
  );
}
