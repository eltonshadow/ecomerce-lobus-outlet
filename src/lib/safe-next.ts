// Destino pós-login só dentro do site. Rejeita "//host", "/\host" e esquemas: o navegador
// trata "\" como "/" e transformaria "/\evil.com" em outro domínio.
export function safeNext(raw: string | null | undefined, fallback = "/conta") {
  if (!raw || !raw.startsWith("/") || /[\\\u0000-\u001f]/.test(raw)) return fallback;
  try {
    const u = new URL(raw, "http://lobus.local");
    return u.origin === "http://lobus.local" ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}
