import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LabelTag } from "@/components/ui/LabelTag";
import { getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { pieceTitle } from "@/lib/piece";
import { planQuote } from "@/lib/pricing";

const EXAMPLE = ["zara-blazer", "zara-slip", "ca-camisa", "renner-vestido"].map(getPiece);

/** Exemplo de plano com a conta feita: o preço vem das mesmas regras do montador. */
export function PlanTeaser() {
  const quote = planQuote(EXAMPLE);
  return (
    <Container as="section" aria-labelledby="plano-teaser" className="py-20 md:py-28">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h2 id="plano-teaser" className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            4 peças. Uma mensalidade.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-ink-soft md:text-xl">
            Peças Essencial têm 5% de desconto e peças Premium têm 10%. Veja como fica um plano com duas de cada.
          </p>
          <dl className="mt-8 grid max-w-md gap-2">
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>Aluguel avulso de 30 dias</dt>
              <dd>{formatMoney(quote.full)}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>Desconto do plano</dt>
              <dd>−{formatMoney(quote.discount)}</dd>
            </div>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold sm:text-3xl">
              <dt>Mensalidade</dt>
              <dd>{formatMoney(quote.monthly)}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <ButtonLink href="/assinatura" size="lg" iconAfter="arrow-right">
              Montar meu plano
            </ButtonLink>
          </div>
        </div>

        <ul aria-label="Exemplo de plano" className="grid gap-x-4 gap-y-8 pt-4 sm:grid-cols-2">
          {EXAMPLE.map((piece, index) => {
            const line = quote.lines[index];
            return (
              <li key={piece.id}>
                <LabelTag tier={piece.tier} className="pb-5">
                  <p className="font-display text-lg font-extrabold leading-tight">{pieceTitle(piece)}</p>
                  <p className="mt-1 text-sm">30 dias, tamanho M</p>
                  <p className="mt-4 border-t-2 border-dashed border-ink pt-3 font-bold">{formatMoney(line.net)} ao mês</p>
                </LabelTag>
              </li>
            );
          })}
        </ul>
      </div>
    </Container>
  );
}
