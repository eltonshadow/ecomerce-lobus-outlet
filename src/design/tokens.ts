// Design system TROPA DA MAUÁ: cores oficiais Amarelo & Preto do Enxame.
// O layout raiz transforma isto na config do Tailwind (CDN). Não declare cor/fonte fora daqui.

export const palette = {
  ink: "#0A0A0A", // fundo da página: preto raiz da várzea
  paper: "#F7F7F2", // texto principal
  tag: "#EDE9DE", // etiqueta de produto (card claro)
  muted: "#A8A396", // texto secundário
  line: "#262624", // divisórias, bordas
  ghost: "#1E1E1C", // texto decorativo (faixa corrida)
  stroke: "#3E3A2A", // contorno do TROPA DA MAUÁ gigante
  gold: "#FFCC00", // amarelo oficial da Tropa da Mauá: CTA, destaque, abelha
  goldHover: "#FFE033", // hover do amarelo
  danger: "#EF4444",
} as const;

// Nomes herdados do template (Material) apontando para a paleta nova,
// para drawer, modal, admin e página do pedido seguirem o mesmo visual.
const semantic = {
  background: palette.ink,
  surface: palette.ink,
  "surface-dim": palette.ink,
  "surface-container-lowest": "#080807",
  "surface-container-low": "#121110",
  "surface-container": "#181715",
  "surface-container-high": "#211F1C",
  "surface-container-highest": palette.line,
  "surface-bright": "#33302B",
  "surface-variant": palette.line,
  "on-background": palette.paper,
  "on-surface": palette.paper,
  "on-surface-variant": palette.muted,
  outline: "#8F897C",
  "outline-variant": "#3A3732",
  primary: palette.gold,
  "primary-container": "#B8952B",
  "primary-fixed": palette.goldHover,
  "primary-fixed-dim": palette.gold,
  "on-primary": palette.ink,
  "on-primary-container": palette.ink,
  tertiary: palette.goldHover,
  "tertiary-container": "#B8952B",
  "on-tertiary": palette.ink,
  secondary: palette.muted,
  "on-secondary": palette.ink,
  error: palette.danger,
  "error-container": "#93000a",
  "on-error": palette.ink,
  "on-error-container": "#ffdad6",
  "inverse-surface": palette.paper,
  "inverse-on-surface": palette.ink,
};

export const fonts = {
  display: ["Anton", "Impact", "Arial Narrow", "sans-serif"],
  body: ["Archivo", "Helvetica Neue", "Arial", "sans-serif"],
  mono: ["IBM Plex Mono", "ui-monospace", "Menlo", "monospace"],
};

export const fontsHref =
  "https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";

// Escala: [tamanho, altura de linha, espaçamento, peso]. Anton só tem peso 400.
const t = (size: string, lineHeight: string, letterSpacing: string, fontWeight: string) => [size, { lineHeight, letterSpacing, fontWeight }];

export const tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ...palette,
        ...semantic,
        // Escalas fixas herdadas (modal, sacola) puxadas para a paleta. Em tela nova use os tokens acima.
        zinc: { 200: palette.paper, 300: "#D8D2C5", 400: palette.muted, 500: "#8F897C", 600: "#5E5A52", 700: "#3A3732", 800: palette.line, 900: "#181715", 950: "#080807" },
        amber: { 300: palette.goldHover, 400: palette.gold, 500: palette.gold },
        emerald: { 400: "#9BD3A4", 500: "#7FBF8A" },
      },
      fontFamily: {
        display: fonts.display,
        body: fonts.body,
        mono: fonts.mono,
        // nomes herdados
        "display-lg": fonts.display,
        "display-lg-mobile": fonts.display,
        "headline-lg": fonts.display,
        "headline-lg-mobile": fonts.display,
        "headline-md": fonts.display,
        "headline-sm": fonts.body,
        "label-lg": fonts.body,
        "label-md": fonts.body,
        "label-sm": fonts.body,
        "body-lg": fonts.body,
        "body-md": fonts.body,
        "body-sm": fonts.body,
      },
      fontSize: {
        "display-xl": t("clamp(3.75rem, 9.4vw, 9.125rem)", "0.86", "-0.01em", "400"), // hero
        "display-lg": t("3.5rem", "0.95", "0", "400"),
        "display-lg-mobile": t("2.5rem", "0.95", "0", "400"),
        "headline-lg": t("2.75rem", "0.95", "0", "400"),
        "headline-lg-mobile": t("2rem", "1", "0", "400"),
        "headline-md": t("1.75rem", "1.05", "0.01em", "400"),
        "headline-sm": t("1.125rem", "1.35", "0.02em", "700"),
        "label-lg": t("0.875rem", "1.2", "0.14em", "700"),
        "label-md": t("0.8125rem", "1.2", "0.12em", "600"),
        "label-sm": t("0.75rem", "1.2", "0.12em", "600"),
        "body-lg": t("1rem", "1.6", "0", "400"),
        "body-md": t("0.9375rem", "1.55", "0", "400"),
        "body-sm": t("0.8125rem", "1.5", "0.01em", "400"),
      },
      borderRadius: { DEFAULT: "0", sm: "0", md: "0.125rem", lg: "0.125rem", xl: "0.25rem", "2xl": "0.25rem", full: "9999px" },
      spacing: {
        "gutter-mobile": "1rem",
        gutter: "1.5rem",
        "margin-mobile": "1.25rem",
        margin: "2.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
    },
  },
};
