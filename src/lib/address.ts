import { prisma } from "@/lib/prisma";

export const onlyDigits = (s: string) => s.replace(/\D/g, "");
export const formatCep = (cep: string) => `${cep.slice(0, 5)}-${cep.slice(5)}`;

export type CepAddress = { street: string; neighborhood: string; city: string; state: string };

// ViaCEP só preenche a tela. Fora do ar ou lento: o cliente digita à mão.
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: AbortSignal.timeout(4000) });
    const j: Record<string, string | boolean> = await r.json();
    if (!r.ok || j.erro) return null;
    const text = (k: string) => String(j[k] ?? "");
    return { street: text("logradouro"), neighborhood: text("bairro"), city: text("localidade"), state: text("uf") };
  } catch {
    return null;
  }
}

export type ZoneInfo = { name: string; fee: number; freeAbove: number | null; hours: number };

// Mesma regra de prefixo do buildQuote (checkout). null = fora da área do motoboy.
export async function zoneForCep(cep: string): Promise<ZoneInfo | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } });
  const z = zones.find((x) => x.cepPrefixes.some((p) => d.startsWith(p)));
  return z ? { name: z.name, fee: Number(z.deliveryFee), freeAbove: z.freeShippingAbove ? Number(z.freeShippingAbove) : null, hours: z.estimatedDeliveryHours } : null;
}

export type AddressInput = { label: string; cep: string; street: string; number: string; complement: string | null; neighborhood: string; city: string; state: string; reference: string | null };

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim().slice(0, 120);

// Lê e valida o endereço vindo de um formulário (cadastro ou conta).
export function parseAddress(fd: FormData): { data: AddressInput } | { error: string } {
  const address = {
    label: s(fd, "label") || "Casa",
    cep: onlyDigits(s(fd, "cep")),
    street: s(fd, "street"),
    number: s(fd, "number"),
    complement: s(fd, "complement") || null,
    neighborhood: s(fd, "neighborhood"),
    city: s(fd, "city"),
    state: s(fd, "state").toUpperCase().slice(0, 2),
    reference: s(fd, "reference") || null,
  };
  if (address.cep.length !== 8) return { error: "Informe um CEP válido." };
  if (!address.street || !address.number || !address.neighborhood) return { error: "Preencha rua, número e bairro." };
  if (!address.city || address.state.length !== 2) return { error: "Preencha cidade e UF." };
  return { data: address };
}
