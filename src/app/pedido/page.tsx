"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Rastreio sem conta: o cliente digita o número que recebeu ao finalizar (ex: LOB-A40E8C33).
export default function RastrearPedido() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = code.trim().toUpperCase();
    if (n) router.push(`/pedido/${encodeURIComponent(n.startsWith("LOB-") ? n : `LOB-${n}`)}`);
  };

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto px-gutter-mobile py-space-md flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="LOBUS Outlet" className="h-14 w-auto" />
          </Link>
          <Link href="/" className="font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-tertiary">
            Voltar à loja
          </Link>
        </div>
      </header>
      <section className="max-w-md mx-auto px-gutter-mobile py-space-xl flex flex-col gap-space-md">
        <h1 className="font-headline-lg text-headline-lg uppercase">Acompanhar pedido</h1>
        <p className="text-on-surface-variant">Digite o número do pedido que apareceu ao finalizar a compra.</p>
        <form onSubmit={submit} className="flex flex-col gap-space-sm">
          <label htmlFor="order-code" className="text-sm text-on-surface-variant">Número do pedido</label>
          <input
            id="order-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="LOB-A40E8C33"
            className="bg-surface-container-low border border-outline-variant rounded px-3 py-3 uppercase focus:outline-none focus:border-primary"
          />
          <button type="submit" className="py-3 bg-primary text-on-primary font-semibold rounded uppercase tracking-wider">
            Ver pedido
          </button>
        </form>
      </section>
    </main>
  );
}
