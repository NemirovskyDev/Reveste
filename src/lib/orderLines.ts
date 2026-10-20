/**
 * Junta o plano e os aluguéis avulsos da sacola em totais e em linhas de pedido.
 * O plano só entra quando está completo (4 peças); um plano pela metade fica de fora da conta.
 */
import { getPiece } from "@/data/catalog";
import { PLAN_SIZE, planLine, rentalCents } from "@/lib/pricing";
import { pieceTitle } from "@/lib/piece";
import type { CartLine, PlanSlot } from "@/store/sanitize";
import type { OrderLine } from "@/services/types";

export type BagSummary = {
  hasPlan: boolean;
  /** Peças do plano ainda não fechado (1 a 3), que não entram no pagamento. */
  pendingPlanSlots: number;
  /** Mensalidade do plano que está sendo montado (1 a 3 peças); só informativa, não entra no subtotal. */
  pendingPlanCents: number;
  planCents: number;
  /** Soma dos aluguéis de 30 dias sem desconto e o desconto do plano, para mostrar a economia. */
  planFullCents: number;
  planDiscountCents: number;
  rentalsCents: number;
  subtotalCents: number;
  pieceCount: number;
  canCheckout: boolean;
};

export function summarizeBag(slots: readonly PlanSlot[], cart: readonly CartLine[]): BagSummary {
  const hasPlan = slots.length === PLAN_SIZE;
  const planParts = slots.map((slot) => planLine(getPiece(slot.pieceId)));
  const sumOf = (key: "rental" | "discount" | "net") => planParts.reduce((sum, part) => sum + part[key], 0);
  const planCents = hasPlan ? sumOf("net") : 0;
  const rentalsCents = cart.reduce((sum, line) => sum + rentalCents(getPiece(line.pieceId), line.days), 0);
  return {
    hasPlan,
    pendingPlanSlots: hasPlan ? 0 : slots.length,
    pendingPlanCents: hasPlan ? 0 : sumOf("net"),
    planFullCents: hasPlan ? sumOf("rental") : 0,
    planDiscountCents: hasPlan ? sumOf("discount") : 0,
    planCents,
    rentalsCents,
    subtotalCents: planCents + rentalsCents,
    pieceCount: (hasPlan ? PLAN_SIZE : 0) + cart.length,
    canCheckout: hasPlan || cart.length > 0,
  };
}

export function buildOrderLines(slots: readonly PlanSlot[], cart: readonly CartLine[]): OrderLine[] {
  const lines: OrderLine[] = [];
  if (slots.length === PLAN_SIZE) {
    for (const slot of slots) {
      const piece = getPiece(slot.pieceId);
      lines.push({
        pieceId: piece.id,
        title: pieceTitle(piece),
        size: slot.size,
        kind: "plan",
        priceCents: planLine(piece).net,
      });
    }
  }
  for (const line of cart) {
    const piece = getPiece(line.pieceId);
    lines.push({
      pieceId: piece.id,
      title: pieceTitle(piece),
      size: line.size,
      kind: "rental",
      days: line.days,
      priceCents: rentalCents(piece, line.days),
    });
  }
  return lines;
}
