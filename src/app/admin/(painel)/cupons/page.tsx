import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createCouponAction, toggleCouponAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminHead } from "@/components/admin/AdminHead";
import { brl, inputCls } from "@/components/admin/labels";
import { ui } from "@/design/ui";

export const metadata = { title: "Cupons | Painel LOBUS" };

const num = (v: { toString(): string }) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const day = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const labelCls = "flex flex-col gap-1 font-body text-label-sm uppercase text-muted";

async function Coupons() {
  await requireAdmin(["ADMIN"]);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  const flags = (c: (typeof coupons)[number]) => [
    ...(c.validUntil && c.validUntil < now ? [`Venceu em ${day(c.validUntil)}`] : []),
    ...(c.maxUses !== null && c.usedCount >= c.maxUses ? ["Usos esgotados"] : []),
  ];
  const on = coupons.filter((c) => c.active);
  const dead = on.filter((c) => flags(c).length).length;

  return (
    <>
      <AdminHead
        eyebrow="Promoção · vales destacáveis"
        title="Cupons"
        counts={
          <>
            <span><b className="text-paper">{coupons.length}</b> cupons</span>
            <span><b className="text-paper">{on.length}</b> ligados</span>
            {dead > 0 && <span><b className="text-danger">{dead}</b> ligado sem efeito</span>}
          </>
        }
      />

      <ActionForm
        action={createCouponAction}
        submitLabel="Emitir vale"
        submitClassName={`${ui.btnPrimary} self-end`}
        className="mb-5 border border-dashed border-stroke p-5 grid gap-4 md:grid-cols-[180px_repeat(4,minmax(0,1fr))_auto] items-end"
      >
        <fieldset className="min-w-0 flex flex-col gap-2">
          <legend className={`${labelCls} mb-1`}>Tipo e valor</legend>
          <div className="grid grid-cols-2 border border-line">
            {[["PERCENTAGE", "%"], ["FIXED_AMOUNT", "R$"]].map(([v, l], i) => (
              <label key={v} className="min-h-[40px] grid place-items-center cursor-pointer font-body text-label-md uppercase text-muted has-[:checked]:bg-gold has-[:checked]:text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
                <input type="radio" name="discountType" value={v} defaultChecked={i === 0} className="sr-only" />
                {l}
              </label>
            ))}
          </div>
          <input name="discountValue" required inputMode="decimal" placeholder="10" aria-label="Valor do desconto" className={`${inputCls} w-full min-w-0 font-display text-headline-md`} />
        </fieldset>
        <label className={labelCls}>Código<input name="code" required placeholder="BLACKOUT15" className={`${inputCls} font-mono uppercase`} /></label>
        <label className={labelCls}>Pedido mínimo<input name="minOrderValue" inputMode="decimal" placeholder="opcional" className={inputCls} /></label>
        <label className={labelCls}>Máx. de usos<input name="maxUses" type="number" min={1} placeholder="sem limite" className={inputCls} /></label>
        <label className={labelCls}>Válido até<input name="validUntil" type="date" className={inputCls} /></label>
      </ActionForm>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,520px),1fr))]">
        {coupons.map((c) => {
          const pct = c.discountType === "PERCENTAGE";
          const f = flags(c);
          const rule = [
            `${pct ? `${num(c.discountValue)}%` : brl(c.discountValue)} de desconto ${c.minOrderValue ? `em pedidos a partir de ${brl(c.minOrderValue)}` : "em qualquer pedido"}.`,
            c.maxUses === null ? "Sem limite de usos." : c.maxUses === 1 ? "Vale uma única vez." : `Até ${c.maxUses} usos.`,
            c.validUntil ? `Vale até ${day(c.validUntil)}.` : "Sem validade.",
          ].join(" ");
          const usedPct = c.maxUses ? Math.min(100, (c.usedCount / c.maxUses) * 100) : 0;
          return (
            <article key={c.id} className={`${ui.tagCard} grid grid-cols-[minmax(120px,184px)_1fr] min-h-[240px]`}>
              <div className={`relative p-5 flex flex-col justify-between border-r-2 border-dashed border-stroke ${c.active ? "" : "opacity-45"}`}>
                <span aria-hidden="true" className={`absolute w-[22px] h-[22px] rounded-full bg-ink -right-[12px] -top-[11px]`} />
                <span aria-hidden="true" className={`absolute w-[22px] h-[22px] rounded-full bg-ink -right-[12px] -bottom-[11px]`} />
                <p className="font-display text-display-lg whitespace-nowrap">
                  {pct ? <>{num(c.discountValue)}<small className="text-headline-md">%</small></> : <><small className="text-headline-md">R$</small>{num(c.discountValue)}</>}
                </p>
                <p className={ui.eyebrowMuted}>{pct ? "Percentual" : "Valor fixo"}</p>
              </div>
              <div className="min-w-0 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className={`font-mono text-headline-sm uppercase break-all ${c.active ? "" : "opacity-45"}`}>{c.code}</h2>
                  <ActionForm action={toggleCouponAction} submitLabel={c.active ? "Desligar" : "Ligar"} submitClassName={c.active ? ui.btnInkGhost : ui.btnInk} className="flex flex-col items-end gap-1" messageClassName="text-right">
                    <input type="hidden" name="couponId" value={c.id} />
                  </ActionForm>
                </div>
                <p className={`text-body-md max-w-[42ch] ${c.active ? "" : "opacity-45"}`}>{rule}</p>
                {(f.length > 0 || !c.active) && (
                  <div className="flex flex-wrap gap-1.5">
                    {!c.active && <span className="px-1.5 py-1 bg-ink text-paper font-body text-label-sm uppercase">Desligado</span>}
                    {f.map((x) => <span key={x} className="px-1.5 py-1 bg-danger text-ink font-body text-label-sm uppercase">{x}</span>)}
                  </div>
                )}
                <div className="mt-auto">
                  <div className="flex justify-between font-mono text-label-sm uppercase mb-1">
                    <span>Usos</span>
                    <span>{c.usedCount} / {c.maxUses ?? "sem limite"}</span>
                  </div>
                  {c.maxUses ? (
                    <div className="h-2 border border-ink"><div className="h-full bg-ink" style={{ width: `${usedPct}%` }} /></div>
                  ) : (
                    <div className="h-2 border border-dashed border-ink" />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {coupons.length === 0 && <p className="mt-6 text-muted">Nenhum cupom ainda. Preencha o vale em branco para criar o primeiro.</p>}
    </>
  );
}

export default function CouponsPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando cupons...</p>}>
      <Coupons />
    </Suspense>
  );
}
