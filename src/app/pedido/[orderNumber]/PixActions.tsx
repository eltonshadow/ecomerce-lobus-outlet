"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold hover:brightness-110 transition-all"
    >
      {copied ? "Código copiado" : "Copiar código Pix"}
    </button>
  );
}

export function RefreshStatus() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="w-full py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-colors"
    >
      Já paguei, atualizar status
    </button>
  );
}
