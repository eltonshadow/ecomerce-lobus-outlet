"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { PICKUP_STORE_INFO } from "@/data/delivery-zones";

export default function Home() {
  const { totalItems, setIsCartOpen, addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState("Todos");

  const handleQuickAdd = (productIndex: number, size = "M") => {
    const product = MOCK_PRODUCTS[productIndex % MOCK_PRODUCTS.length];
    if (product) {
      addToCart(product, size);
    }
  };

  return (
<>
<header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.8),0_0_16px_-2px_rgba(212,175,55,0.08)]"><div className="bg-surface-container-lowest text-primary py-space-xs px-gutter-mobile lg:px-margin text-center font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center gap-space-sm"><span className="material-symbols-outlined text-primary text-[14px]">verified</span><span className="">FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 299 • ENVIAMOS PARA TODO O BRASIL • 100% ORIGINAL COM GARANTIA</span><span className="material-symbols-outlined text-primary text-[14px]">local_shipping</span></div><div className="h-24 max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin flex items-center justify-between gap-space-lg"><div className="flex items-center gap-space-md"><a className="flex items-center gap-space-sm group" data-path="home" href="#"><img alt="logo site.png" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UAQM25cO67L2IHLEsfykuMhxVcq8iComMAtFQwr_e_zhSA2hf8Zcbrx_PjbDP-eS7ejBRzkqcVCIjuGY5JtOOEJRSQRrZCLbPJi2I_3USfQyEKrX42P600c1_fU6MkfHmDE3TErb3lgtlm01wEVl-GaZoPiwJ5Fv_Sopr-0c10P6PNud-fy1JLAQVszjhn5czhHXoId4BjwbbL7APU0FX4FpgGoWfm8NSurDX2B9zERWDvur3sTQXkvOoVD2NZslV1go1dZKOhD8A" /><div className="flex flex-col"><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface group-hover:text-primary transition-colors uppercase">LOBUS</span><span className="font-label-sm text-label-sm tracking-widest text-primary uppercase -mt-1">OUTLET DE GRIFES</span></div></a></div><div className="flex-1 max-w-xl hidden md:block"><div className="relative flex items-center"><input className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-md py-space-sm pl-11 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" placeholder="Buscar marcas, modelos, camisetas, tênis..." type="text" /><span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px]">search</span></div></div><div className="flex items-center gap-space-md lg:gap-space-lg"><a className="hidden xl:flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="https://wa.me/5562999999999?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20LOBUS%20Outlet%20e%20gostaria%20de%20atendimento%20VIP." target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined text-primary text-[20px]">chat</span><span className="">WhatsApp VIP</span></a><a className="p-space-xs text-on-surface-variant hover:text-primary transition-colors relative flex items-center justify-center" data-path="favoritos" href="#"><span className="material-symbols-outlined text-[24px]">favorite</span></a><a className="p-space-xs text-on-surface-variant hover:text-primary transition-colors relative flex items-center justify-center" data-path="minha-conta" href="#"><span className="material-symbols-outlined text-[24px]">person</span></a><button onClick={() => setIsCartOpen(true)} className="p-space-xs text-on-surface-variant hover:text-primary transition-colors relative flex items-center justify-center cursor-pointer" aria-label="Sacola de Compras">
  <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
  <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems}</span>
</button><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(242,202,80,0.3)]"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div><div className="bg-surface-container-low"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin"><nav className="flex items-center justify-between overflow-x-auto py-space-xs gap-space-lg" data-active-classes="text-primary font-bold shadow-[inset_0_-2px_0_0_#d4af37]"><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="lancamentos" href="#">Lançamentos</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="camisetas-polos" href="#">Camisetas & Polos</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="bermudas-shorts" href="#">Bermudas & Shorts</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="calcas-jeans" href="#">Calças & Jeans</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="moletons-jaquetas" href="#">Moletons & Jaquetas</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="calcados-tenis" href="#">Calçados & Tênis</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="acessorios-bones" href="#">Acessórios & Bonés</a><a className="whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface py-2 transition-colors" data-path="outlet-promocoes" href="#">OUTLET / PROMOÇÕES</a></nav></div></div></header><main className="w-full pt-24 bg-background flex-1"><div className="flex flex-col w-full">
{/*  HERO SECTION  */}
<section className="relative w-full overflow-hidden bg-surface-container-lowest">
{/*  Subtle Golden Radial Ambience  */}
<div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
<div className="absolute -bottom-40 right-0 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[160px] pointer-events-none"></div>
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl lg:py-24">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
{/*  Left Content  */}
<div className="lg:col-span-7 flex flex-col gap-space-lg">
{/*  Badges ticker / highlights  */}
<div className="flex flex-wrap items-center gap-space-xs">
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-primary font-label-sm text-label-sm tracking-wider uppercase shadow-sm">
<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "\'FILL\' 1" }}>local_fire_department</span>
              Drop da Semana
            </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-on-surface font-label-sm text-label-sm tracking-wider uppercase shadow-sm">
<span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              Envio em 24h
            </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded text-on-surface font-label-sm text-label-sm tracking-wider uppercase shadow-sm">
<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "\'FILL\' 1" }}>verified_user</span>
              100% Autêntico
            </span>
</div>
{/*  Main Hero Typography  */}
<div className="flex flex-col gap-space-sm">
<h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface uppercase tracking-tight leading-none">
              O Melhor do <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-primary-container">Streetwear</span> & Grifes Importadas
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Camisetas fio 40.1 peruano, polos exclusivas, bermudas com elastano, moletons heavyweight e sneakers originais com até 50% OFF no outlet.
            </p>
