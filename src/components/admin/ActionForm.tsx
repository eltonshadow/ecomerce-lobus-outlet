"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/admin";
import { ui } from "@/design/ui";

// Formulário genérico do admin: roda a server action e mostra erro/sucesso.
export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Salvar",
  submitClassName = ui.btnPrimary,
  confirm,
  messageClassName,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children?: React.ReactNode;
  className?: string;
  submitLabel?: string;
  submitClassName?: string;
  confirm?: string;
  messageClassName?: string;
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
      {state?.error && <p role="alert" className={`text-body-sm text-danger w-full ${messageClassName ?? ""}`}>{state.error}</p>}
      {state?.ok && <p role="status" className={`text-body-sm text-gold w-full ${messageClassName ?? ""}`}>{state.ok}</p>}
    </form>
  );
}
