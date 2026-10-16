"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { PICKUP_STORE_INFO, LOCAL_DELIVERY_ZONES } from "@/data/delivery-zones";

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    deliveryType,
    setDeliveryType,
    selectedZoneId,
    setSelectedZoneId,
    deliveryFee,
    grandTotal,
    isCartOpen,
    setIsCartOpen,
    freeShippingProgress,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    const deliveryDescription =
      deliveryType === "PICKUP"
        ? `*Retirada no Balcão:* Loja Física no Jardim Novo Mundo (Grátis)`
        : `*Entrega via Motoboy:* ${shippingAddress} (Taxa: R$ ${deliveryFee.toFixed(2).replace(".", ",")})`;

    const itemsSummary = items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.product.name} (Tam: ${it.selectedSize}) - R$ ${(
            it.unitPrice * it.quantity
          ).toFixed(2).replace(".", ",")}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `🐺 *NOVO PEDIDO - LOBOS G OUTLET*\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*WhatsApp:* ${customerPhone}\n\n` +
      `*ITENS DO PEDIDO:*\n${itemsSummary}\n\n` +
      `*Subtotal:* R$ ${subtotal.toFixed(2).replace(".", ",")}\n` +
      `${deliveryDescription}\n` +
      `*TOTAL:* R$ ${grandTotal.toFixed(2).replace(".", ",")}\n\n` +
      `Gostaria de confirmar o pagamento via Pix Dinâmico e combinar o envio!`
    );

    window.open(`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col text-white shadow-2xl">
        {/* Cabeçalho do Carrinho */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base">Sua Sacola de Compras</h2>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-semibold">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckingOut(false);
            }}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
            aria-label="Fechar Carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso do Frete Grátis Regional */}
        {deliveryType === "MOTOBOY" && (
          <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 text-xs">
            {freeShippingProgress.missingAmount > 0 ? (
              <p className="text-zinc-300 mb-1.5">
                Faltam <strong className="text-amber-400">R$ {freeShippingProgress.missingAmount.toFixed(2).replace(".", ",")}</strong> para você ganhar <strong className="text-emerald-400">Frete Grátis</strong> no Motoboy!
              </p>
            ) : (
              <p className="text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Parabéns! Você ganhou Frete Grátis no Motoboy!
              </p>
            )}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${freeShippingProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mb-3 stroke-1" />
              <p className="font-bold text-white text-base">Sua sacola está vazia</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Aproveite as ofertas exclusivas e garanta seu look antes que esgote o seu tamanho.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-4 py-2 bg-amber-400 text-black text-xs font-bold rounded-lg hover:bg-amber-300 transition"
              >
                Ver Roupas do Outlet
              </button>
            </div>
          ) : !isCheckingOut ? (
            <>
              {/* Lista de Itens */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 items-center"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                      <div>
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <span className="inline-block text-[10px] bg-zinc-800 text-amber-400 font-bold px-1.5 py-0.5 rounded mt-0.5">
                          Tamanho: {item.selectedSize}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white">
                          R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                        {/* Controles de Quantidade */}
                        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 hover:text-amber-400 text-zinc-400"
                            aria-label="Diminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 hover:text-amber-400 text-zinc-400"
                            aria-label="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Seletor de Logística Local (Sem Agregador) */}
              <div className="pt-2 border-t border-zinc-800 space-y-2.5">
                <span className="text-xs font-bold text-zinc-300 block">
                  Escolha como receber seu pedido:
                </span>

                {/* Opção 1: Motoboy Local */}
                <div
                  onClick={() => setDeliveryType("MOTOBOY")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                    deliveryType === "MOTOBOY"
                      ? "bg-zinc-800/90 border-amber-400"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Entrega Expressa via Motoboy</p>
                        <p className="text-[10px] text-zinc-400">Goiânia e Aparecida de Goiânia</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400">
                      {deliveryFee === 0 ? "GRÁTIS" : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>

                  {/* Dropdown de Zonas de Goiânia */}
                  {deliveryType === "MOTOBOY" && (
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-lg p-2 focus:outline-none focus:border-amber-400"
                    >
                      {LOCAL_DELIVERY_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} (Taxa: R$ {zone.fee.toFixed(2).replace(".", ",")})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Opção 2: Retirada na Loja */}
                <div
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    deliveryType === "PICKUP"
                      ? "bg-zinc-800/90 border-amber-400"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Retirar no Balcão da Loja</p>
                      <p className="text-[10px] text-zinc-400">Jardim Novo Mundo (Pronto em 1h)</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">GRÁTIS</span>
                </div>
              </div>
            </>
          ) : (
            /* Formulário Rápido de Finalização */
            <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-1">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
                <span className="font-bold text-amber-400 block mb-1">
                  Resumo Rápido para Pagamento
                </span>
                <p className="text-zinc-300">
                  Total com {deliveryType === "PICKUP" ? "Retirada" : "Motoboy"}:{" "}
                  <strong className="text-white text-sm">
                    R$ {grandTotal.toFixed(2).replace(".", ",")}
                  </strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Seu Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Oliveira"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Seu WhatsApp (com DDD):
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (62) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {deliveryType === "MOTOBOY" && (
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Endereço de Entrega (Rua, Número, Bairro):
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ex: Rua 10, nº 120, Setor Bueno, Apto 402"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="py-2.5 px-3 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-700 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Gerar Pedido & Pagar no Pix
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Rodapé do Carrinho com Totais e Botão de Ação */}
        {items.length > 0 && !isCheckingOut && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal dos Produtos</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxa de Entrega</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-400">GRÁTIS</strong>
                  ) : (
                    `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-amber-400">
                  R$ {grandTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
            >
              Avançar para o Pagamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