</div>
{/*  CTAs  */}
<div className="flex flex-wrap items-center gap-space-md pt-space-xs">
<a className="inline-flex items-center justify-center gap-space-sm px-8 py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded shadow-md hover:brightness-110 transition-all" href="#vitrine">
<span className="">Ver Lançamentos do Drop</span>
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</a>
<a className="inline-flex items-center justify-center gap-space-sm px-7 py-3.5 bg-surface-container text-tertiary font-label-lg text-label-lg uppercase tracking-wider rounded shadow-sm hover:bg-surface-container-high transition-colors" href="#combos">
<span className="material-symbols-outlined text-[20px]">savings</span>
<span className="">Kits Promocionais</span>
</a>
</div>
{/*  Trust Proof Metrics  */}
<div className="pt-space-md grid grid-cols-3 gap-space-md max-w-lg">
<div className="flex flex-col bg-surface-container-low p-space-sm rounded">
<span className="font-headline-md text-headline-md text-primary font-bold">+18.400</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Clientes Satisfeitos</span>
</div>
<div className="flex flex-col bg-surface-container-low p-space-sm rounded">
<span className="font-headline-md text-headline-md text-on-surface font-bold">24 Horas</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Despacho Expresso</span>
</div>
<div className="flex flex-col bg-surface-container-low p-space-sm rounded">
<span className="font-headline-md text-headline-md text-primary font-bold">4.9 / 5.0</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nota no Google</span>
</div>
</div>
</div>
{/*  Right Hero Image Showcase  */}
<div className="lg:col-span-5 relative flex items-center justify-center">
<div className="relative w-full max-w-md aspect-[3/4] bg-surface-container rounded-lg overflow-hidden shadow-2xl">
<img className="w-full h-full object-cover" data-alt="High-end editorial fashion photography of a masculine streetwear model in an urban studio against a dark slate background, wearing an oversized heavyweight black t-shirt made of Peruvian cotton, layered with subtle luxury gold chain jewelry, minimal rim lighting, dramatic high-fashion masculine styling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZTomBBGoIEWyvG4K48gWd5UmTpjfJYmlaqL9dkvAmkb_pA1tY7llx5qOd4uhZwnkREEOV8ucYM1LN4siPI9Z9BJByx6tDli32CplosRaw5KdFuom4Djlgmn8pEYsMQZkwjvF65stjEne8zOt2khjWd9y1DvBHpCGFXxTjBPVem872CuFXnY8GCCDawYIlvxNMOIS6_4N8R1shoenGU6Wr8Lx514TlJTx_nNsCPUeO1ClQHVFsqXqo-g" />
<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
{/*  Floating VIP Tag  */}
<div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-2 rounded shadow-lg flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Estoque Limitado</span>
</div>
{/*  Bottom Floating Showcase Badge  */}
<div className="absolute bottom-4 left-4 right-4 bg-surface-container-high/90 backdrop-blur-md p-space-sm rounded shadow-xl flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Algodão Peruano Fio 40.1</span>
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">Coleção Blackout Edition</span>
</div>
<span className="font-headline-md text-headline-md text-primary font-bold">50% OFF</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/*  CATEGORY QUICK SELECTOR  */}
<section className="w-full bg-surface-container-low py-space-xl">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
<div className="flex items-end justify-between mb-space-lg">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Navegação Expressa</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-1">Categorias em Destaque</h2>
</div>
<a className="hidden sm:inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-tertiary transition-colors uppercase" href="#vitrine">
<span className="">Ver catálogo completo</span>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</a>
</div>
{/*  Categories 6-item Grid  */}
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
{/*  Cat 1  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="High resolution studio close up of a folded black premium Peruvian cotton t-shirt with heavyweight textured knit fabric, dark minimal studio styling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQx1CshLSON831ZjaJ00UteBqVTeIPmy_RPWPZGrCdpmBeNQwN4TEP04R7tMEaqPW6caK0Dnqk06objpJFXBkVuUH0rdsWh-6tz2WEMpDf9AIMngJWdoUXzHNxmOyAuPqJs6taVNu4vMQ8ojluzsmzSsDny9w9F1EJLYvGiQDE5L7VBxbOTimyoBM_wdn9-MSXj0KZnNl4q2eZB4Rifd2bHdC0l-nC-IDqI8qAL-8VfLUobPzRweD7dw" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Camisetas 40.1</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">42 Modelos</span>
</a>
{/*  Cat 2  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Close up photograph of a luxury navy blue piquet polo shirt with subtle gold embroidered logo on the chest, hung on a sleek dark metallic hanger" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTBerUmiMDYovMnLoUbDFpScdFQ7i-Q4QlxPP_WSgmvYZyR4sHuGKBuApw0fiH5g6HHac47q1vNq_lz_2Xm2ps8Scd0-NNiYd6xPhjCRNeeW5ZLQQrgsVSpxtWyX-O-4NcOi-hZKI7cDfun2hVqwiaktRyZzq_uARKQ4gWlmqlg-xphFaGs_H_XfAt17PhY4HZDNQZLo4vJpccU4Us9NVi93YfpvjkcIOluHm5_U48dqvoHlJk1-C4Qw" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Polos de Grife</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">28 Modelos</span>
</a>
{/*  Cat 3  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Men's premium distressed denim shorts laid flat on a dark slate surface, displaying intricate wash detailing, brass rivets, and luxury stretch fabric" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH8FycoVkIF8FFyV-aH2QxmVs4fxapNMiD-AXYDbsCUJrgdIsGg26xr81NUQ5PIJFXyrW-TS2wmEnR9daITuxQeDSLLwbLrN3vOkyCcTJJnc-uU--CB1lTAj4OczLJtTSuFM--7cOKU2nZgmu88R0scbwLMrWZ11uAJRe_U0O37CO4lWCVrLVQeRW6saePdD0o9ivR35kuibtEU3vMiM_EmdiVOb_Vr0pEuH9DJHQdS_8JXOdWJlrr5w" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Bermudas & Jeans</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">35 Modelos</span>
</a>
{/*  Cat 4  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Heavyweight oversized streetwear hoodie in washed acid charcoal tone, displayed on a ghost mannequin in a minimalist high-contrast studio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvkA1pl_j5EUtoAeNjRNwnirVhH2NoQPo2XMzRTvJUcuZ94_GFyJTWzBehdVpT9VMOa5WotB6NKa_KwBIEEvePqbUorH5gSYWDd_ykvrt_p5h3tzDXeg0bIBMlQtTutz3dKmuYy75NQ5IZpL7c5F6IsU1aK-kNcArsgXJYMHgD5U4bqN1TfzpN85UYqbMyqiVn24hg7H-zIG3MkX5P0sWgZBbYhaTfkzTUfInsUKf2R-n3d9xb9RzjDw" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Moletons & Jaquetas</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">19 Modelos</span>
</a>
{/*  Cat 5  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Modern streetwear low top sneaker in clean white and gold leather accents, floating against a moody matte black studio background with dramatic rim lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu31B1oTKebnpsVuvLjmEkjJixe5iDjggzQHxj49kb-9HTAPCO-HfguEWO5tWkuk9i7tO5nhGH0GpnLhdG5UjqZIyuCndnA6bPNgkv__zuxjuEETQBn-MeU_91_tOyrTXA1P_oiPLR8acgkQrLK67lnqnEZvwu6ECY_QgKZu-fvNBZjj1dGddeUDlI102qFlkcs2fmoicjrF7po0e8Ono06YC2aWT43e4cfbCnnKyRrbctoLKXGC4DpQ" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Sneakers Urbanos</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">16 Modelos</span>
</a>
{/*  Cat 6  */}
<a className="group flex flex-col items-center bg-surface-container p-space-md rounded-lg shadow-sm hover:shadow-lg hover:bg-surface-container-high transition-all text-center" href="#vitrine">
<div className="w-20 h-20 rounded-full overflow-hidden mb-space-sm bg-surface-container-lowest">
<img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Black luxury structured snapback cap with 3D gold embossed emblem on the front, styled next to a black leather designer sling bag on a textured background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDou5IjqRurMzUr_-cLdSLTAlXzhe0FSSMQXzUV_Ecx-zvrlF4Dn6vbZgqZgADyrWhiBVz2fwbAQ8k4WmfpJkStg-uURVnbClusvGESIMSeYDD3iCD6VfbyEkcT1cY-VO1Ic0VuqZzq4q7ouIZ2rZZWgz6KBoT0DnL_TVCRoJrR_2Nnc3VhcSmw_BdPi-Ls9KQ93l48LqB45wKQoIqlL9XQHJ_11OPnvQ3ZKRDGFssRE6JTnBExMBVOkg" />
</div>
<span className="font-headline-sm text-label-lg text-on-surface group-hover:text-primary transition-colors">Bonés & Acessórios</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">24 Modelos</span>
</a>
</div>
</div>
</section>
{/*  PROMOTIONAL COMBOS / KITS OUTLET  */}
<section className="w-full py-space-xl bg-surface-container-lowest" id="combos">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
<div>
<div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]">loyalty</span>
            Máxima Economia
          </div>
