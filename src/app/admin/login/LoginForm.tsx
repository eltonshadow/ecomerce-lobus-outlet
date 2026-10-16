"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
        E-mail
        <input name="email" type="email" required autoComplete="username" className="bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-on-surface-variant">
        Senha
        <input name="password" type="password" required autoComplete="current-password" className="bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:border-primary" />
      </label>
      {state?.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
      <button type="submit" disabled={pending} className="py-3 bg-primary text-on-primary font-semibold rounded uppercase tracking-wider disabled:opacity-50">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
