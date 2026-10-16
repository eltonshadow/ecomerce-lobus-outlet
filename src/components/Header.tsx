"use client";

import { ShoppingBag, MessageCircle, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useCart } from "@/context/CartContext";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-black text-white border-b border-zinc-800">
      {/* Top Banner de Destaque Operacional */}
      <div className="bg-zinc-900 text-zinc-300 text-[11px] md:text-xs py-1.5 px-3 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-emerald-400">Entrega Expressa via Motoboy:</span>
            <span>Goiânia e Região Metropolitana</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 shrink-0 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" />
              Retirada no Jardim Novo Mundo (Grátis)
            </span>
          </div>
        </div>
      </div>

      {/* Barra Principal de Navegação */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Identidade Visual / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">
              LOBOS G
            </span>
            <span className="text-[10px] tracking-widest font-semibold text-amber-400 uppercase -mt-1">
              Outlet Streetwear
            </span>
          </div>
        </div>

        {/* Ações Rápidas (Instagram, WhatsApp e Carrinho) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Instagram Oficial */}
          <a
            href={PICKUP_STORE_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title="Siga no Instagram @lobosg.outlet"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-800 transition"
          >
            <InstagramIcon className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline font-medium">@lobosg.outlet</span>
          </a>

          {/* WhatsApp Loja */}
          <a
            href={`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Lobos%20G%20Outlet%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Fale no WhatsApp"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-800 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-medium">WhatsApp</span>
          </a>

          {/* Botão do Carrinho */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg transition active:scale-95 cursor-pointer shadow-sm"
            aria-label="Abrir Carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center border-2 border-black animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
