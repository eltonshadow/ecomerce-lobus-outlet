// Receitas de classe do design system. Use em vez de reinventar botão/título em cada tela.
// Documentadas em docs/DESIGN-SYSTEM.md.

export const ui = {
  container: "max-w-[1440px] mx-auto px-4 lg:px-10",
  eyebrow: "font-body text-label-sm uppercase tracking-[0.2em] text-gold",
  heroTitle: "font-display text-display-xl uppercase",
  sectionTitle: "font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.9] uppercase",
  pageTitle: "font-display text-headline-lg uppercase",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-8 bg-gold text-ink font-body text-label-lg uppercase hover:bg-goldHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  btnGhost:
    "inline-flex items-center justify-center gap-2 min-h-[48px] px-8 border border-paper text-paper font-body text-label-lg uppercase hover:border-gold hover:text-gold transition-colors",
  linkUnderline: "font-body text-label-md uppercase border-b border-paper pb-1 hover:text-gold hover:border-gold transition-colors",
  navLink: "font-body text-label-md uppercase hover:text-gold transition-colors",
  pill: "min-h-[40px] px-4 border font-body text-label-sm uppercase transition-colors",
  pillOn: "border-gold bg-gold text-ink",
  pillOff: "border-line text-muted hover:border-paper hover:text-paper",
  divider: "border-line",
  input:
    "w-full bg-surface-container-low border border-outline-variant px-3 py-3 font-body text-body-md text-paper placeholder:text-outline focus:outline-none focus:border-gold",
  mono: "font-mono text-[12px] font-semibold uppercase",
  // Painel admin: etiqueta clara (ticket, etiqueta de produto, vale, crachá) sobre o fundo ink.
  tagCard: "relative bg-tag text-ink",
  hole: "absolute w-4 h-4 rounded-full bg-ink",
  btnInk:
    "inline-flex items-center justify-center min-h-[44px] px-5 bg-ink text-paper font-body text-label-md uppercase hover:bg-ghost transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  btnInkGhost:
    "inline-flex items-center justify-center min-h-[44px] px-5 border border-ink text-ink font-body text-label-md uppercase hover:bg-ink hover:text-paper transition-colors disabled:opacity-50",
  // Status sobre etiqueta clara: pede ação = dourado; em andamento = contorno; finalizado = apagado.
  stAct: "px-2 py-1 bg-gold text-ink font-body text-label-sm uppercase whitespace-nowrap",
  stRun: "px-2 py-1 border border-ink text-ink font-body text-label-sm uppercase whitespace-nowrap",
  stDone: "py-1 text-stroke font-body text-label-sm uppercase whitespace-nowrap",
  eyebrowMuted: "font-body text-label-sm uppercase text-stroke",
};

export const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
