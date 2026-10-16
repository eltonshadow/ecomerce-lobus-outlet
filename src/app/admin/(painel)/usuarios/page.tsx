import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createUserAction, toggleUserAction } from "@/actions/admin";
import { ActionForm } from "@/components/admin/ActionForm";
import { ROLE_LABEL, inputCls } from "@/components/admin/labels";

export const metadata = { title: "Usuários | Painel LOBUS" };

async function Users() {
  const me = await requireAdmin(["ADMIN"]);
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <ActionForm action={createUserAction} submitLabel="Criar usuário" className="bg-surface-container p-4 rounded flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-sm">Nome<input name="name" required className={inputCls} /></label>
        <label className="flex flex-col gap-1 text-sm">E-mail<input name="email" type="email" required className={inputCls} /></label>
        <label className="flex flex-col gap-1 text-sm">Senha (mín. 8)<input name="password" type="password" minLength={8} required autoComplete="new-password" className={inputCls} /></label>
        <label className="flex flex-col gap-1 text-sm">Perfil
          <select name="role" defaultValue="EXPEDICAO" className={inputCls}>
            {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </ActionForm>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-on-surface-variant border-b border-outline-variant">
            <tr><th className="py-2 pr-4">Nome</th><th className="py-2 pr-4">E-mail</th><th className="py-2 pr-4">Perfil</th><th className="py-2 pr-4">Status</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-outline-variant/40">
                <td className="py-2 pr-4">{u.name}{u.id === me.id && <span className="text-on-surface-variant"> (você)</span>}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{ROLE_LABEL[u.role]}</td>
                <td className="py-2 pr-4">{u.active ? "Ativo" : "Inativo"}</td>
                <td className="py-2">
                  {u.id !== me.id && (
                    <ActionForm action={toggleUserAction} submitLabel={u.active ? "Desativar" : "Ativar"} submitClassName="text-xs underline hover:text-primary" className="flex flex-col">
                      <input type="hidden" name="userId" value={u.id} />
                    </ActionForm>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Usuários</h1>
      <Suspense fallback={<p className="text-on-surface-variant">Carregando usuários...</p>}>
        <Users />
      </Suspense>
    </>
  );
}
