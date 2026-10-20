import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/help/FaqList";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { BuyoutCalculator } from "@/components/home/BuyoutCalculator";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ManequimShowcase } from "@/components/home/ManequimShowcase";
import { PlanSimulator } from "@/components/home/PlanSimulator";
import { RackBand } from "@/components/home/RackBand";
import { PlanTeaser } from "@/components/home/PlanTeaser";
import { ScrollAccents } from "@/components/home/ScrollAccents";
import { StoreEntrance } from "@/components/home/StoreEntrance";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { CATALOG } from "@/data/catalog";
import { FAQ } from "@/content/faq";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  description:
    "Aluguel de roupas de marca por assinatura: escolha 4 peças por mês de C&A, Renner, Zara e mais, use e devolva. Frete grátis no plano.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const FEATURED = CATALOG.filter((piece) =>
  ["zara-blazer", "renner-vestido", "mango-trench", "ca-jaqueta", "farm-vestido", "riachuelo-calca", "zara-slip", "ca-camisa"].includes(piece.id),
);

const HOME_FAQ = ["assinatura", "aluguel", "devolucao"].flatMap((category) => FAQ.filter((item) => item.category === category).slice(0, 2));

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Reveste",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: "Aluguel de roupas de marca por assinatura, com peças que não foram vendidas.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reveste",
    url: SITE_URL,
    inLanguage: "pt-BR",
  },
];

export default function Home() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <ScrollAccents />
      <HeroSection />

      <BrandMarquee />

      <StoreEntrance />

      <ManequimShowcase />

      {/* O GSAP envolve a seção fixada num "pin-spacer"; o contêiner mantém estável o ponto de inserção do React
          quando a seção do manequim troca de versão (sem ele a troca quebrava com "insertBefore"). */}
      <div>
        <HowItWorks />
      </div>
      <PlanTeaser />
      <PlanSimulator />

      <RackBand />

      <Container as="section" aria-labelledby="destaques" className="py-16 md:py-24">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="destaques" className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Peças em destaque
          </h2>
          <Link href="/catalogo" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
            Ver todo o catálogo
          </Link>
        </div>
        <FeaturedCarousel pieces={FEATURED} label="Peças em destaque" />
      </Container>

      <Container as="section" aria-labelledby="comprar-titulo" className="py-16 md:py-24">
        <h2 id="comprar-titulo" className="mb-3 max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Gostou da peça? Fique com ela.
        </h2>
        <p className="mb-10 max-w-2xl text-lg text-ink-soft md:text-xl">
          O preço de compra é 70% do valor da peça, e o que você já pagou de aluguel é descontado.
        </p>
        <BuyoutCalculator />
      </Container>

      <Container as="section" aria-labelledby="marcas-cta" className="py-16 md:py-24">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 rounded-card border-2 border-ink bg-blush p-8 md:p-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <h2 id="marcas-cta" className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Tem estoque parado? Ele pode voltar a circular.
            </h2>
            <p className="mt-4 max-w-xl text-lg">
              A Reveste cuida de higienização, entrega e devolução, e a sua marca recebe uma parte de cada aluguel.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <ButtonLink href="/marcas" size="lg" variant="primary" iconAfter="arrow-right">
              Conheça a parceria
            </ButtonLink>
          </div>
        </div>
      </Container>

      <Container as="section" aria-labelledby="duvidas" className="py-16 md:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="duvidas" className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Dúvidas frequentes
          </h2>
          <Link href="/ajuda" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
            Ver todas as respostas
          </Link>
        </div>
        <FaqList items={HOME_FAQ} />
      </Container>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
