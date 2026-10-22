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
  if (state?.error) return <p role="alert" className="text-body-md text-danger">{state.error}</p>;
  if (state?.ok) return <p role="status" className="text-body-md text-gold">{state.ok}</p>;
  return null;
}

function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`border border-line p-5 lg:p-6 flex flex-col gap-5 min-w-0 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-headline-md uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Lista de endereços com formulário em largura cheia acima dela (novo ou edição). Um aberto por vez.
export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className={ui.pageTitle}>
          {addresses.length} {addresses.length === 1 ? "endereço salvo" : "endereços salvos"}
        </h2>
        {editing === null && (
          <button type="button" onClick={() => setEditing("new")} className={ui.btnGhost}>
            + Adicionar endereço
          </button>
        )}
      </div>
      {editing === "new" && <AddressEditor key="new" onDone={() => setEditing(null)} />}
      {addresses.length === 0 ? (
        editing === null && <p className="text-body-lg text-muted">Nenhum endereço salvo. Adicione um para o checkout já vir preenchido.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((a) =>
            a.id === editing ? (
              <li key={a.id}>
                <AddressEditor address={a} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <AddressRow key={a.id} a={a} onEdit={() => setEditing(a.id)} />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function AddressEditor({ address, onDone }: { address?: SavedAddress; onDone: () => void }) {
  const title = address ? `Editar ${address.label}` : "Novo endereço";
  return (
    <section aria-label={title} className="border border-gold bg-surface-container-low p-5 lg:p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-headline-md uppercase">{title}</h3>
        <p className="text-body-md text-muted">Digite o CEP, o resto a gente preenche.</p>
      </div>
      <AddressForm address={address} onDone={onDone} />
    </section>
  );
}

function AddressRow({ a, onEdit }: { a: SavedAddress; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <li className={`border p-5 grid gap-x-8 gap-y-4 md:grid-cols-[minmax(0,180px)_1fr_minmax(0,220px)] lg:grid-cols-[minmax(0,180px)_1fr_minmax(0,220px)_auto] ${a.isDefault ? "border-gold" : "border-line"} ${pending ? "opacity-50" : ""}`}>
      <div className="flex flex-col items-start gap-2 min-w-0">
        <b className="font-display text-headline-md uppercase font-normal break-words max-w-full">{a.label}</b>
        {a.isDefault && <span className="px-2 py-1 bg-gold text-ink font-body text-label-sm uppercase">Padrão</span>}
      </div>
      <div className="text-body-lg min-w-0">
        <p>
          {a.street}, {a.number}
          {a.complement ? `, ${a.complement}` : ""}
        </p>
        <p>
          {a.neighborhood}, {a.city}/{a.state}
        </p>
        <p className="mt-1 font-mono text-[14px] font-semibold">CEP {cepFmt(a.cep)}</p>
        {a.reference && <p className="mt-1 text-body-md text-muted">Ref.: {a.reference}</p>}
      </div>
      <div className="min-w-0">
        {a.zone ? (
          <>
            <p className="font-body text-label-sm uppercase text-muted">{a.zone.name}</p>
            <p className="font-display text-[28px] leading-tight tabular-nums">{brl(a.zone.fee)}</p>
            {a.zone.freeAbove !== null && <p className="text-body-md">Grátis acima de {brl(a.zone.freeAbove)}</p>}
          </>
        ) : (
          <p className="border border-outline-variant px-3 py-2 text-body-md text-paper">Fora da área do motoboy. Só retirada na loja.</p>
        )}
      </div>
      <div className="flex flex-wrap lg:flex-col lg:items-end gap-x-6 gap-y-3 md:col-span-3 lg:col-span-1">
        <button type="button" onClick={onEdit} className={`${linkBtn} text-paper border-paper hover:text-gold hover:border-gold`}>
          Editar
        </button>
        {!a.isDefault && (
          <button type="button" disabled={pending} onClick={() => start(() => setDefaultAddressAction(a.id))} className={`${linkBtn} text-paper border-paper hover:text-gold hover:border-gold`}>
            Tornar padrão
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => (confirm ? start(() => deleteAddressAction(a.id)) : setConfirm(true))}
          onBlur={() => setConfirm(false)}
          className={`${linkBtn} text-danger border-danger`}
        >
          {confirm ? "Confirmar exclusão" : "Excluir"}
        </button>
      </div>
    </li>
  );
}

function AddressForm({ address, onDone }: { address?: SavedAddress; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveAddressAction, undefined);
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={action} className="flex flex-col gap-5">
      {address && <input type="hidden" name="id" value={address.id} />}
      <AddressFields initial={address ?? {}} prefix="ad-" />
      <label className="flex items-center gap-3 text-body-md">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="w-5 h-5 accent-gold" />
        Usar como endereço padrão
      </label>
      <Msg state={state} />
      <Actions pending={pending} submit="Salvar endereço" pendingLabel="Salvando..." onCancel={onDone} />
    </form>
  );
}

// Salvar + Cancelar sempre lado a lado, inclusive em 390px.
function Actions({ pending, submit, pendingLabel, onCancel, cancel = "Cancelar" }: { pending: boolean; submit: string; pendingLabel: string; onCancel: () => void; cancel?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:flex-wrap gap-3">
      <button type="submit" disabled={pending} className={`${ui.btnPrimary} whitespace-nowrap !px-4 sm:!px-8`}>
        {pending ? pendingLabel : submit}
      </button>
      <button type="button" onClick={onCancel} className={`${ui.btnGhost} whitespace-nowrap !px-4 sm:!px-8`}>
        {cancel}
      </button>
    </div>
  );
}

type Me = { name: string; email: string; phone: string; cpf: string; birthDate: string };

const maskCpf = (c: string) => `${c.slice(0, 3)}.***.***-${c.slice(9)}`;
const maskPhone = (p: string) => (p.length >= 10 ? `(${p.slice(0, 2)}) ${p.slice(2, -4)}-${p.slice(-4)}` : p);

// Dados sempre visíveis; editar abre o formulário no próprio card. Senha fica em card separado.
export function ProfileCard({ me }: { me: Me }) {
  const [editing, setEditing] = useState(false);
  return (
    <Panel
      title="Meus dados"
      action={
        !editing && (
          <button type="button" onClick={() => setEditing(true)} className={`${linkBtn} border-paper hover:text-gold hover:border-gold`}>
            Editar
          </button>
        )
      }
    >
      {editing ? (
        <ProfileForm me={me} onDone={() => setEditing(false)} />
      ) : (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
          <Item label="Nome" value={me.name} />
          <Item label="E-mail" value={me.email} />
          <Item label="WhatsApp" value={maskPhone(me.phone)} mono />
          <Item label="CPF" value={maskCpf(me.cpf)} mono />
          {me.birthDate && <Item label="Nascimento" value={me.birthDate.split("-").reverse().join("/")} mono />}
        </dl>
      )}
    </Panel>
  );
}

export function PasswordCard() {
  const [open, setOpen] = useState(false);
  return (
    <Panel title="Senha">
      {open ? (
        <PasswordForm onDone={() => setOpen(false)} />
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-body-lg text-muted">Use pelo menos 8 caracteres. Você continua logado depois da troca.</p>
          <button type="button" onClick={() => setOpen(true)} className={ui.btnGhost}>
            Trocar senha
          </button>
        </div>
      )}
    </Panel>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-body text-label-sm uppercase text-muted">{label}</dt>
      <dd className={`mt-1 text-body-lg text-paper break-words ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function ProfileForm({ me, onDone }: { me: Me; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="name" label="Nome completo" required defaultValue={me.name} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="phone" label="WhatsApp" type="tel" required defaultValue={me.phone} />
        <Field id="birthDate" label="Nascimento" type="date" defaultValue={me.birthDate} />
      </div>
      <p className="text-body-md text-muted">E-mail e CPF não mudam por aqui. Precisa trocar? Fale com a loja no WhatsApp.</p>
      <Msg state={state} />
      <Actions pending={pending} submit="Salvar" pendingLabel="Salvando..." onCancel={onDone} />
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="currentPassword" label="Senha atual" type="password" required autoComplete="current-password" />
      <Field id="newPassword" label="Nova senha" type="password" required minLength={8} autoComplete="new-password" hint="Mínimo de 8 caracteres." />
      <Msg state={state} />
      <Actions pending={pending} submit="Trocar senha" pendingLabel="Trocando..." onCancel={onDone} cancel={state?.ok ? "Fechar" : "Cancelar"} />
    </form>
  );
}
