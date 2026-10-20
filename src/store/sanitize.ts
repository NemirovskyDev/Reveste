/**
 * O armazenamento local pode estar vazio, corrompido ou desatualizado (peça que saiu do catálogo,
 * tamanho que não existe mais). Estas funções reconstroem só o que ainda é válido, sem lançar erro.
 */
import { findPiece, SIZES, type Size } from "@/data/catalog";
import { PLAN_SIZE, RENTAL_DAYS, type RentalDays } from "@/lib/pricing";

/** `buy` marca a compra da peça; nela o prazo (`days`) não vale e fica no padrão só para manter o tipo simples. */
export type CartLine = { pieceId: string; size: Size; days: RentalDays; buy?: boolean };
export type PlanSlot = { pieceId: string; size: Size };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function validPieceAndSize(pieceId: unknown, size: unknown): { pieceId: string; size: Size } | null {
  if (typeof pieceId !== "string" || typeof size !== "string") return null;
  const piece = findPiece(pieceId);
  if (!piece) return null;
  if (!SIZES.includes(size as Size) || !piece.sizes.includes(size as Size)) return null;
  return { pieceId, size: size as Size };
}

export function sanitizeCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const base = validPieceAndSize(entry.pieceId, entry.size);
    const buy = entry.buy === true;
    const days = (buy ? RENTAL_DAYS[0] : entry.days) as RentalDays;
    if (!base || !RENTAL_DAYS.includes(days) || seen.has(base.pieceId)) continue;
    seen.add(base.pieceId);
    lines.push(buy ? { ...base, days, buy } : { ...base, days });
  }
  return lines;
}

export function sanitizePlan(raw: unknown): PlanSlot[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const slots: PlanSlot[] = [];
  for (const entry of raw) {
    if (slots.length === PLAN_SIZE) break;
    if (!isRecord(entry)) continue;
    const base = validPieceAndSize(entry.pieceId, entry.size);
    if (!base || seen.has(base.pieceId)) continue;
    seen.add(base.pieceId);
    slots.push(base);
  }
  return slots;
}
