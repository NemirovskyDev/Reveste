/**
 * Simulador do plano da home: dado o valor médio das peças e quantas delas são Premium,
 * calcula a mensalidade com as mesmas regras de preço do montador de plano.
 */
import type { Tier } from "@/data/catalog";
import { PLAN_SIZE, partialPlanQuote, type PlanQuote } from "@/lib/pricing";

export const SIM_VALUE_MIN_REAIS = 100;
export const SIM_VALUE_MAX_REAIS = 800;
export const SIM_VALUE_STEP_REAIS = 10;

export type SimulationInput = { valueReais: number; premiumCount: number };
export type Simulation = PlanQuote & { savingsPercent: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Aceita qualquer número (inclusive NaN ou fora da faixa dos sliders) e devolve valores válidos. */
export function normalizeSimulation({ valueReais, premiumCount }: SimulationInput): SimulationInput {
  const safeValue = Number.isFinite(valueReais) ? valueReais : SIM_VALUE_MIN_REAIS;
  const safePremium = Number.isFinite(premiumCount) ? premiumCount : 0;
  return {
    valueReais: clamp(Math.round(safeValue / SIM_VALUE_STEP_REAIS) * SIM_VALUE_STEP_REAIS, SIM_VALUE_MIN_REAIS, SIM_VALUE_MAX_REAIS),
    premiumCount: clamp(Math.round(safePremium), 0, PLAN_SIZE),
  };
}

export function simulatePlan(input: SimulationInput): Simulation {
  const { valueReais, premiumCount } = normalizeSimulation(input);
  const pieces = Array.from({ length: PLAN_SIZE }, (_, index) => ({
    id: `sim-${index}`,
    valueCents: valueReais * 100,
    tier: (index < premiumCount ? "premium" : "essencial") as Tier,
  }));
  const quote = partialPlanQuote(pieces);
  return { ...quote, savingsPercent: quote.full === 0 ? 0 : Math.round((quote.discount / quote.full) * 100) };
}
