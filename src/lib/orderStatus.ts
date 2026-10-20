import type { OrderStatus } from "@/services/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  confirmado: "Pedido confirmado",
  "em-separacao": "Em separação",
  enviado: "A caminho",
  entregue: "Entregue",
  "devolucao-agendada": "Devolução agendada",
  devolvido: "Devolvido",
};
