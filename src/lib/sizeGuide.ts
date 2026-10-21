/**
 * Guia de medidas: tabela de referência (cm) e a regra que sugere o tamanho. As faixas são genéricas, para dar uma
 * ideia de partida; cada marca modela de um jeito, e a página da peça traz a descrição da modelagem.
 */
import { SIZES, type Size } from "@/data/catalog";

export type SizeKind = "feminino" | "masculino";
export type Measure = "chest" | "waist" | "hip";

export const MEASURE_LABEL: Record<Measure, Record<SizeKind, string>> = {
  chest: { feminino: "Busto", masculino: "Peito" },
  waist: { feminino: "Cintura", masculino: "Cintura" },
  hip: { feminino: "Quadril", masculino: "Quadril" },
};

/** Limite superior (cm) de cada tamanho, na ordem de `SIZES` (PP, P, M, G, GG). Acima do GG a tabela não cobre. */
const LIMITS: Record<SizeKind, Record<Measure, readonly number[]>> = {
  feminino: { chest: [84, 88, 92, 98, 104], waist: [66, 70, 74, 80, 86], hip: [92, 96, 100, 106, 112] },
  masculino: { chest: [90, 96, 102, 108, 114], waist: [76, 82, 88, 94, 100], hip: [94, 100, 106, 112, 118] },
};

export const MIN_CM = 50;
export const MAX_CM = 200;

export const MEASURES: readonly Measure[] = ["chest", "waist", "hip"];

/** Texto da faixa de um tamanho, ex.: "85–88" (o PP é "até 84" e o GG não tem teto na tabela impressa). */
export function rangeText(kind: SizeKind, measure: Measure, size: Size): string {
  const index = SIZES.indexOf(size);
  const limits = LIMITS[kind][measure];
  return index === 0 ? `até ${limits[0]}` : `${limits[index - 1] + 1}–${limits[index]}`;
}

export type SizeResult = { size: Size } | { size: null; reason: "above" };

/**
 * Sugere o tamanho: olha cada medida e fica com o maior tamanho entre elas, porque a roupa precisa servir na parte
 * mais larga. Medidas ausentes são ignoradas; acima do GG devolve `reason: "above"`.
 */
export function recommendSize(kind: SizeKind, values: Partial<Record<Measure, number>>): SizeResult | null {
  let largest = -1;
  for (const measure of MEASURES) {
    const value = values[measure];
    if (value === undefined || !Number.isFinite(value) || value < MIN_CM || value > MAX_CM) continue;
    const index = LIMITS[kind][measure].findIndex((limit) => value <= limit);
    if (index === -1) return { size: null, reason: "above" };
    largest = Math.max(largest, index);
  }
  return largest === -1 ? null : { size: SIZES[largest] };
}
