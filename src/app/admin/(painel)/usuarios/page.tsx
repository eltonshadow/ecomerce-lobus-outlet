import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createUserAction, toggleUserAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminHead } from "@/components/admin/AdminHead";
import { ROLE_ACCESS, ROLE_LABEL, initials, inputCls } from "@/components/admin/labels";
import { ui } from "@/design/ui";

export const metadata = { title: "Usuários | Painel LOBUS" };

const labelCls = "flex flex-col gap-1 font-body text-label-sm uppercase text-muted";
// Faixa do crachá: só o Administrador leva dourado.
const band = (role: string) => (role === "ADMIN" ? "bg-gold text-ink" : "bg-ink text-paper");
const swatch = (role: string) => `w-6 h-2.5 shrink-0 ${role === "ADMIN" ? "bg-gold" : "border border-outline"}`;

async function Users() {
  const me = await requireAdmin(["ADMIN"]);
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  const active = users.filter((u) => u.active).length;

  return (
    <>
      <AdminHead
        eyebrow="Equipe · crachás do balcão"
        title="Usuários"
        counts={
          <>
            <span><b className="text-paper">{users.length}</b> crachás</span>
            <span><b className="text-paper">{active}</b> ativos</span>
            {users.length > active && <span><b className="text-paper">{users.length - active}</b> desativados</span>}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[256px_minmax(0,1fr)_300px]">
        <ActionForm action={createUserAction} submitLabel="Emitir crachá" submitClassName={`${ui.btnPrimary} mt-auto`} className="border border-dashed border-stroke p-5 flex flex-col gap-3">
          <h2 className="font-display text-headline-md uppercase text-center mb-1">Novo usuário</h2>
          <label className={labelCls}>Nome<input name="name" required placeholder="Nome e sobrenome" className={inputCls} /></label>
          <label className={labelCls}>E-mail<input name="email" type="email" required placeholder="nome@lobus.com.br" className={inputCls} /></label>
          <label className={labelCls}>Senha<input name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={inputCls} /></label>
          <fieldset className="flex flex-col gap-1.5">
            <legend className={`${labelCls} mb-1`}>Perfil · cor da faixa</legend>
            {Object.entries(ROLE_LABEL).map(([k, v]) => (
              <label key={k} className="min-h-[40px] flex items-center gap-2.5 px-3 border border-line cursor-pointer font-body text-label-sm uppercase text-muted has-[:checked]:border-gold has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
                <input type="radio" name="role" value={k} defaultChecked={k === "EXPEDICAO"} className="sr-only" />
                <span className={swatch(k)} />
                {v}
              </label>
            ))}
          </fieldset>
        </ActionForm>

        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] content-start">
          {users.map((u) => {
            const isMe = u.id === me.id;
            return (
              <article key={u.id} className={`${ui.tagCard} flex flex-col items-center text-center pt-5 min-h-[340px]`}>
                <span aria-hidden="true" className="w-14 h-2.5 bg-ink" />
                {isMe && <span className="absolute top-3 right-3 px-1.5 py-0.5 border border-ink font-mono text-label-sm uppercase">Você</span>}
                <div className={`flex flex-col items-center px-4 pt-5 ${u.active ? "" : "opacity-45"}`}>
                  <span className="w-[92px] h-[92px] rounded-full border-2 border-ink grid place-items-center font-display text-headline-lg">{initials(u.name)}</span>
                  <h2 className="mt-4 font-body text-headline-sm">{u.name}</h2>
                  <p className="font-mono text-body-sm break-all">{u.email}</p>
                </div>
                {!u.active && (
                  <span aria-hidden="true" className="absolute top-[72px] left-1/2 -translate-x-1/2 -rotate-12 border-[3px] border-ink bg-tag px-3.5 pt-1.5 pb-1 font-display text-headline-md uppercase">Inativo</span>
                )}
                <div className="mt-auto w-full px-3 pb-3 pt-4 flex flex-col items-center gap-2">
                  {isMe ? (
                    <p className="text-body-sm text-stroke">Você não pode se desativar</p>
                  ) : (
                    <ActionForm action={toggleUserAction} submitLabel={u.active ? "Desativar acesso" : "Reativar acesso"} submitClassName={u.active ? ui.btnInkGhost : ui.btnInk} className="flex flex-col items-center gap-1">
                      <input type="hidden" name="userId" value={u.id} />
                    </ActionForm>
                  )}
                  <p className={`w-full min-h-[44px] grid place-items-center font-body text-label-lg uppercase ${band(u.role)}`}>{ROLE_LABEL[u.role]}</p>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="xl:border-l border-line xl:pl-5 flex flex-col">
          <p className={ui.eyebrow}>Perfis</p>
          <p className="text-body-md text-muted mt-1.5 mb-4">A faixa do crachá diz o que a pessoa abre no painel.</p>
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <section key={k} className="border-t border-line py-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={swatch(k)} />
                <h3 className="font-display text-headline-md uppercase flex-1">{v}</h3>
                <span className="font-mono text-label-sm uppercase text-muted whitespace-nowrap">{users.filter((u) => u.role === k && u.active).length} ativo</span>
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-body-sm">
                {ROLE_ACCESS[k].map((a) => (
                  <li key={a.label} className={a.on ? "text-paper" : "text-stroke line-through"}>{a.label}</li>
                ))}
              </ul>
            </section>
          ))}
          <p className="border-t border-line pt-4 text-body-sm text-muted">Desativar tira o acesso na hora e mantém o histórico de pedidos.</p>
        </aside>
      </div>
    </>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando usuários...</p>}>
      <Users />
    </Suspense>
  );
}
