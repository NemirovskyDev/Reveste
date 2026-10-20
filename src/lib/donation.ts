/**
 * Regra do desconto por doação: a cada 3 peças doadas a pessoa ganha 1 desconto de 15% a 50%, conforme o tipo das
 * peças. Funções puras, sem estado e sem DOM. O valor final só é confirmado depois que a equipe confere as peças.
 */

export const DONATION_GROUP_SIZE = 3;
export const MIN_DISCOUNT = 15;
export const MAX_DISCOUNT = 50;
export const MAX_PER_CATEGORY = 30;

export const DONATION_CATEGORIES = [
  { id: "basica", label: "Básicas", examples: "Camiseta, regata, short, legging", discount: 15 },
  { id: "casual", label: "Casual do dia a dia", examples: "Calça, saia, camisa, malha, jeans", discount: 25 },
  { id: "marca", label: "De marca conhecida", examples: "Vestido, blusa ou jaqueta de marca, bem conservada", discount: 35 },
  { id: "elegante", label: "Alfaiataria, festa e casacos", examples: "Blazer, trench, vestido de festa, couro", discount: 50 },
] as const;

export type DonationCategoryId = (typeof DONATION_CATEGORIES)[number]["id"];
export type DonationCounts = Record<DonationCategoryId, number>;

export const EMPTY_DONATION: DonationCounts = { basica: 0, casual: 0, marca: 0, elegante: 0 };

export type DonationReward = {
  total: number;
  /** Um item por desconto ganho, em %, do maior para o menor. */
  discounts: number[];
  /** Peças que ainda não fecharam um grupo de 3. */
  remainder: number;
  /** Quantas peças faltam para o próximo desconto (0 quando o total fecha grupos exatos e é maior que zero). */
  toNext: number;
};

const roundToFive = (value: number) => Math.round(value / 5) * 5;

/** Peças mais valiosas primeiro e grupos de 3: o desconto de cada grupo é a média do % das peças, em múltiplos de 5. */
export function donationReward(counts: Partial<Record<DonationCategoryId, number>>): DonationReward {
  const rates = DONATION_CATEGORIES.flatMap((category) => {
    const raw = counts[category.id] ?? 0;
    // Campo vazio chega como NaN do formulário: conta como zero.
    const qty = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    return Array<number>(Math.min(qty, MAX_PER_CATEGORY)).fill(category.discount);
  }).sort((a, b) => b - a);

  const discounts: number[] = [];
  for (let i = 0; i + DONATION_GROUP_SIZE <= rates.length; i += DONATION_GROUP_SIZE) {
    const group = rates.slice(i, i + DONATION_GROUP_SIZE);
    const average = group.reduce((sum, rate) => sum + rate, 0) / DONATION_GROUP_SIZE;
    discounts.push(Math.min(MAX_DISCOUNT, Math.max(MIN_DISCOUNT, roundToFive(average))));
  }

  const remainder = rates.length % DONATION_GROUP_SIZE;
  return {
    total: rates.length,
    discounts,
    remainder,
    toNext: remainder === 0 ? DONATION_GROUP_SIZE : DONATION_GROUP_SIZE - remainder,
  };
}
