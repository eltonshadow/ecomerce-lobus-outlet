"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/admin";

// Formulário genérico do admin: roda a server action e mostra erro/sucesso.
export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Salvar",
  submitClassName = "px-4 py-2 bg-primary text-on-primary font-semibold rounded disabled:opacity-50",
  confirm,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children?: React.ReactNode;
  className?: string;
  submitLabel?: string;
  submitClassName?: string;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
      <button type="submit" disabled={pending} className={submitClassName}>
        {pending ? "Aguarde..." : submitLabel}
      </button>
      {state?.error && <p role="alert" className="text-sm text-error w-full">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-primary w-full">{state.ok}</p>}
    </form>
  );
}
