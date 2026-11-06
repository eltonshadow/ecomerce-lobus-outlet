"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";
import { getStoreProducts } from "@/actions/store";
import type { Product } from "@/types/store";
import { ProductTag } from "@/components/ProductTag";
import { ui } from "@/design/ui";
import { useMe } from "@/hooks/useMe";

const HERO_IMAGE = "/hero.jpg";

const FILTERS: [slug: string, label: string][] = [
  ["todos", "Todos"],
  ["mantos-de-jogo", "Mantos de Jogo"],
  ["treino-torcida", "Treino & Torcida"],
  ["agasalhos-calcoes", "Agasalhos & Calções"],
  ["acessorios", "Acessórios"],
];

const NAV: [slug: string, label: string][] = [
  ["mantos-de-jogo", "Mantos de Jogo"],
  ["treino-torcida", "Linha Torcida"],
  ["agasalhos-calcoes", "Agasalhos"],
  ["acessorios", "Acessórios"],
];

const BAND = "TROPA DA MAUÁ • O ENXAME DA QUEBRADA • TRADIÇÃO & RAÇA NA VÁRZEA • MANTO SAGRADO • RESPEITA O FERRÃO • ";

export default function Home() {
  const { totalItems, setIsCartOpen, setActiveProductModal } = useCart();
  const me = useMe();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [query, setQuery] = useState("");
  // null = carregando. Busca no cliente via server action: a página não toca o banco no build.
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getStoreProducts().then((r) => {
      setProducts(r.data);
      setLoadError(!r.success);
    });
  }, []);

  const q = query.trim().toLowerCase();
  const visible = (products ?? []).filter(
    (p) => (activeFilter === "todos" || p.categorySlug === activeFilter) && (!q || `${p.name} ${p.category}`.toLowerCase().includes(q)),
  );
  const coverOf = (slug: string) => (products ?? []).find((p) => p.categorySlug === slug)?.images[0];

  const pickCategory = (slug: string) => {
    setActiveFilter(slug);
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
  };

  const goCategory = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setQuery("");
    pickCategory(slug);
  };

  const whatsApp = (text: string) => `https://wa.me/${PICKUP_STORE_INFO.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <>
      <div className="border-b border-line py-2.5 px-4 text-center font-body text-label-sm uppercase text-muted">
        Frete grátis acima de R$ 249 · Retirada na {PICKUP_STORE_INFO.neighborhood} em dias de jogo e entrega expressa
      </div>

      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-line">
        <div className={`${ui.container} py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3`}>
          <Link href="/" aria-label="Tropa da Mauá, início" className="shrink-0 flex items-center gap-3">
            <img src="/logo.png" alt="Tropa da Mauá Oficial" className="h-14 lg:h-16 w-auto" />
            <div className="hidden sm:block">
              <span className="block font-display text-2xl tracking-wider uppercase text-paper leading-none">TROPA DA MAUÁ</span>
              <span className="block font-mono text-[10px] uppercase text-gold tracking-widest mt-0.5">LOJA DO ENXAME</span>
            </div>
          </Link>
          <nav aria-label="Categorias" className="flex flex-wrap gap-x-6 gap-y-2 order-3 w-full lg:order-none lg:w-auto">
            {NAV.map(([slug, label]) => (
              <a key={slug} href="#vitrine" onClick={goCategory(slug)} className={ui.navLink}>
                {label}
              </a>
            ))}
            <a href="#vitrine" onClick={goCategory("todos")} className={`${ui.navLink} text-gold`}>
              Todos
            </a>
          </nav>
          <div className="flex items-center gap-5">
            <label className="relative hidden md:block">
              <span className="sr-only">Buscar produtos</span>
              <input
                id="busca"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") pickCategory(activeFilter);
                }}
                placeholder="Buscar"
                className="w-44 bg-transparent border-b border-line focus:border-gold py-1.5 font-body text-label-md uppercase placeholder:text-muted focus:outline-none"
              />
            </label>
            <Link href={me ? "/conta" : "/conta/entrar"} className={`${ui.navLink} ${me === undefined ? "opacity-0" : ""}`}>
              {me ? "Minha conta" : "Entrar"}
            </Link>
            <button type="button" onClick={() => setIsCartOpen(true)} className={ui.navLink}>
              Sacola (<span className="tabular-nums">{totalItems}</span>)
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className={`${ui.container} pt-6 flex flex-wrap gap-10`}>
          <div className="flex-[1_1_480px] min-w-0 flex flex-col justify-between gap-9 py-6">
            <p className={ui.eyebrow}>Coleção Oficial 2026/27 · Tropa da Mauá</p>
            <h1 className={ui.heroTitle}>
              Manto
              <br />
              Sagrado.
              <br />
              <span className="text-gold">A Força</span>
              <br />
              do Enxame.
            </h1>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-[360px] text-body-lg text-[#CFC9BC]">
                O manto mais temido da várzea. Peça seu uniforme oficial ou peças de torcida e retire no campo ou receba por motoboy.
              </p>
              <a href="#vitrine" onClick={goCategory("todos")} className={`${ui.btnPrimary} min-h-[56px]`}>
                Ver os Mantos
              </a>
            </div>
          </div>
          <div className="flex-[1_1_480px] min-w-0 h-[clamp(420px,60vw,760px)] overflow-hidden">
            <img src={HERO_IMAGE} alt="Manto Oficial Tropa da Mauá - O Enxame" className="w-full h-full object-cover object-[50%_25%]" />
          </div>
        </section>

        <div aria-hidden="true" className="mt-[72px] border-y border-line py-[18px] overflow-hidden whitespace-nowrap font-display text-[clamp(36px,5vw,56px)] leading-none uppercase text-ghost">
          <span className="inline-block animate-[maua-band_40s_linear_infinite] motion-reduce:animate-none">{BAND.repeat(8)}</span>
        </div>

        <section id="vitrine" className={`${ui.container} pt-20 scroll-mt-28`}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 className={ui.sectionTitle}>Mantos & Acessórios</h2>
            <label className="md:hidden w-full">
              <span className="sr-only">Buscar produtos</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar manto ou acessório" className={ui.input} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mb-9" role="group" aria-label="Filtrar por categoria">
            {FILTERS.map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                onClick={() => setActiveFilter(slug)}
                aria-pressed={activeFilter === slug}
                className={`${ui.pill} ${activeFilter === slug ? ui.pillOn : ui.pillOff}`}
              >
                {label}
              </button>
            ))}
          </div>

          {products === null ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-6" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-[480px] bg-tag/10 animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-16 text-center text-muted">
              {loadError
                ? "Não foi possível carregar o catálogo agora. Recarregue a página."
                : q
                  ? `Nenhum item encontrado para "${query.trim()}".`
                  : "Nenhum item disponível nesta categoria no momento."}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-6">
              {visible.map((p) => (
                <ProductTag key={p.id} product={p} onOpen={setActiveProductModal} />
              ))}
            </div>
          )}
        </section>

        <section className={`${ui.container} pt-24 flex flex-wrap gap-6`}>
          {(
            [
              ["mantos-de-jogo", "Mantos Oficiais"],
              ["acessorios", "Acessórios da Torcida"],
            ] as const
          ).map(([slug, label]) => (
            <a key={slug} href="#vitrine" onClick={goCategory(slug)} className="group relative flex-[1_1_380px] min-w-0 h-[420px] overflow-hidden bg-surface-container">
              {coverOf(slug) && (
                <img src={coverOf(slug)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
              )}
              <span className="absolute left-0 bottom-0 px-6 py-5 bg-ink font-display text-[clamp(32px,4vw,48px)] leading-none uppercase">{label}</span>
            </a>
          ))}
        </section>
      </main>

      <footer className={`${ui.container} pt-24 pb-12`}>
        <div aria-hidden="true" className="font-display text-[clamp(70px,14vw,220px)] leading-[0.8] uppercase text-transparent [-webkit-text-stroke:1px_#3E3A2A]">
          Tropa da Mauá
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-4 font-body text-body-sm tracking-[0.06em] text-muted">
          <span>{PICKUP_STORE_INFO.name} · {PICKUP_STORE_INFO.address}</span>
          <span>Entrega por motoboy e envio expresso · Pagamento instantâneo via Pix</span>
          <span className="flex flex-wrap gap-5">
            <Link href="/pedido" className="hover:text-gold">
              Meu pedido
            </Link>
            <a href={whatsApp("Olá! Quero saber sobre trocas e pedidos da Tropa da Mauá.")} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              Trocas
            </a>
            <a href={whatsApp("Olá! Vim pela Loja Oficial da Tropa da Mauá e quero atendimento.")} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              WhatsApp
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