<h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-1">Kits Promocionais Imperdíveis</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Monte seu guarda-roupa premium pagando preço de atacado direto no varejo com frete rápido e parcelamento sem juros.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Combo 1  */}
<div className="relative flex flex-col bg-surface-container rounded-lg p-space-lg shadow-xl overflow-hidden hover:bg-surface-container-high transition-all">
<div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-label-sm px-4 py-1.5 uppercase font-bold rounded-bl">
            Economize R$ 140
          </div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider mb-space-xs">Combo Best-Seller</span>
<h3 className="font-headline-md text-headline-md text-on-surface uppercase font-bold">Kit 3 Camisetas Peruanas</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Algodão Fio 40.1 peruano legítimo, toque macio inigualável e caimento slim estruturado. Você escolhe as cores no pedido.
          </p>
<div className="w-full h-48 rounded bg-surface-container-low overflow-hidden mb-space-md">
<img className="w-full h-full object-cover" data-alt="Stack of three folded designer t-shirts in deep black, off-white, and charcoal gray with crisp hems and luxury neck tape detailing" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6BJeusqmfnZS40jltM4EMc4KB0drTaskJfZiyxEFceXnzPc5KGtcMOVSOkfbwiYO-2TQoiVLeaijj46JuUYaGSCpOcIFmu4Q-ODTER64Mq8B0cXSRTtz7c9eB-5UTyGbAy2HWk0EOb9wrx1AJHEH22smu9fYexLPmmmGK0tOvI_rSRO2FzaabyrCiOkUT0mDO67-yKa_g2TGqQlznmSa7mtfr0AuDJ8aVGXnE3YHzaBxQJtHX2NF8fQ" />
</div>
<div className="mt-auto flex flex-col gap-space-sm">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">De R$ 389,70</span>
<span className="font-headline-lg text-headline-lg text-primary font-bold">R$ 249,90</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">ou 6x de R$ 41,65 sem juros no cartão</span>
<button onClick={() => handleQuickAdd(0, "M")} className="w-full mt-2 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">shopping_cart</span>
<span className="">Garantir Combo Agora</span>
</button>
</div>
</div>
{/*  Combo 2  */}
<div className="relative flex flex-col bg-surface-container rounded-lg p-space-lg shadow-xl overflow-hidden hover:bg-surface-container-high transition-all">
<div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-sm text-label-sm px-4 py-1.5 uppercase font-bold rounded-bl">
            Top Escolha
          </div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider mb-space-xs">Combo Casual Street</span>
