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
  "bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary";
