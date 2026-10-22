"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createOrderAction, quoteCheckoutAction } from "@/actions/store";
import { useCart } from "@/context/CartContext";
import { useMe } from "@/hooks/useMe";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { PICKUP_STORE_INFO, LOCAL_DELIVERY_ZONES } from "@/data/delivery-zones";

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
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

  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", cpf: "", cep: "", street: "", number: "", neighborhood: "", complement: "", notes: "" });
  // Logado: dados da conta e endereço padrão preenchem o checkout (o vínculo do pedido à conta é feito no servidor).
  const [addrId, setAddrId] = useState("outro");
  type Saved = NonNullable<ReturnType<typeof useMe>>["addresses"][number];
  const pickAddress = (a: Saved) => {
    setAddrId(a.id);
    setForm((f) => ({ ...f, cep: a.cep, street: a.street, number: a.number, neighborhood: a.neighborhood, complement: a.complement ?? "", notes: a.reference ?? "" }));
  };
  const me = useMe((m) => {
    setForm((f) => ({ ...f, name: f.name || m.name, phone: f.phone || m.phone, email: f.email || m.email, cpf: f.cpf || m.cpf }));
    if (m.addresses[0]) pickAddress(m.addresses[0]);
  });
  const saved = me?.addresses ?? [];
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  type Quote = { subtotal: number; deliveryFee: number; deliveryZoneName: string | null; discountValue: number; total: number; payOnline: boolean };
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cartItems = items.map((it) => ({ variantId: it.variantId, quantity: it.quantity }));
  const cartKey = JSON.stringify(cartItems);
  const cepDigits = form.cep.replace(/\D/g, "");

  // Total oficial sempre vem do servidor (preço, frete por CEP e cupom).
  // A resposta guarda a chave do pedido de cálculo: resposta de um estado antigo é ignorada.
  const needsCep = deliveryType === "MOTOBOY" && cepDigits.length !== 8;
  const quoteKey = JSON.stringify([cartKey, deliveryType, cepDigits, appliedCoupon]);
  const [quoteResult, setQuoteResult] = useState<{ key: string; quote: Quote | null; error: string } | null>(null);
  useEffect(() => {
    if (!isCheckingOut || items.length === 0 || needsCep) return;
    let cancelled = false;
    quoteCheckoutAction({ items: JSON.parse(cartKey), deliveryMethod: deliveryType, cep: cepDigits, couponCode: appliedCoupon || undefined }).then((r) => {
      if (!cancelled) setQuoteResult({ key: quoteKey, quote: r.success ? r.quote : null, error: r.success ? "" : r.error });
    });
    return () => {
      cancelled = true;
    };
  }, [isCheckingOut, needsCep, quoteKey, deliveryType, cepDigits, appliedCoupon, cartKey, items.length]);
  const current = !needsCep && quoteResult?.key === quoteKey ? quoteResult : null;
  const quote = current?.quote ?? null;
  const quoteError = needsCep ? "Informe o CEP para calcular a entrega." : (current?.error ?? "");

  if (!isCartOpen) return null;

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400";
  const labelClass = "text-xs font-bold text-zinc-300 block mb-1";

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const r = await createOrderAction({
      items: cartItems,
      deliveryMethod: deliveryType,
      cep: cepDigits,
      couponCode: appliedCoupon || undefined,
      customer: { name: form.name, phone: form.phone, email: form.email, cpf: form.cpf },
      shipping: deliveryType === "MOTOBOY" ? { street: form.street, number: form.number, neighborhood: form.neighborhood, complement: form.complement, notes: form.notes } : undefined,
    });
    if (!r.success) {
      setSubmitting(false);
      setSubmitError(r.error);
      return;
    }
    clearCart();
    // InfinitePay: vai para o checkout deles e volta para /pedido/N. Sem link: a página do pedido oferece "Pagar agora".
    if (r.checkoutUrl) {
      window.location.href = r.checkoutUrl;
      return;
    }
    setSubmitting(false);
    setIsCheckingOut(false);
    setIsCartOpen(false);
    router.push(`/pedido/${r.orderNumber}`);
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
            /* Finalização: dados do cliente + total calculado no servidor */
            <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-1">
              {me ? (
                <p className="text-xs text-zinc-400 border border-zinc-800 p-2.5">
                  Comprando como <strong className="text-white">{me.email}</strong>. O pedido fica salvo em Minha conta.
                </p>
              ) : me === null ? (
                <p className="text-xs text-zinc-400 border border-zinc-800 p-2.5">
                  Tem conta?{" "}
                  <a href="/conta/entrar?next=/" className="text-amber-400 underline">
                    Entre
                  </a>{" "}
                  para preencher seus dados e acompanhar todos os pedidos. Sua sacola continua salva.
                </p>
              ) : null}
              <div>
                <label htmlFor="ck-name" className={labelClass}>Nome completo</label>
                <input id="ck-name" type="text" required autoComplete="name" placeholder="Ex: Carlos Oliveira" className={inputClass} {...field("name")} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ck-phone" className={labelClass}>WhatsApp (com DDD)</label>
                  <input id="ck-phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="(62) 99999-9999" className={inputClass} {...field("phone")} />
                </div>
                <div>
                  <label htmlFor="ck-cpf" className={labelClass}>CPF</label>
                  <input id="ck-cpf" type="text" required inputMode="numeric" placeholder="000.000.000-00" className={inputClass} {...field("cpf")} />
                </div>
              </div>
              <div>
                <label htmlFor="ck-email" className={labelClass}>E-mail</label>
                <input id="ck-email" type="email" required autoComplete="email" placeholder="voce@email.com" className={inputClass} {...field("email")} />
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                {deliveryType === "PICKUP" ? (
                  <p><strong className="text-white">Retirada na loja:</strong> {PICKUP_STORE_INFO.address}</p>
                ) : (
                  <p><strong className="text-white">Entrega por motoboy.</strong> A taxa é calculada pelo CEP.</p>
                )}
                <button type="button" onClick={() => setIsCheckingOut(false)} className="mt-1 text-amber-400 hover:text-amber-300 font-semibold">
                  Trocar forma de entrega
                </button>
              </div>

              {deliveryType === "MOTOBOY" && saved.length > 0 && (
                <fieldset className="space-y-2">
                  <legend className={labelClass}>Entregar em</legend>
                  {saved.map((a) => (
                    <label key={a.id} className={`flex gap-3 items-start border p-2.5 cursor-pointer ${addrId === a.id ? "border-gold" : "border-line"}`}>
                      <input type="radio" name="ck-addr" checked={addrId === a.id} onChange={() => pickAddress(a)} className="mt-1 accent-gold" />
                      <span className="text-xs">
                        <strong className="text-white">{a.label}</strong>
                        <span className="block text-zinc-400">{a.street}, {a.number} · {a.neighborhood} · {a.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}</span>
                      </span>
                    </label>
                  ))}
                  <label className={`flex gap-3 items-center border p-2.5 cursor-pointer text-xs ${addrId === "outro" ? "border-gold" : "border-line"}`}>
                    <input type="radio" name="ck-addr" checked={addrId === "outro"} onChange={() => { setAddrId("outro"); setForm((f) => ({ ...f, cep: "", street: "", number: "", neighborhood: "", complement: "", notes: "" })); }} className="accent-gold" />
                    <strong className="text-white">Outro endereço</strong>
                  </label>
                </fieldset>
              )}

              {deliveryType === "MOTOBOY" && (saved.length === 0 || addrId === "outro") && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="ck-cep" className={labelClass}>CEP</label>
                      <input id="ck-cep" type="text" required inputMode="numeric" autoComplete="postal-code" placeholder="74000-000" className={inputClass} {...field("cep")} />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="ck-neigh" className={labelClass}>Bairro</label>
                      <input id="ck-neigh" type="text" required className={inputClass} {...field("neighborhood")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label htmlFor="ck-street" className={labelClass}>Rua</label>
                      <input id="ck-street" type="text" required autoComplete="address-line1" className={inputClass} {...field("street")} />
                    </div>
                    <div>
                      <label htmlFor="ck-number" className={labelClass}>Número</label>
                      <input id="ck-number" type="text" required className={inputClass} {...field("number")} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ck-comp" className={labelClass}>Complemento (opcional)</label>
                    <input id="ck-comp" type="text" className={inputClass} {...field("complement")} />
                  </div>
                  <div>
                    <label htmlFor="ck-notes" className={labelClass}>Ponto de referência (opcional)</label>
                    <textarea id="ck-notes" rows={2} className={inputClass} {...field("notes")} />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="ck-coupon" className={labelClass}>Cupom de desconto</label>
                <div className="flex gap-2">
                  <input id="ck-coupon" type="text" placeholder="Ex: LOBOS10" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className={inputClass} />
                  {appliedCoupon ? (
                    <button type="button" onClick={() => { setAppliedCoupon(""); setCouponInput(""); }} className="px-3 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700">Remover</button>
                  ) : (
                    <button type="button" onClick={() => setAppliedCoupon(couponInput.trim())} disabled={!couponInput.trim()} className="px-3 bg-zinc-800 text-amber-400 text-xs font-bold rounded-lg hover:bg-zinc-700 disabled:opacity-50">Aplicar</button>
                  )}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5" aria-live="polite">
                {quote ? (
                  <>
                    <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>R$ {quote.subtotal.toFixed(2).replace(".", ",")}</span></div>
                    {quote.discountValue > 0 && (
                      <div className="flex justify-between text-emerald-400"><span>Desconto ({appliedCoupon})</span><span>- R$ {quote.discountValue.toFixed(2).replace(".", ",")}</span></div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>{deliveryType === "PICKUP" ? "Retirada na loja" : `Entrega${quote.deliveryZoneName ? ` (${quote.deliveryZoneName})` : ""}`}</span>
                      <span>{quote.deliveryFee === 0 ? <strong className="text-emerald-400">GRÁTIS</strong> : `R$ ${quote.deliveryFee.toFixed(2).replace(".", ",")}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-zinc-800">
                      <span>Total</span><span className="text-amber-400">R$ {quote.total.toFixed(2).replace(".", ",")}</span>
                    </div>
                    {quote.payOnline && (
                      <p className="pt-1.5 text-zinc-400">
                        Pagamento pela <strong className="text-white">InfinitePay</strong>: Pix, crédito à vista ou parcelado, Apple Pay e Google Pay. Você escolhe na tela deles e volta para a página do pedido.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-400">{quoteError || "Calculando total..."}</p>
                )}
              </div>

              {submitError && (
                <p role="alert" className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg p-2.5">{submitError}</p>
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
                  disabled={!quote || submitting}
                  className="flex-1 py-3 bg-gold hover:bg-goldHover disabled:bg-zinc-800 disabled:text-zinc-500 text-ink font-body text-label-lg uppercase transition flex items-center justify-center gap-2"
                >
                  {submitting ? "Gerando pedido..." : quote?.payOnline ? "Ir para o pagamento" : "Gerar pedido e pagar no Pix"}
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
