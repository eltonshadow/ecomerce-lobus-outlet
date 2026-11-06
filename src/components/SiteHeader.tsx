"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useMe } from "@/hooks/useMe";
import { ui } from "@/design/ui";

// Header das telas internas (conta, pedido). A home tem o próprio, com busca e categorias.
export function SiteHeader() {
  const { totalItems, setIsCartOpen } = useCart();
  const me = useMe();
  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-line">
      <div className={`${ui.container} py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3`}>
        <Link href="/" aria-label="Tropa da Mauá, início" className="shrink-0 flex items-center gap-3">
          <img src="/logo.png" alt="Tropa da Mauá" className="h-12 w-auto" />
          <span className="font-display text-xl uppercase tracking-wider text-paper hidden sm:inline">TROPA DA MAUÁ</span>
        </Link>
        <nav aria-label="Navegação" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className={ui.navLink}>
            Loja
          </Link>
          {me === undefined ? (
            <span className={`${ui.navLink} opacity-0`} aria-hidden="true">
              Conta
            </span>
          ) : me ? (
            <Link href="/conta" className={ui.navLink}>
              Minha conta
            </Link>
          ) : (
            <Link href="/conta/entrar" className={ui.navLink}>
              Entrar
            </Link>
          )}
          <button type="button" onClick={() => setIsCartOpen(true)} className={ui.navLink}>
            Sacola (<span className="tabular-nums">{totalItems}</span>)
          </button>
        </nav>
      </div>
    </header>
  );
}
