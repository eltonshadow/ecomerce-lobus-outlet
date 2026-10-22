"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomerAction, registerCustomerAction } from "@/actions/account";
import { ui } from "@/design/ui";
import { AddressFields, Field as AField } from "@/components/AddressFields";

function Field({ id, label, ...rest }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 font-body text-label-sm uppercase text-muted">
      {label}
      <input id={id} name={id} className={`${ui.input} normal-case tracking-normal`} {...rest} />
    </label>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginCustomerAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field id="email" label="E-mail" type="email" required autoComplete="email" defaultValue={state?.values?.email} key={`e-${state?.values?.email}`} />
      <Field id="password" label="Senha" type="password" required autoComplete="current-password" />
      {state?.error && <p role="alert" className="text-body-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={ui.btnPrimary}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-body-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href={`/conta/cadastro?next=${encodeURIComponent(next)}`} className="text-gold underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerCustomerAction, undefined);
  const v = state?.values ?? {};
  // key força o React a reaplicar defaultValue depois de um erro (o form é resetado no submit).
  const k = JSON.stringify(v);
  return (
    <form action={action} className="flex flex-col" key={k}>
      <input type="hidden" name="next" value={next} />
      <Block n="01" title="Seus dados" note="Vão no pedido e no recibo">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <AField id="name" label="Nome completo" required autoComplete="name" defaultValue={v.name} className="sm:col-span-3" />
          <AField id="cpf" label="CPF" required inputMode="numeric" placeholder="000.000.000-00" defaultValue={v.cpf} className="sm:col-span-2" />
          <AField id="birthDate" label="Nascimento" type="date" defaultValue={v.birthDate} />
          <AField id="phone" label="WhatsApp com DDD" type="tel" required autoComplete="tel" inputMode="tel" placeholder="(62) 99999-9999" defaultValue={v.phone} className="sm:col-span-2" hint="Avisos do pedido e do motoboy chegam aqui." />
          <AField id="email" label="E-mail" type="email" required autoComplete="email" defaultValue={v.email} className="sm:col-span-4" hint="Recibo do pagamento e login." />
        </div>
      </Block>
      <Block n="02" title="Endereço de entrega" note="Você pode adicionar outros depois, na sua conta">
        <AddressFields initial={v} />
      </Block>
      <Block n="03" title="Senha">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AField id="password" label="Senha" type="password" required minLength={8} autoComplete="new-password" hint="Mínimo de 8 caracteres." />
          <AField id="password2" label="Repita a senha" type="password" required minLength={8} autoComplete="new-password" />
        </div>
      </Block>
      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
        {state?.error && <p role="alert" className="text-body-sm text-danger basis-full">{state.error}</p>}
        <p className="text-body-sm text-muted">
          Já tem conta?{" "}
          <Link href={`/conta/entrar?next=${encodeURIComponent(next)}`} className="text-gold underline">
            Entrar
          </Link>
        </p>
        <button type="submit" disabled={pending} className={`${ui.btnPrimary} sm:ml-auto w-full sm:w-auto`}>
          {pending ? "Criando conta..." : "Criar conta"}
        </button>
      </div>
    </form>
  );
}

function Block({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-4 pb-6 min-w-0">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
        <span className="font-mono text-[13px] font-semibold text-gold">{n}</span>
        <h2 className="font-display text-headline-md uppercase">{title}</h2>
        {note && <small className="text-body-sm text-muted sm:ml-auto">{note}</small>}
      </div>
      {children}
    </fieldset>
  );
}
