/**
 * Regras de preço da Reveste. Funções puras, sem estado e sem DOM.
 * Todos os valores são centavos inteiros; cada peça é arredondada com
 * Math.round, para que o total mostrado seja a soma exata das linhas.
 */
import type { Piece, Tier } from "@/data/catalog";

export type RentalDays = 7 | 14 | 30;
export type DamageKind = "leve" | "grave";

type Priced = Pick<Piece, "id" | "valueCents" | "tier">;

export const PLAN_SIZE = 4;
export const RENTAL_DAYS: readonly RentalDays[] = [7, 14, 30];

const RENTAL_RATE: Record<RentalDays, number> = { 7: 0.15, 14: 0.25, 30: 0.4 };
const PLAN_DISCOUNT: Record<Tier, number> = { essencial: 0.05, premium: 0.1 };
const BUYOUT_RATE = 0.7;
const LATE_FEE_FACTOR = 1.5;
const DAMAGE_LIGHT_RATE = 0.15;

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export function rentalCents(piece: Pick<Piece, "valueCents">, days: RentalDays): number {
  const rate = RENTAL_RATE[days];
  if (rate === undefined) throw new PricingError("Prazo inválido: use 7, 14 ou 30 dias.");
  return Math.round(piece.valueCents * rate);
}

export function planDiscountRate(tier: Tier): number {
  return PLAN_DISCOUNT[tier];
}

/** Aluguel de 30 dias já com o desconto da assinatura. */
export function netPlanRentalCents(piece: Pick<Piece, "valueCents" | "tier">): number {
  const rental = rentalCents(piece, 30);
  return rental - Math.round(rental * PLAN_DISCOUNT[piece.tier]);
}

export type PlanLine = { id: string; rental: number; discount: number; net: number };
export type PlanQuote = { lines: PlanLine[]; full: number; discount: number; monthly: number };

export function planLine(piece: Priced): PlanLine {
  const rental = rentalCents(piece, 30);
  const discount = Math.round(rental * PLAN_DISCOUNT[piece.tier]);
  return { id: piece.id, rental, discount, net: rental - discount };
}

/** Total parcial para o montador do plano: aceita de 0 a 4 peças sem exigir o plano completo. */
export function partialPlanQuote(pieces: readonly Priced[]): PlanQuote {
  const lines = pieces.map(planLine);
  const sum = (key: keyof Omit<PlanLine, "id">) => lines.reduce((total, line) => total + line[key], 0);
  return { lines, full: sum("rental"), discount: sum("discount"), monthly: sum("net") };
}

/** Preço do plano fechado: exige exatamente 4 peças distintas. */
export function planQuote(pieces: readonly Priced[]): PlanQuote {
  if (pieces.length !== PLAN_SIZE) {
    throw new PricingError(`O plano precisa de exatamente ${PLAN_SIZE} peças.`);
  }
  if (new Set(pieces.map((piece) => piece.id)).size !== pieces.length) {
    throw new PricingError("Há peças repetidas no plano.");
  }
  return partialPlanQuote(pieces);
}

export function buyoutCents(piece: Pick<Piece, "valueCents" | "tier">, months: number): number {
  if (!Number.isInteger(months) || months < 0) {
    throw new PricingError("Informe os meses alugados como número inteiro, a partir de 0.");
  }
  return Math.max(0, Math.round(piece.valueCents * BUYOUT_RATE) - months * netPlanRentalCents(piece));
}

export function lateFeePerDay(piece: Pick<Piece, "valueCents">): number {
  return Math.round((rentalCents(piece, 30) / 30) * LATE_FEE_FACTOR);
}

export function damageCents(piece: Pick<Piece, "valueCents" | "tier">, kind: DamageKind): number {
  if (kind === "leve") return Math.round(piece.valueCents * DAMAGE_LIGHT_RATE);
  if (kind === "grave") return Math.max(0, piece.valueCents - netPlanRentalCents(piece));
  throw new PricingError('Tipo de dano inválido: use "leve" ou "grave".');
}

export function lossCents(piece: Pick<Piece, "valueCents">): number {
  return piece.valueCents;
}
