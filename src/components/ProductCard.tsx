"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { useCart } from "@/context/CartContext";
import { Eye, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { setActiveProductModal, addToCart } = useCart();

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

  // Seleciona o primeiro tamanho disponível para compra rápida
  const defaultAvailableVariant = product.variants.find((v) => v.stockQuantity > 0);

  return (
    <div className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition duration-200">
      {/* Container de Imagem */}
      <div
        onClick={() => setActiveProductModal(product)}
        className="relative aspect-4/5 w-full bg-zinc-950 overflow-hidden cursor-pointer"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges de Destaque */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded shadow">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-400 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">
              Destaque
            </span>
          )}
        </div>

        {totalStock === 0 && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-red-600/80 px-3 py-1 rounded">
              Esgotado
            </span>
          </div>
        )}

        {/* Botão Hover de Ver Detalhes (Desktop) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2">
          <span className="bg-white/95 text-black text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition">
            <Eye className="w-4 h-4" /> Ver Peça
          </span>
        </div>
      </div>

      {/* Informações do Produto */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {product.category}
          </span>
          <h3
            onClick={() => setActiveProductModal(product)}
            className="text-sm font-bold text-white line-clamp-2 hover:text-amber-400 cursor-pointer transition mt-0.5"
          >
            {product.name}
          </h3>
        </div>

        {/* Grade de Tamanhos Rápidos */}
        <div className="flex flex-wrap items-center gap-1">
          {product.variants.map((variant) => {
            const hasStock = variant.stockQuantity > 0;
            return (
              <span
                key={variant.id}
                title={hasStock ? `Em estoque (${variant.stockQuantity} un)` : "Esgotado"}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  hasStock
                    ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                    : "bg-zinc-950 text-zinc-600 border-zinc-800/60 line-through"
                }`}
              >
                {variant.size}
              </span>
            );
          })}
        </div>

        {/* Preços e Ação */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
          <div>
            {product.originalPrice && (
              <span className="block text-[11px] text-zinc-500 line-through">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
            <div className="text-base font-extrabold text-amber-400">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">
              no Pix ou até 3x
            </span>
          </div>

          <button
            onClick={() => {
              if (defaultAvailableVariant) {
                addToCart(product, defaultAvailableVariant.size);
              } else {
                setActiveProductModal(product);
              }
            }}
            disabled={totalStock === 0}
            className="p-2 sm:px-3 sm:py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Adicionar ao Carrinho"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
