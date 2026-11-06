export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PREPARING: "Em separação",
  READY_FOR_PICKUP: "Pronto p/ retirada",
  OUT_FOR_DELIVERY: "Saiu p/ entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  FAILED: "Falhou",
  REFUNDED: "Estornado",
};

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  EXPEDICAO: "Expedição",
  ATENDIMENTO: "Atendimento",
};

export const brl = (n: number | { toString(): string }) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dateTime = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export const inputCls =
  "min-h-[44px] bg-surface-container-low border border-outline-variant px-3 font-body text-body-md text-paper placeholder:text-outline focus:outline-none focus:border-gold";

// O que cada perfil abre no painel (espelha os requireAdmin das páginas).
export const ROLE_ACCESS: Record<string, { label: string; on: boolean }[]> = {
  ADMIN: [{ label: "Pedidos", on: true }, { label: "Pagamentos", on: true }, { label: "Produtos: cria e edita", on: true }, { label: "Cupons", on: true }, { label: "Usuários", on: true }],
  EXPEDICAO: [{ label: "Pedidos", on: true }, { label: "Pagamentos", on: false }, { label: "Produtos: preço, estoque, ativo", on: true }, { label: "Cupons", on: false }, { label: "Usuários", on: false }],
  ATENDIMENTO: [{ label: "Pedidos", on: true }, { label: "Pagamentos", on: false }, { label: "Produtos", on: false }, { label: "Cupons", on: false }, { label: "Usuários", on: false }],
};

// Próxima etapa do fluxo feliz, a partir do status e do tipo de entrega. Cancelar fica no detalhe do pedido.
export function nextStep(status: string, delivery: string): { to: string; label: string } | null {
  if (status === "PAID") return { to: "PREPARING", label: "Separar" };
  if (status === "PREPARING") return delivery === "PICKUP" ? { to: "READY_FOR_PICKUP", label: "Liberar retirada" } : { to: "OUT_FOR_DELIVERY", label: "Despachar" };
  if (status === "READY_FOR_PICKUP" || status === "OUT_FOR_DELIVERY") return { to: "DELIVERED", label: "Entregar" };
  return null;
}

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
