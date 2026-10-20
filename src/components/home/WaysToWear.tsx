import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { pieceTitle } from "@/lib/piece";
import { PLAN_SIZE, buyoutCents, netPlanRentalCents, rentalCents } from "@/lib/pricing";

/** Peça de exemplo: os três preços vêm das regras de preço, então nunca ficam diferentes do resto do site. */
const SAMPLE = getPiece("zara-blazer");

const WAYS = [
  {
    id: "plano",
    title: "Plano mensal",
    price: `${formatMoney(netPlanRentalCents(SAMPLE))}/mês por peça`,
    text: `${PLAN_SIZE} peças por mês, frete grátis e troca todo mês. É o jeito mais barato de alugar.`,
    href: "/assinatura",
    cta: "Montar meu plano",
    color: "bg-lavender",
  },
  {
    id: "avulso",
    title: "Aluguel avulso",
    price: `a partir de ${formatMoney(rentalCents(SAMPLE, 7))}`,
    text: "Uma peça só, por 7, 14 ou 30 dias. Bom para um evento ou para testar antes de assinar.",
    href: "/catalogo",
    cta: "Escolher uma peça",
    color: "bg-blush",
  },
  {
    id: "compra",
    title: "Comprar a peça",
    price: `por ${formatMoney(buyoutCents(SAMPLE, 0))}`,
    text: "Fica com você de vez, mesmo sem ter alugado antes. Quem já alugou paga menos, o aluguel é descontado.",
    href: "/catalogo",
    cta: "Ver peças à venda",
    color: "bg-mint",
  },
] as const;

export function WaysToWear() {
  return (
    <Container as="section" aria-labelledby="jeitos-titulo" className="py-16 md:py-24">
      <h2 id="jeitos-titulo" className="mb-3 max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        Três jeitos de vestir
      </h2>
      <p className="mb-10 max-w-2xl text-lg text-ink-soft md:text-xl">
        Assine, alugue uma peça ou compre. Os preços abaixo são da {pieceTitle(SAMPLE)}, só como exemplo.
      </p>
      <ul className="grid gap-5 md:grid-cols-3">
        {WAYS.map((way) => (
          <li key={way.id} className={`grid content-between gap-6 rounded-card border-2 border-ink p-6 md:p-7 ${way.color}`}>
            <div>
              <h3 className="font-display text-2xl font-extrabold">{way.title}</h3>
              <p className="mt-2 font-display text-xl font-bold">{way.price}</p>
              <p className="mt-3 text-ink">{way.text}</p>
            </div>
            <ButtonLink href={way.href} variant="secondary" iconAfter="arrow-right">
              {way.cta}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </Container>
  );
}