<h3 className="font-headline-md text-headline-md text-on-surface uppercase font-bold">Kit 2 Bermudas Jeans + 1 Boné</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            2 Bermudas com elastano (destroyed ou básica) + 1 boné snapback estruturado com bordado 3D de alta precisão.
          </p>
<div className="w-full h-48 rounded bg-surface-container-low overflow-hidden mb-space-md">
<img className="w-full h-full object-cover" data-alt="Men's casual streetwear bundle set: two stylish denim shorts paired with a black structured snapback cap laid out on a dark slate background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdkTrhWmm1KulJK84X24ZvH2YkBAgi1DgVPzBhb88QDWBNPHgOonQUrHbz89ZAuu1CIxibTFlFTlbsgL9LpMuUtQWqARz6thTDnusIfnlfh8pSZ2lEqCVg6vc3-ZGPWVZWhfTXoBeed0UKcJc-ZXhIlslwIeQJhC0sksFlmagFvYhsT7ENAMQirjDqcDRK0mWFRg6NzyVWCGSNZae9ZlOsMtK9MBFwywIhhvRVKSUeZ75pNSb0aLyq3Q" />
</div>
<div className="mt-auto flex flex-col gap-space-sm">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">De R$ 458,00</span>
<span className="font-headline-lg text-headline-lg text-primary font-bold">R$ 299,90</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">ou 6x de R$ 49,98 sem juros no cartão</span>
<button onClick={() => handleQuickAdd(1, "M")} className="w-full mt-2 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">shopping_cart</span>
<span className="">Garantir Combo Agora</span>
</button>
</div>
</div>
{/*  Combo 3  */}
<div className="relative flex flex-col bg-surface-container rounded-lg p-space-lg shadow-xl overflow-hidden hover:bg-surface-container-high transition-all">
<div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-label-sm px-4 py-1.5 uppercase font-bold rounded-bl">
            Alta Procura
          </div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider mb-space-xs">Combo All-Weather</span>
<h3 className="font-headline-md text-headline-md text-on-surface uppercase font-bold">Combo Canguru + Calça Jogger</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Moletom 3 cabos flanelado com capuz anatômico + calça jogger de sarja com bolsos reforçados para os dias mais frios.
          </p>
