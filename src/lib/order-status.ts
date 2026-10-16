import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pagamento aprovado",
  PREPARING: "Em separação",
  READY_FOR_PICKUP: "Pronto para retirada",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

// Ordem visível ao cliente (linha do tempo). Cancelado fica fora da trilha.
export const ORDER_STEPS: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "READY_FOR_PICKUP", "DELIVERED"];
export const ORDER_STEPS_DELIVERY: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
