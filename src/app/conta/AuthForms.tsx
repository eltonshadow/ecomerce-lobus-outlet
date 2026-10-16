"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomerAction, registerCustomerAction } from "@/actions/account";
import { ui } from "@/design/ui";

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
    <form action={action} className="flex flex-col gap-4" key={k}>
      <input type="hidden" name="next" value={next} />
      <Field id="name" label="Nome completo" required autoComplete="name" defaultValue={v.name} />
      <Field id="email" label="E-mail" type="email" required autoComplete="email" defaultValue={v.email} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="phone" label="WhatsApp com DDD" type="tel" required autoComplete="tel" inputMode="tel" placeholder="(62) 99999-9999" defaultValue={v.phone} />
        <Field id="cpf" label="CPF" required inputMode="numeric" placeholder="000.000.000-00" defaultValue={v.cpf} />
      </div>
      <Field id="password" label="Senha (mín. 8 caracteres)" type="password" required minLength={8} autoComplete="new-password" />
      {state?.error && <p role="alert" className="text-body-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={ui.btnPrimary}>
        {pending ? "Criando conta..." : "Criar conta"}
      </button>
      <p className="text-body-sm text-muted">
        Já tem conta?{" "}
        <Link href={`/conta/entrar?next=${encodeURIComponent(next)}`} className="text-gold underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