<div className="w-full h-48 rounded bg-surface-container-low overflow-hidden mb-space-md">
<img className="w-full h-full object-cover" data-alt="Matching urban outfit flatlay with a charcoal gray heavyweight hoodie sweatshirt and black tailored jogger pants with elasticated cuffs" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByCgrnd70OzV3VoO_folUiYlNSeXhLbqyzrvOM6OZgR3SwPZNFcrICW3WIsNq0OXF-gn_w2SciWOk3Dvz0tAjXbde68pHvBXq0Ksx-ebwB93fn_dH9VifhkIOOFDS8qEw8yc3XaQIhZ5BKqF6LvIIO46Z1DJD4FTKZvw_9Kk5vA9Pmi4bt61Sq5IUit0TEKyRLWspvgSOVthuDQelz3afPtsrm-3Wj2XsjgGUgmDBycxt5RFcnQHvRow" />
</div>
<div className="mt-auto flex flex-col gap-space-sm">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">De R$ 489,00</span>
<span className="font-headline-lg text-headline-lg text-primary font-bold">R$ 329,90</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">ou 6x de R$ 54,98 sem juros no cartão</span>
<button onClick={() => handleQuickAdd(2, "M")} className="w-full mt-2 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold shadow hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">shopping_cart</span>
<span className="">Garantir Combo Agora</span>
</button>
</div>
</div>
</div>
</div>
</section>
{/*  VITRINE DE PRODUTOS MAIS VENDIDOS / DESTAQUES DO DROP  */}
<section className="w-full py-space-xl bg-surface-container-low" id="vitrine">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
{/*  Vitrine Header with Filter Pills  */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-md">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Catálogo Selecionado</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-1">Destaques do Drop Oficial</h2>
</div>
{/*  Filter Tabs / Pills  */}
<div className="flex flex-wrap gap-space-xs" id="filter-tabs">
<button className="px-3.5 py-1.5 bg-primary text-on-primary rounded font-label-sm text-label-sm uppercase font-bold shadow">Todos</button>
<button className="px-3.5 py-1.5 bg-surface-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm uppercase font-medium transition-colors">Camisetas</button>
<button className="px-3.5 py-1.5 bg-surface-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm uppercase font-medium transition-colors">Bermudas</button>
<button className="px-3.5 py-1.5 bg-surface-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm uppercase font-medium transition-colors">Polos</button>
<button className="px-3.5 py-1.5 bg-surface-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm uppercase font-medium transition-colors">Moletons & Jaquetas</button>
<button className="px-3.5 py-1.5 bg-surface-container text-on-surface hover:text-primary rounded font-label-sm text-label-sm uppercase font-medium transition-colors">Sneakers</button>
</div>
</div>
{/*  8-Card Product Grid  */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/*  PRODUCT 1  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Male model wearing an acid-wash estonada black heavyweight streetwear t-shirt with ribbed crew neck in an urban setting, clean modern lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGzbFeugtPvccukRy91sOUm0T6aNDWi-GbNw7-V_dI3F2qNJDNFViYAa-zF_RBGq3alM0MdYxg63jWD2495_dCFsjhpK-_NwjlPCuF9ZslLUsy_VyGoC223S_Tr2OwP8l74QWh2sH0J78YchS0b0hTZgHVAelEdqHkW0J7eVtYwV-JDruC-HH2xsZcNvu0lkfK6k4WXubHTvAP8UQlisLfYqY_hpr7uj1X0eRqwg-jzLId0uK8L9eag" />
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">-40% OFF</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Camiseta Fio 40.1</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.9</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Camiseta Estonada Heavyweight Black</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">P</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">M</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">G</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">GG</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 149,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 89,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 2x de R$ 44,95 sem juros</span>
<button onClick={() => handleQuickAdd(0, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 2  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Elegant navy blue luxury custom-fit polo shirt on a slim masculine model, clean collar with subtle tipping, premium piquet texture, dark luxury showroom background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-bThnYk2FpKU0Zd35PJbOjGu-qFotmFBXimOS3ve-JFstj5gmCT_SFE7KG_jBkDL_8l8BiJ7GOOiTUxtfJiaEAgDnGsum4ZsU6fyILS197BZhp4AzoXigwKbUyvAiLhPHjudsitILYBIWMx_pMNOrT_PaTb2RkTk87nSFnjsAt91PUvheMgaqe2-tmh5sBXAXgUTJlSTkhu2jcHgweLqc9CJWXxYl1QgXiz0CG1jiwBWVIGXKulj1dw" />
<span className="absolute top-3 left-3 bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">Mais Vendido</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Polo Piquet</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">5.0</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Camisa Polo Custom Fit Navy Blue</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">P</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">M</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">G</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">GG</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 199,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 119,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 3x de R$ 39,96 sem juros</span>
<button onClick={() => handleQuickAdd(1, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 3  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Light wash distressed denim shorts with elastane, worn by a male streetwear model with white sneakers, focused view of detailed rips and stretch fabric" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlWmeh1kGwJgd4hwgHhu1Z_VEecmAiDoK2OYDq0qqviKkGwn4NJlSRgqbda2Fqd9xuFjWpysPxvbj6XYxRcWpgFhdP2e6lF89xeFkmRrxrU3f4cLOtAMA6zLeZwKyGGVMt27ypKy2AauhFjsZVvTT_r1Bjko2Lk3Zzk--NFE5EzbLt75jqsmhdw2yzF27JxXwOnBziV9krCNL8nwtGEPk2DoUOwl4LC0ib6hsg7SMu7DwP57c3NO8UPQ" />
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">-39% OFF</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Jeans c/ Elastano</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.8</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Bermuda Jeans Destroyed Slim Confort</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">38</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">40</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">42</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">44</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 229,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 139,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 3x de R$ 46,63 sem juros</span>
<button onClick={() => handleQuickAdd(2, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 4  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Model posing in a charcoal oversized streetwear hoodie with acid wash texture and front kangaroo pocket, moody high contrast fashion photography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxAd4dDNSw0aDQOFFW6WSWAzBPT1S5zMtZnUXDLtk3f1CPcHjIoHr2CjWot_QhbSZVC_5PPM6qkwPwempaON8pp1SS44DsXBy4QxHPOKHCZFLBL3rowFc2I0Ha0t_m6RgfoKGlsP2tLOnkD5iAvlDE9rJ91YGf8zCZ9jjh0z_YvQ6LtJ2q9XJBC7YuXBIaRYA8B_Gech5kVJBgv7IH9UqEs_q3meVcgtn4dCxeWnFN9LjbpMok9K--5w" />
<span className="absolute top-3 left-3 bg-surface-container-high text-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">Lançamento</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Moletom Heavy</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.9</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Moletom Canguru Oversized Acid Wash</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">P</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">M</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">G</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">GG</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 289,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 189,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 4x de R$ 47,47 sem juros</span>
<button onClick={() => handleQuickAdd(3, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 5  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Commercial product photography of a premium white leather sneaker with metallic gold heel tab and stitching, displayed at a dynamic 45-degree angle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCprVJwPtqX4RHBt2chyIeVAGZeBV-7NXlI2zXhTstwFk15pGrJckA3mQWRnX_O8MhYXUAHi_LWd2tLuOxRR9ezBVJSG8V7HC4LoVL7RAfge6RTA4KLjNKMURsIp4IhJ0GUSLhfNQIw6fLQGh3z50QOpQ-El3WLdcGpLqu_6pQc-Wp3qbyVPdSZ5I9A4vHrbzSk6bSq60H6WzKYwYvlUsjjYbqdtElCQMvaKFyJ6R6dXgIdbVRtFOREuw" />
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">-35% OFF</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Couro Genuíno</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">5.0</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Tênis Casual Couro Street White & Gold</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">39</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">40</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">41</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">42</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 399,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 259,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 6x de R$ 43,31 sem juros</span>
<button onClick={() => handleQuickAdd(4, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 6  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Charcoal gray cargo utility shorts with side flap pockets and military style stitching, modeled with black boots in an industrial loft set" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC6l4kfDAW6lqwjT_Bxwz2rFJ1lYP2AZcGncovfGy2DKEWDRwYnR58HTwnRXA0E_vJyvL1uTb-q6IaFTrisLPwm1QC7V2f4LrWwQOX_MZfK_oLKSSRuXinxDZUI4biMW_b-y87EXtqvptCEDOHVqHr9hP0tR042R-BpNJXBK8twkmvRpcOWUp5yVHf6L1oL6D_Py10TNdvqFOwAb4ve-ulGqOxt76sQZmBzU6LGH0lp40Y2QvxYgCIEA" />
<span className="absolute top-3 left-3 bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">Últimas Peças</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Sarja Premium</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.8</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Bermuda Sarja Cargo Utilitária Chumbo</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">38</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">40</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">42</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">44</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 199,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 129,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 3x de R$ 43,30 sem juros</span>
<button onClick={() => handleQuickAdd(5, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 7  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Technical black windbreaker jacket with water repellent fabric and subtle gold zipper pullers, worn in a moody rainy urban street scene with reflections" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuLgSwYaTI37EXqm2IMpl9BezfPKXQOeryVqVSffUbh7ektb9WLt9Dj8aVA2122xG-TDj6eZPNUIEjtoYTmARrx7oS3jYCVL1IY4t5cfWPPQpYHhIB_dbVUepGRyLmxJD1A5StliPOC0prUjzPILKRHsBr0Xw15tzV_lUq2d5h_igkRyL6H9DeuErNhGuLlSyQe-dUKxT78TjvHyIwAq2SQPkgzrF0yPoM9sDZHDbFripCB7y9szt3Ig" />
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">Destaque</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Corta-Vento Tech</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.9</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Jaqueta Windbreaker Impermeável</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">P</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-primary text-on-primary font-bold">M</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">G</button>
<button className="w-7 h-7 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-colors">GG</button>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 269,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 179,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 3x de R$ 59,96 sem juros</span>
<button onClick={() => handleQuickAdd(6, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
{/*  PRODUCT 8  */}
<div className="group flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:bg-surface-container-high transition-all">
<div className="relative w-full aspect-[3/4] bg-surface-container-lowest overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="High detail front shot of a curved brim black snapback cap featuring metallic 3D gold embroidery, positioned on an acrylic pedestal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcLOrJ3MZUXnyTSFjWEddVrCQZ5owLxX_ZTshQ4sdTdDGP56mG9apTpKuX188r8Ivcg4RAgbCXUAuqnvqHCUXv9YDXfp34JS-v7bhKsUSv2qTk7KlrrBJ67D3PPFbGAWABybFeeyY_W7-40R2sxWdxNh7nEWmi3uqAaXrxKLq0P1y0QtTvTviWHJH3dHQUE7CM37B-up7l0CceBjYo9QdCulzf03vMmmSGHk4nJWsLzGcxnau2B-jOMg" />
<span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1 rounded font-bold uppercase">-38% OFF</span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur text-primary p-1.5 rounded-full shadow">
<span className="material-symbols-outlined text-[18px]">favorite_border</span>
</span>
</div>
<div className="p-space-md flex flex-col flex-1">
<div className="flex items-center justify-between mb-1">
<span className="font-label-sm text-label-sm text-primary uppercase">Acessórios</span>
<div className="flex items-center text-primary text-[14px]">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm ml-1 text-on-surface">4.7</span>
</div>
</div>
<h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 mb-2">Boné Aba Curva Bordado 3D Lobus</h4>
{/*  Size Selector Pills  */}
<div className="flex items-center gap-1.5 mb-3">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tam:</span>
<span className="px-2 py-0.5 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface">Ajustável (Único)</span>
</div>
<div className="mt-auto pt-2">
<div className="flex items-baseline gap-2">
<span className="font-body-sm text-body-sm text-outline line-through">R$ 129,00</span>
<span className="font-headline-md text-headline-md text-primary font-bold">R$ 79,90</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant block mb-3">ou 2x de R$ 39,95 sem juros</span>
<button onClick={() => handleQuickAdd(7, "M")} className="w-full py-2.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface rounded font-label-sm text-label-sm uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
<span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
<span className="">Adicionar</span>
</button>
</div>
</div>
</div>
</div>
{/*  Pagination / Load More button  */}
<div className="mt-space-xl flex justify-center">
<button className="inline-flex items-center gap-space-sm px-8 py-3.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg uppercase tracking-wider rounded transition-colors shadow">
<span className="">Carregar Mais 24 Produtos do Outlet</span>
<span className="material-symbols-outlined text-[20px]">expand_more</span>
</button>
</div>
</div>
</section>
{/*  ATENDIMENTO VIP WHATSAPP BANNER  */}
<section className="w-full py-space-xl bg-surface-container-lowest">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
<div className="relative bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high rounded-xl p-space-lg lg:p-space-xl overflow-hidden shadow-2xl">
{/*  Ambient accents  */}
<div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
<div className="lg:col-span-8 flex flex-col gap-space-sm">
<div className="inline-flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-widest">
<span className="material-symbols-outlined text-[18px]">verified</span>
              Personal Shopper Dedicado
            </div>
<h3 className="font-headline-lg text-headline-lg text-on-surface uppercase">
              Dúvidas no Tamanho ou Quer Ver Vídeo no Corpo?
            </h3>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Nossa equipe de consultores tira todas as suas dúvidas em tempo real no WhatsApp. Enviamos medidas na fita métrica, fotos reais sem filtro e sugestão de combinações perfeitas.
            </p>
<div className="flex flex-wrap items-center gap-space-md pt-space-xs text-on-surface font-label-md text-label-md">
<span className="flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-[18px]">videocam</span> Vídeos Reais das Peças
              </span>
<span className="flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-[18px]">straighten</span> Medição Exata no Corpo
              </span>
<span className="flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-[18px]">schedule</span> Resposta em Menos de 5 Minutos
              </span>
</div>
</div>
<div className="lg:col-span-4 flex flex-col items-start lg:items-end">
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold shadow-lg hover:brightness-110 transition-all" href="https://wa.me/" rel="noopener noreferrer" target="_blank">
<span className="material-symbols-outlined text-[24px]">chat</span>
<span className="">Chamar no WhatsApp VIP</span>
</a>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-center w-full lg:text-right">
              Atendimento Seg a Sáb das 09h às 20h
            </span>
</div>
</div>
</div>
</div>
</section>
{/*  DEPOIMENTOS DE CLIENTES / FEEDBACK REAL  */}
<section className="w-full py-space-xl bg-surface-container-low">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Avaliações Verificadas</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-1">Quem Compra na Lobus Recomenda</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Mais de 18.000 pedidos entregues pontualmente em todo o território nacional. Confira a opinião de quem já veste nossa curadoria.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Review 1  */}
<div className="bg-surface-container p-space-lg rounded-lg shadow-sm flex flex-col">
<div className="flex items-center gap-space-md mb-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="Portrait photo of a stylish Brazilian man in his late twenties wearing a clean black t-shirt and sunglasses outdoors, friendly smile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoxhEjKvo_NK7RqTRD0foDpTnV_tPWUjcLLxjwkfGzqjI11jeJJr0jXhzS1lScWlkvDTeNQTgL8UgivobkDRKLRgFt95EI89Ppo_OI0WoB-c7OwpYtpi_4kMgWrrPTZmnocN-Xsfis04MtY6m3ZYozIy7HcBmvn1QvG4AtmZdc-emqQk8OFhiORmSbsNaPrptv7qN031jSKF-TkHbRVNZgzcq_Kne0WHFSY4cHeWg8yNrgBFSugPmxcQ" />
</div>
<div>
<h5 className="font-headline-sm text-headline-sm text-on-surface">Rafael Mendes</h5>
<div className="flex items-center gap-1 text-primary text-[14px]">
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm text-on-surface-variant ml-1">São Paulo, SP</span>
</div>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md flex-1">
            "Chegou em 2 dias aqui na capital! O tecido da camiseta peruana é absurdo de macio, gola fechadinha não esgarça na lavagem. Já montei o combo de bermudas para a próxima remessa."
          </p>
<div className="pt-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]">verified</span> Compra Confirmada
            </span>
<span className="">Kit 3 Camisetas Peruanas</span>
</div>
</div>
{/*  Review 2  */}
<div className="bg-surface-container p-space-lg rounded-lg shadow-sm flex flex-col">
<div className="flex items-center gap-space-md mb-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="Close up avatar portrait of an athletic young professional man smiling casually against modern urban architecture, stylish haircut" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXKYQmTlYOrApBPMcYglsX_hqPciQflpn-8wwzjrIF0dDUWbYjOh76Pc4G3D1cBZmW2PMWwhmsL0rLuMdR3VGbOEnk501Nll0y-MnFZTBGict41mT5GYnlw9dk3ikAd1aQkpxHteok41dlU-FO6DdkFshr7fO_9F6XyECuH-WBxofc58pMzziKhHPdUFyifwo0CdTPGwZmJJHg5qlT-UVfj-nlohXqsNjIrvMRWyTKRUgMRNjGhgLPiA" />
</div>
<div>
<h5 className="font-headline-sm text-headline-sm text-on-surface">Lucas Siqueira</h5>
<div className="flex items-center gap-1 text-primary text-[14px]">
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm text-on-surface-variant ml-1">Belo Horizonte, MG</span>
</div>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md flex-1">
            "A bermuda jeans vestiu perfeitamente por causa do elastano. É a terceira compra que faço na Lobus Outlet. Qualidade padrão shopping de luxo pagando menos da metade."
          </p>
<div className="pt-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]">verified</span> Compra Confirmada
            </span>
<span className="">Bermuda Jeans Destroyed</span>
</div>
</div>
{/*  Review 3  */}
<div className="bg-surface-container p-space-lg rounded-lg shadow-sm flex flex-col">
<div className="flex items-center gap-space-md mb-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="Portrait of a modern Brazilian man in casual street attire, smiling confidently with city lights blurred in the background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkkhLIFUR2KRhUIbDvEhCjMewnZ6VUjlfOaHmA0odTPUaiIj-Dwilt67EGdafnpFiwiwkjC10a9lftAOZzp8rjzMYJ0zMezkLS6uiBsLSnaoZ0yT-WHEgvEMNDPTyBxtml3dWmIKkZ5lNwh5LjNaXeoNfKJ6lkgBaYsUqMkS_aQi7QYqEk3Dnt0WJ7Cdoj0O5HNllo_cyHZrvPw9Z-BqCCKmpjNrhMUzJhgsoktXbD3XG8n7DHBcr1Pw" />
</div>
<div>
<h5 className="font-headline-sm text-headline-sm text-on-surface">Guilherme Pires</h5>
<div className="flex items-center gap-1 text-primary text-[14px]">
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="font-label-sm text-label-sm text-on-surface-variant ml-1">Curitiba, PR</span>
</div>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant italic mb-space-md flex-1">
            "Podem comprar sem medo! O moletom e os tênis são sensacionais, caimento impecável. O atendimento pelo WhatsApp tirando dúvidas de tamanho foi nota 10/10."
          </p>
<div className="pt-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]">verified</span> Compra Confirmada
            </span>
<span className="">Combo Moletom + Calça Jogger</span>
</div>
</div>
</div>
</div>
</section>
{/*  NEWSLETTER COM CUPOM DE BOAS-VINDAS  */}
<section className="w-full py-space-xl bg-surface-container-lowest">
<div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin">
<div className="bg-surface-container p-space-lg lg:p-space-xl rounded-xl shadow-lg relative overflow-hidden">
<div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[36px]">mark_email_read</span>
<h3 className="font-display-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface uppercase">
            Cadastre-se e Ganhe <span className="text-primary">R$ 30 OFF</span> na Primeira Compra
          </h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-space-md">
            Receba em primeira mão os avisos de novos drops, reposições de numeração esgotada e cupons secretos exclusivos para membros VIP.
          </p>
<form className="w-full max-w-md flex flex-col sm:flex-row gap-space-xs" >
<input className="flex-1 bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-md py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" placeholder="Digite seu melhor e-mail aqui..." required type="email" />
<button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-label-lg uppercase tracking-wider rounded font-bold hover:brightness-110 transition-all whitespace-nowrap shadow" type="submit">
              Resgatar Cupom
            </button>
</form>
<span className="font-label-sm text-label-sm text-on-surface-variant mt-2">
            Válido para compras acima de R$ 199. Sem spam, apenas ofertas reais.
          </span>
</div>
</div>
</div>
</section>
</div>
</main><footer className="w-full bg-surface-container-lowest mt-space-xl shadow-[0_-12px_32px_-4px_rgba(0,0,0,0.8)]"><div className="bg-surface-container-low py-space-lg"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg"><div className="flex items-center gap-space-md"><div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[28px]">verified</span></div><div><div className="font-label-lg text-label-lg text-on-surface uppercase">100% Autêntico</div><div className="font-body-sm text-body-sm text-on-surface-variant">Certificação de grife original</div></div></div><div className="flex items-center gap-space-md"><div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[28px]">local_shipping</span></div><div><div className="font-label-lg text-label-lg text-on-surface uppercase">Envio Expresso</div><div className="font-body-sm text-body-sm text-on-surface-variant">Sedex, PAC e Jadlog em todo BR</div></div></div><div className="flex items-center gap-space-md"><div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[28px]">payments</span></div><div><div className="font-label-lg text-label-lg text-on-surface uppercase">Pix com 5% OFF</div><div className="font-body-sm text-body-sm text-on-surface-variant">Ou em até 12x no cartão</div></div></div><div className="flex items-center gap-space-md"><div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[28px]">support_agent</span></div><div><div className="font-label-lg text-label-lg text-on-surface uppercase">Suporte VIP Direto</div><div className="font-body-sm text-body-sm text-on-surface-variant">Segunda a Sábado 09h às 20h</div></div></div></div></div><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin py-space-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl"><div className="flex flex-col gap-space-md"><div className="flex items-center gap-space-sm"><img alt="logo site.png" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UAQM25cO67L2IHLEsfykuMhxVcq8iComMAtFQwr_e_zhSA2hf8Zcbrx_PjbDP-eS7ejBRzkqcVCIjuGY5JtOOEJRSQRrZCLbPJi2I_3USfQyEKrX42P600c1_fU6MkfHmDE3TErb3lgtlm01wEVl-GaZoPiwJ5Fv_Sopr-0c10P6PNud-fy1JLAQVszjhn5czhHXoId4BjwbbL7APU0FX4FpgGoWfm8NSurDX2B9zERWDvur3sTQXkvOoVD2NZslV1go1dZKOhD8A" /><span className="font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase">LOBUS OUTLET</span></div><p className="font-body-sm text-body-sm text-on-surface-variant">Curadoria especializada em streetwear de alto padrão, alfaiataria contemporânea e marcas importadas com garantia de autenticidade.</p><div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant"><span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">schedule</span> Seg - Sex: 09h às 19h | Sáb: 09h às 14h</span><span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">mail</span> atendimento@lobusoutlet.com.br</span></div></div><div className="flex flex-col gap-space-md"><span className="font-label-lg text-label-lg text-primary uppercase">Departamentos</span><div className="flex flex-col gap-space-xs"><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="camisetas-polos" href="#">Camisetas de Grife & Polos</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="bermudas-shorts" href="#">Bermudas Chino & Street</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="calcados-tenis" href="#">Sneakers & Calçados Importados</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="moletons-jaquetas" href="#">Moletons Premium & Jaquetas</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="acessorios-bones" href="#">Bonés & Acessórios Streetwear</a><a className="font-body-sm text-body-sm text-primary hover:text-tertiary transition-colors" data-path="outlet-promocoes" href="#">Ofertas Especiais de Outlet</a></div></div><div className="flex flex-col gap-space-md"><span className="font-label-lg text-label-lg text-primary uppercase">Ajuda & Segurança</span><div className="flex flex-col gap-space-xs"><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="politica-de-trocas" href="#">Política de Trocas e Devoluções</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="autenticidade-garantida" href="#">Certificado de Autenticidade</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="rastreamento" href="#">Rastrear Pedido</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="guia-de-medidas" href="#">Tabela e Guia de Medidas</a><a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" data-path="perguntas-frequentes" href="#">Perguntas Frequentes (FAQ)</a></div></div><div className="flex flex-col gap-space-md"><span className="font-label-lg text-label-lg text-primary uppercase">Formas de Pagamento & Envio</span><div className="flex flex-col gap-space-sm"><div className="flex flex-wrap gap-space-xs"><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">PIX 5% OFF</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Visa</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Mastercard</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Hipercard</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Elo</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Boleto</span></div><span className="font-label-md text-label-md text-on-surface-variant mt-2">Logística Segura</span><div className="flex flex-wrap gap-space-xs"><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Correios Sedex</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Correios PAC</span><span className="px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded">Jadlog Express</span></div></div></div></div><div className="bg-surface-container-lowest py-space-md"><div className="max-w-[1440px] mx-auto px-gutter-mobile lg:px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-label-sm text-label-sm"><span className="">© 2025 LOBUS OUTLET. Todos os direitos reservados. CNPJ:&nbsp;</span><span className="">Moda Masculina Casual & Grifes Importadas Exclusivas</span></div></div></footer>


</>
  );
}
