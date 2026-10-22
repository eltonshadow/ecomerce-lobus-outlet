"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { payOrderAction } from "@/actions/store";
import { ui } from "@/design/ui";

export function CopyPix({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }}
      className={`${ui.btnPrimary} w-full`}
    >
      {copied ? "Código copiado" : "Copiar código Pix"}
    </button>
  );
}

export function RefreshStatus() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.refresh()} className={`${ui.btnGhost} w-full`}>
      Já paguei, atualizar status
    </button>
  );
}

// Leva ao checkout da InfinitePay (cria o link de novo se a primeira tentativa falhou).
export function PayButton({ orderNumber, label }: { orderNumber: string; label: string }) {
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={state.busy}
        onClick={async () => {
          setState({ busy: true });
          const r = await payOrderAction(orderNumber);
          if (r.url) window.location.href = r.url;
          else setState({ busy: false, error: r.error });
        }}
        className={`${ui.btnPrimary} w-full`}
      >
        {state.busy ? "Abrindo pagamento..." : label}
      </button>
      {state.error && <p role="alert" className="text-body-sm text-danger">{state.error}</p>}
    </div>
  );
}

// Pedido aguardando: confere o status sozinho enquanto a página está aberta.
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
