import { getPiece } from "@/data/catalog";
import {
  buyoutCents,
  damageCents,
  lateFeePerDay,
  lossCents,
  netPlanRentalCents,
  rentalCents,
} from "@/lib/pricing";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const money = (cents: number) => brl.format(cents / 100);

const example = getPiece("zara-blazer");
const pieceLabel = `${example.name} Zara, de ${money(example.valueCents)}`;

export type RuleRow = { id: string; situation: string; how: string; example: string };

export const RULES_TABLE: readonly RuleRow[] = [
  {
    id: "aluguel",
    situation: "Aluguel avulso",
    how: "15% do valor da peça por 7 dias, 25% por 14 dias ou 40% por 30 dias.",
    example: `${pieceLabel}: ${money(rentalCents(example, 7))} por 7 dias, ${money(rentalCents(example, 14))} por 14 dias e ${money(rentalCents(example, 30))} por 30 dias.`,
  },
  {
    id: "assinatura",
    situation: "Assinatura de 4 peças",
    how: "Aluguel de 30 dias de cada peça, com 5% de desconto nas peças Essencial e 10% nas Premium.",
    example: `${pieceLabel}: ${money(netPlanRentalCents(example))} por mês no plano, em vez de ${money(rentalCents(example, 30))}.`,
  },
  {
    id: "compra",
    situation: "Compra da peça",
    how: "70% do valor da peça, menos o aluguel líquido já pago. O resultado nunca fica abaixo de zero.",
    example: `${pieceLabel}: ${money(buyoutCents(example, 0))} sem aluguel prévio e ${money(buyoutCents(example, 1))} depois de 1 mês no plano.`,
  },
  {
    id: "atraso",
    situation: "Atraso na devolução",
    how: "Diária do aluguel de 30 dias, mais 50%, por dia de atraso.",
    example: `${pieceLabel}: ${money(lateFeePerDay(example))} por dia.`,
  },
  {
    id: "dano-leve",
    situation: "Dano leve",
    how: "15% do valor da peça.",
    example: `${pieceLabel}: ${money(damageCents(example, "leve"))}.`,
  },
  {
    id: "dano-grave",
    situation: "Dano grave",
    how: "Valor da peça menos o aluguel líquido já pago.",
    example: `${pieceLabel}, com o aluguel de 1 mês do plano já pago: ${money(damageCents(example, "grave"))}.`,
  },
  {
    id: "perda",
    situation: "Perda da peça",
    how: "Valor integral da peça.",
    example: `${pieceLabel}: ${money(lossCents(example))}.`,
  },
];

export const SUBSCRIPTION_RULES: readonly string[] = [
  "O plano reúne 4 peças distintas.",
  "O valor mensal é o aluguel de 30 dias de cada peça, com desconto.",
  "O desconto é de 5% nas peças Essencial e de 10% nas peças Premium.",
  "O plano renova a cada 30 dias, com as mesmas peças ou com uma nova seleção.",
  "Você troca as peças na renovação, antes da data de cobrança.",
  "Cancele antes da renovação para evitar a próxima cobrança.",
  "Devolva as peças no prazo para não pagar diária de atraso.",
];
