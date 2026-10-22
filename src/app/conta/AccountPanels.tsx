"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { changePasswordAction, deleteAddressAction, saveAddressAction, setDefaultAddressAction, updateProfileAction, type AccountState } from "@/actions/account";
import { AddressFields, Field } from "@/components/AddressFields";
import { ui, brl } from "@/design/ui";

type Zone = { name: string; fee: number; freeAbove: number | null; hours: number } | null;
export type SavedAddress = { id: string; label: string; cep: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string; reference: string | null; isDefault: boolean; zone: Zone };

const cepFmt = (c: string) => `${c.slice(0, 5)}-${c.slice(5)}`;
const linkBtn = "font-body text-label-sm uppercase border-b pb-0.5 transition-colors";

function Msg({ state }: { state: AccountState }) {
  if (state?.error) return <p role="alert" className="text-body-sm text-danger">{state.error}</p>;
  if (state?.ok) return <p role="status" className="text-body-sm text-gold">{state.ok}</p>;
  return null;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="border border-line p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-headline-md uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Lista de endereços com formulário no lugar (novo ou edição). Um aberto por vez.
export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const current = addresses.find((a) => a.id === editing);
  return (
    <Panel
      title="Endereços"
      action={
        editing === null && (
          <button type="button" onClick={() => setEditing("new")} className={`${linkBtn} text-gold border-gold`}>
            + Adicionar endereço
          </button>
        )
      }
    >
      {editing !== null ? (
        <AddressForm key={editing} address={current} onDone={() => setEditing(null)} />
      ) : addresses.length === 0 ? (
        <p className="text-body-sm text-muted">Nenhum endereço salvo. Adicione um para o checkout já vir preenchido.</p>
      ) : (
        <ul className="flex flex-col">
          {addresses.map((a) => (
            <AddressRow key={a.id} a={a} onEdit={() => setEditing(a.id)} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AddressRow({ a, onEdit }: { a: SavedAddress; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <li className={`py-3 border-b border-line last:border-0 flex flex-col gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <b className="font-body text-label-lg uppercase">{a.label}</b>
        {a.isDefault && <span className="px-1.5 py-0.5 bg-paper text-ink font-body text-label-sm uppercase">Padrão</span>}
        <span className="ml-auto flex flex-wrap gap-x-4 gap-y-2">
          {!a.isDefault && (
            <button type="button" disabled={pending} onClick={() => start(() => setDefaultAddressAction(a.id))} className={`${linkBtn} text-muted border-muted hover:text-paper`}>
              Tornar padrão
            </button>
          )}
          <button type="button" onClick={onEdit} className={`${linkBtn} text-paper border-paper hover:text-gold hover:border-gold`}>
            Editar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => (confirm ? start(() => deleteAddressAction(a.id)) : setConfirm(true))}
            onBlur={() => setConfirm(false)}
            className={`${linkBtn} text-danger border-danger`}
          >
            {confirm ? "Confirmar exclusão" : "Excluir"}
          </button>
        </span>
      </div>
      <p className="text-body-sm">
        {a.street}, {a.number}
        {a.complement ? `, ${a.complement}` : ""} · {a.neighborhood}, {a.city}/{a.state} · <span className="font-mono">{cepFmt(a.cep)}</span>
      </p>
      <p className="text-body-sm text-muted">
        {a.zone ? (
          <>
            {a.zone.name} · <span className="font-mono">{brl(a.zone.fee)}</span>
            {a.zone.freeAbove !== null && ` · grátis acima de ${brl(a.zone.freeAbove)}`}
          </>
        ) : (
          "Fora da área do motoboy · só retirada na loja"
        )}
      </p>
    </li>
  );
}

function AddressForm({ address, onDone }: { address?: SavedAddress; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveAddressAction, undefined);
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={action} className="flex flex-col gap-4">
      {address && <input type="hidden" name="id" value={address.id} />}
      <AddressFields initial={address ?? {}} prefix="ad-" />
      <label className="flex items-center gap-3 text-body-sm text-muted">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="w-5 h-5 accent-gold" />
        Usar como endereço padrão
      </label>
      <Msg state={state} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Salvando..." : "Salvar endereço"}
        </button>
        <button type="button" onClick={onDone} className={ui.btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

type Me = { name: string; email: string; phone: string; cpf: string; birthDate: string };

const maskCpf = (c: string) => `${c.slice(0, 3)}.***.***-${c.slice(9)}`;
const maskPhone = (p: string) => (p.length >= 10 ? `(${p.slice(0, 2)}) ${p.slice(2, -4)}-${p.slice(-4)}` : p);

export function ProfileCard({ me }: { me: Me }) {
  const [mode, setMode] = useState<"view" | "edit" | "password">("view");
  return (
    <Panel
      title="Meus dados"
      action={
        mode === "view" && (
          <span className="flex gap-4">
            <button type="button" onClick={() => setMode("edit")} className={`${linkBtn} border-paper hover:text-gold hover:border-gold`}>
              Editar
            </button>
            <button type="button" onClick={() => setMode("password")} className={`${linkBtn} border-paper hover:text-gold hover:border-gold`}>
              Trocar senha
            </button>
          </span>
        )
      }
    >
      {mode === "view" && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body-sm">
          <Item label="Nome" value={me.name} />
          <Item label="E-mail" value={me.email} />
          <Item label="WhatsApp" value={maskPhone(me.phone)} mono />
          <Item label="CPF" value={maskCpf(me.cpf)} mono />
        </dl>
      )}
      {mode === "edit" && <ProfileForm me={me} onDone={() => setMode("view")} />}
      {mode === "password" && <PasswordForm onDone={() => setMode("view")} />}
    </Panel>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-body text-label-sm uppercase text-muted">{label}</dt>
      <dd className={`truncate ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function ProfileForm({ me, onDone }: { me: Me; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={action} className="flex flex-col gap-3">
      <Field id="name" label="Nome completo" required defaultValue={me.name} />
      <div className="grid grid-cols-2 gap-3">
        <Field id="phone" label="WhatsApp" type="tel" required defaultValue={me.phone} />
        <Field id="birthDate" label="Nascimento" type="date" defaultValue={me.birthDate} />
      </div>
      <p className="text-body-sm text-muted">E-mail e CPF não mudam por aqui. Precisa trocar? Fale com a loja no WhatsApp.</p>
      <Msg state={state} />
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onDone} className={ui.btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <Field id="currentPassword" label="Senha atual" type="password" required autoComplete="current-password" />
      <Field id="newPassword" label="Nova senha" type="password" required minLength={8} autoComplete="new-password" hint="Mínimo de 8 caracteres." />
      <Msg state={state} />
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={ui.btnPrimary}>
          {pending ? "Trocando..." : "Trocar senha"}
        </button>
        <button type="button" onClick={onDone} className={ui.btnGhost}>
          {state?.ok ? "Fechar" : "Cancelar"}
        </button>
      </div>
    </form>
  );
}
