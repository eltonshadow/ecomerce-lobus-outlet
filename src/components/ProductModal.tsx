"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, MessageCircle, Ruler, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";

export function ProductModal() {
  const { activeProductModal, setActiveProductModal, addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showMeasurements, setShowMeasurements] = useState(false);

  if (!activeProductModal) return null;

  const product = activeProductModal;
  const availableVariants = product.variants.filter((v) => v.stockQuantity > 0);

  // O modal é único na página: um tamanho escolhido em outro produto pode não existir neste.
  const currentSize = availableVariants.some((v) => v.size === selectedSize)
    ? selectedSize
    : (availableVariants[0]?.size ?? "");
  const selectedVariant = product.variants.find((v) => v.size === currentSize);

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const close = () => {
    setSelectedImageIndex(0);
    setActiveProductModal(null);
  };

  const handleAddToCart = () => {
    if (!currentSize) return;
    addToCart(product, currentSize);
    close();
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho uma dúvida sobre a peça "${product.name}" (Tamanho ${currentSize || "M"}) da LOBUS Outlet.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Botão Fechar */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-2 gap-5">
          {/* Coluna 1: Galeria de Imagens */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/5] w-full bg-zinc-950 rounded-xl overflow-hidden">
              <Image
                src={product.images[selectedImageIndex] ?? product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
              />
              {discountPercent && (
                <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded shadow">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Miniaturas se houver mais de 1 foto */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-amber-400"
                        : "border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna 2: Detalhes, Tamanho e Ações */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {product.category}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-tight">
                {product.name}
              </h2>

              {/* Preços */}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-zinc-500 line-through">
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 font-medium">
                Pagamento via Pix
              </p>

              {/* Descrição */}
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                {product.description}
              </p>

              {product.modelInfo && (
                <div className="mt-2 text-[11px] text-zinc-400 bg-zinc-800/60 p-2 rounded border border-zinc-800">
                  👕 <span className="font-semibold text-zinc-300">Medidas do Modelo:</span> {product.modelInfo}
                </div>
              )}
            </div>

            {/* Seletor de Tamanhos */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Selecione o Tamanho:
                </span>
                {product.measurementsGuide && (
                  <button
                    onClick={() => setShowMeasurements(!showMeasurements)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    {showMeasurements ? "Ocultar Medidas" : "Guia de Medidas (cm)"}
                  </button>
                )}
              </div>

              {/* Tabela de Medidas (Condicional) */}
              {showMeasurements && product.measurementsGuide && (
                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[11px] overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                        {product.measurementsGuide.headers.map((h, i) => (
                          <th key={i} className="py-1 px-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.measurementsGuide.rows.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-900 last:border-0 text-zinc-300">
                          <td className="py-1 px-1.5 font-bold text-amber-400">{row.size}</td>
                          {product.measurementsGuide?.headers.slice(1).map((h, j) => (
                            <td key={j} className="py-1 px-1.5">{row[h] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grade de Botões de Tamanho */}
              <div className="grid grid-cols-4 gap-2">
                {product.variants.map((v) => {
                  const hasStock = v.stockQuantity > 0;
                  const isSelected = currentSize === v.size;
                  return (
                    <button
                      key={v.id}
                      onClick={() => hasStock && setSelectedSize(v.size)}
                      disabled={!hasStock}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-amber-400 text-black border-amber-400 shadow-md"
                          : hasStock
                          ? "bg-zinc-800 text-white border-zinc-700 hover:border-amber-400"
                          : "bg-zinc-950 text-zinc-600 border-zinc-800/80 cursor-not-allowed line-through"
                      }`}
                    >
                      <span>{v.size}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {hasStock ? `${v.stockQuantity} un` : "Esgotado"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedVariant && selectedVariant.stockQuantity <= 2 && selectedVariant.stockQuantity > 0 && (
                <p className="text-[11px] text-red-400 font-bold">
                  🔥 Restam apenas {selectedVariant.stockQuantity} unidade(s) neste tamanho!
                </p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                Adicionar à Sacola
              </button>

              <a
                href={`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-zinc-700"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Dúvida desta peça no WhatsApp
              </a>

              {/* Vantagens Rápidas */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  Motoboy hoje em Goiânia
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Troca garantida em até 7 dias
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
