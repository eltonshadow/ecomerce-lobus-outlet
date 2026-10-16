# Design system LOBUS Outlet

Direção aprovada pelo cliente em 2026-10-16: home editorial com tipografia gigante (opção A) e produtos como etiqueta de estoque (cards da opção C). Referência viva: `src/app/page.tsx`.

Fontes da verdade no código:

| O quê | Arquivo |
|---|---|
| Cores, fontes, escala tipográfica, raios, espaçamentos | `src/design/tokens.ts` |
| Receitas de classe (botão, título, input, pill...) | `src/design/ui.ts` |
| Card de produto | `src/components/ProductTag.tsx` |
| Header das telas internas (conta, pedido) | `src/components/SiteHeader.tsx` |

O layout raiz (`src/app/layout.tsx`) converte `tokens.ts` na config do Tailwind. Não declare cor, fonte ou tamanho fora desses arquivos.

## Princípios

1. **Fundo escuro, uma cor de acento.** O dourado (`gold`) aparece só em CTA, item ativo, palavra de destaque no título e preço com desconto. Se tudo é dourado, nada é.
2. **Tipografia faz o trabalho.** Títulos em Anton, caixa alta, grandes, com entrelinha apertada. Sem ícone decorativo, sem gradiente, sem sombra.
3. **Cantos retos.** Raio padrão 0. Só elementos circulares (o furo da etiqueta, avatar) usam `rounded-full`.
4. **Produto é etiqueta.** Todo produto listado usa `ProductTag`: furo, SKU, grade disponível, foto quadrada, nome em mono, "Preço outlet". Não crie outro card de produto.
5. **Texto real.** Nada de número inventado (avaliações, quantidade de clientes) nem promessa que o sistema não cumpre. Hoje: só Pix, entrega por motoboy em Goiânia e Aparecida, retirada na loja.

## Cores

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0B0B0A` | Fundo da página, texto sobre etiqueta e sobre botão dourado |
| `paper` | `#F3EFE6` | Texto principal |
| `tag` | `#EDE8DD` | Fundo da etiqueta de produto |
| `muted` | `#B9B3A6` | Texto secundário, legendas |
| `line` | `#2A2824` | Divisórias e bordas |
| `ghost` | `#2E2B26` | Texto decorativo (faixa corrida) |
| `stroke` | `#4A463E` | Contorno do "LOBUS" gigante |
| `gold` | `#D4AF37` | Acento único |
| `goldHover` | `#E6C65A` | Hover do acento |
| `danger` | `#FF8A7A` | Erro |

Os nomes herdados do template (`primary`, `surface-container`, `on-surface`, `outline`...) e as escalas `zinc`/`amber` apontam para esta paleta, para drawer, modal, admin e página do pedido seguirem o visual. Em tela nova, use os tokens da tabela.

Contraste conferido: `paper` sobre `ink` e `ink` sobre `gold` passam de 4.5:1. `muted` sobre `ink` serve para texto secundário a partir de 13px.

## Tipografia

| Papel | Família | Onde |
|---|---|---|
| Display | Anton (peso único 400) | Hero, títulos de seção, preço, rótulo de bloco |
| Corpo | Archivo 400–700 | Texto corrido, navegação, botões, labels |
| Mono | IBM Plex Mono 400–600 | SKU, grade, nome do produto na etiqueta, dados tabulares |

Escala (classes Tailwind):

| Classe | Tamanho | Uso |
|---|---|---|
| `text-display-xl` | clamp(60px, 9.4vw, 146px) | Só o hero |
| `ui.sectionTitle` | clamp(44px, 6vw, 72px) | Título de seção |
| `text-headline-lg` | 44px | Título de página interna |
| `text-headline-md` | 28px | Subtítulo |
| `text-label-lg` / `-md` / `-sm` | 14 / 13 / 12px, caixa alta, espaçado | Botão, navegação, eyebrow |
| `text-body-lg` / `-md` / `-sm` | 16 / 15 / 13px | Texto corrido |

Regras: label sempre em caixa alta com espaçamento (já vem na escala). Preço sempre `font-display` + `tabular-nums`. Corpo nunca abaixo de 13px.

## Componentes

Todos em `src/design/ui.ts` (`import { ui } from "@/design/ui"`).

| Receita | Aparência | Quando usar |
|---|---|---|
| `ui.btnPrimary` | Bloco dourado, texto `ink`, 48px de altura | Uma ação principal por tela |
| `ui.btnGhost` | Contorno `paper` | Ação secundária |
| `ui.linkUnderline` | Caixa alta com sublinhado | "Ver catálogo completo" e similares |
| `ui.navLink` | Label que fica dourada no hover | Navegação |
| `ui.pill` + `ui.pillOn`/`ui.pillOff` | Filtro quadrado | Filtros e seleção de tamanho |
| `ui.eyebrow` | Label dourada espaçada | Acima de título |
| `ui.heroTitle`, `ui.sectionTitle`, `ui.pageTitle` | Anton caixa alta | Títulos |
| `ui.input` | Campo escuro, borda dourada no foco | Formulários |
| `ui.mono` | Mono 12px caixa alta | SKU, códigos, números de pedido |
| `ui.container` | max 1440px, gutter 16px / 40px | Toda seção |
| `brl(n)` | `R$ 89,90` | Todo preço |

`ProductTag` recebe `product` e `onOpen` (normalmente `setActiveProductModal` do `CartContext`).

`SiteHeader` vai no topo de toda tela que não é a home: logo, Loja, Entrar/Minha conta e Sacola. A sacola (`CartDrawer`) abre em qualquer tela.

Status de pedido: textos em `src/lib/order-status.ts`. Na lista de pedidos, "Aguardando pagamento" é o único em bloco dourado (pede ação do cliente); em andamento usa contorno dourado; finalizados ficam em `muted`.

## Padrões de página

- **Seção:** `ui.container`, título `ui.sectionTitle`, 80–96px de respiro acima.
- **Faixa corrida:** divisórias `line` em cima e embaixo, Anton em `ghost`, animação `lobus-band` (`globals.css`), parada com `prefers-reduced-motion`.
- **Bloco de categoria:** foto cheia com rótulo em Anton sobre retângulo `ink` no canto inferior esquerdo.
- **Rodapé:** "LOBUS" gigante vazado (`stroke`) e uma linha de informações em `muted`.
- **Grade de produtos:** `grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-6`.

## Acessibilidade

- Foco visível dourado em tudo que é clicável.
- Alvo de toque mínimo de 40–48px (pills e botões já cumprem).
- Animação sempre com `motion-reduce:` desligando.
- Card de produto é `<button>` com `aria-label` contendo nome e preço.

## Pendências conhecidas

- O Tailwind roda pelo CDN (`cdn.tailwindcss.com`), herança do template. Funciona, mas gera aviso de lint e um flash de estilo no carregamento. Migrar para o Tailwind v4 compilado (já está nas devDependencies) quando der.
- Modal de produto, sacola e telas do admin herdam a paleta pelos nomes antigos, mas ainda têm cantos e layouts do template. Ao mexer nelas, trazer para os componentes acima.
