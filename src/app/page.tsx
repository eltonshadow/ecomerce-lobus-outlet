"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MOCK_PRODUCTS,
  CATEGORIES,
  CATEGORY_CARDS,
  PROMO_KITS,
  CUSTOMER_TESTIMONIALS,
  HERO_IMAGE,
} from "@/data/mock-products";
import { ProductCard } from "@/components/ProductCard";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";
import {
  Truck,
  MapPin,
  Zap,
  ShieldCheck,
  MessageCircle,
  Clock,
  ChevronRight,
  Flame,
  Star,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("Todos");
  const { setIsCartOpen, addToCart } = useCart();

  // Filtragem combinada por Categoria e Tamanho
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchCategory =
      selectedCategory === "Todas" ||
      product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "Kits & Combos" && product.isOutletDiscount);

    const matchSize =
      selectedSizeFilter === "Todos" ||
      product.variants.some(
        (v) => v.size.includes(selectedSizeFilter) && v.stockQuantity > 0
      );

    return matchCategory && matchSize;
  });

  const SIZES = ["Todos", "P", "M", "G", "GG", "38", "40", "42"];

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* 1. HERO SECTION ESTILO STITCH (LUXURY STREETWEAR & GOLD ACCENTS) */}
      <section className="relative w-full overflow-hidden bg-zinc-950 border-b border-zinc-800">
        {/* Glow de Iluminação Dourada Ambiente */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Coluna Esquerda: Textos & Chamada */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
              {/* Ticker de Selos */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Drop da Semana
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Envio em 24h
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Autêntico
                </span>
              </div>

              {/* Título Principal */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                  O Melhor do <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                    Streetwear
                  </span>{" "}
                  &amp; Grifes
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Camisetas fio 40.1 peruano, polos exclusivas, bermudas com elastano, moletons heavyweight e sneakers originais com até <strong>50% OFF</strong> no outlet.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("vitrine");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  Ver Lançamentos do Drop
                  <ChevronRight className="w-4 h-4" />
                </button>
                <a
                  href="#combos"
                  className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition border border-zinc-800 flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Kits Promocionais
                </a>
              </div>

              {/* Métricas de Confiança */}
              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl text-center">
                  <span className="block text-base sm:text-lg font-black text-amber-400">
                    +18.400
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Clientes Satisfeitos
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl text-center">
                  <span className="block text-base sm:text-lg font-black text-white">
                    Mesmo Dia
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Motoboy Goiânia
                  </span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-xl text-center">
                  <span className="block text-base sm:text-lg font-black text-amber-400">
                    4.9 / 5.0
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Nota no Google
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Imagem Editorial do Stitch */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
                <Image
                  src={HERO_IMAGE}
                  alt="Streetwear Masculino - Lobos G Outlet"
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Badge Flutuante no Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 backdrop-blur-md p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400">
                      Coleção Especial
                    </span>
                    <h3 className="text-sm font-extrabold text-white">
                      Drop Camisetas Heavyweight
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      A partir de <strong className="text-amber-400">R$ 99,90</strong> no Pix
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById("vitrine");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="p-2.5 bg-amber-400 text-black rounded-lg hover:bg-amber-300 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GRADE VISUAL DE CATEGORIAS (FOTOS REAIS STITCH) */}
      <section className="max-w-6xl mx-auto px-4 w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              Navegue por <span className="text-amber-400">Categorias</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Encontre o modelo ideal com caimento e corte perfeitos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORY_CARDS.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedCategory(cat.name);
                const el = document.getElementById("vitrine");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-amber-400 transition"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="block text-xs font-black text-white group-hover:text-amber-400 transition">
                  {cat.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {cat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SEÇÃO KITS PROMOCIONAIS & COMBOS (OUTLET DROPS) */}
      <section id="combos" className="max-w-6xl mx-auto px-4 w-full space-y-4">
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/20 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                Mais Vendidos Juntos
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                Kits Promocionais com <span className="text-amber-400">Maior Desconto</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Garanta o combo completo e economize até R$ 170 por pedido
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROMO_KITS.map((kit) => (
              <div
                key={kit.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 w-full bg-zinc-900">
                  <Image
                    src={kit.image}
                    alt={kit.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    {kit.discountBadge}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-emerald-500/90 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                    {kit.savingsText}
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {kit.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {kit.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-500 line-through block">
                        R$ {kit.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-lg font-black text-amber-400">
                        R$ {kit.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const mockItem = MOCK_PRODUCTS[0];
                        addToCart(mockItem, "M");
                      }}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Garantir Kit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VITRINE DE PRODUTOS INDIVIDUAIS */}
      <section id="vitrine" className="max-w-6xl mx-auto px-4 w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
              Vitrine de <span className="text-amber-400">Peças Exclusivas</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Fotos reais de estúdio e no corpo dos modelos
            </p>
          </div>

          {/* Abas de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-black shadow-md"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro Rápido por Tamanho */}
        <div className="flex items-center justify-between gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
          <span className="text-[11px] font-bold text-zinc-400 shrink-0">
            Filtrar pelo seu tamanho:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSizeFilter(size)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer border ${
                  selectedSizeFilter === size
                    ? "bg-zinc-200 text-black border-white"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantidade de Peças */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Exibindo <strong>{filteredProducts.length}</strong> peças disponíveis
          </span>
          {selectedSizeFilter !== "Todos" && (
            <span className="text-amber-400 font-medium">
              Filtrado por tamanho: {selectedSizeFilter}
            </span>
          )}
        </div>

        {/* Grade de Produtos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-zinc-400 space-y-2">
            <p className="font-bold text-white">Nenhuma peça encontrada com esses filtros</p>
            <p className="text-xs">Tente selecionar outro tamanho ou categoria.</p>
            <button
              onClick={() => {
                setSelectedCategory("Todas");
                setSelectedSizeFilter("Todos");
              }}
              className="mt-2 px-3 py-1.5 bg-zinc-800 text-white text-xs font-bold rounded-lg hover:bg-zinc-700 transition"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </section>

      {/* 5. DEPOIMENTOS DE CLIENTES (AVALIAÇÕES REAIS COM FOTOS) */}
      <section className="max-w-6xl mx-auto px-4 w-full space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Avaliações Verificadas
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
            Quem Compra na <span className="text-amber-400">Lobos G</span> Recomenda
          </h2>
          <p className="text-xs text-zinc-400">
            Veja a opinião de quem já recebeu seu look em Goiânia e região
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CUSTOMER_TESTIMONIALS.map((dep, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(dep.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;{dep.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-900">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  <Image src={dep.avatar} alt={dep.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{dep.name}</h4>
                  <span className="text-[10px] text-zinc-500">{dep.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LOJA FÍSICA & ATENDIMENTO REGIONAL */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Loja Física & Balcão de Retirada
            </span>
            <h3 className="text-xl font-black text-white">
              Prefere provar ou retirar na loja?
            </h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Visite nosso espaço no <strong>Jardim Novo Mundo (Goiânia - GO)</strong>. Você pode comprar online para garantir seu tamanho e retirar sem pagar taxa de entrega!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-red-400" />
                {PICKUP_STORE_INFO.address}
              </span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 justify-center md:justify-start">
                <Clock className="w-4 h-4 text-amber-400" />
                {PICKUP_STORE_INFO.openingHours}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20a%20localiza%C3%A7%C3%A3o%20exata%20da%20loja%20f%C3%ADsica%20no%20Jardim%20Novo%20Mundo.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chamar no WhatsApp
            </a>
            <a
              href={PICKUP_STORE_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition border border-zinc-700 flex items-center justify-center gap-2"
            >
              <InstagramIcon className="w-4 h-4 text-pink-500" />
              Instagram Oficial
            </a>
          </div>
        </div>
      </section>

      {/* 7. RODAPÉ */}
      <footer className="border-t border-zinc-800/80 pt-8 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-bold text-zinc-400">
          Lobos G Outlet • Moda Streetwear &amp; Grifes Importadas
        </p>
        <p>Goiânia - GO • Jardim Novo Mundo</p>
        <p className="text-[11px] text-zinc-600">
          © 2026 Lobos G Outlet. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
