"use client";

import { useInView, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { LookShowcase } from "@/components/home/LookShowcase";
import { useCanRender3D } from "@/components/three/capabilities";
import { ButtonLink } from "@/components/ui/Button";
import { getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { PLAN_SIZE, planQuote } from "@/lib/pricing";

// Three.js só é baixado no navegador e fora do JavaScript inicial da página.
const ManequimStage = dynamic(() => import("@/components/three/ManequimStage").then((module) => module.ManequimStage), {
  ssr: false,
  loading: () => null,
});

/** Mesmo plano de exemplo do hero e da seção de plano: os números vêm das regras de preço. */
const REFERENCE_PLAN = planQuote(["zara-blazer", "zara-slip", "ca-camisa", "renner-vestido"].map(getPiece));

const PERKS = [
  `${PLAN_SIZE} peças novas todo mês, e você devolve quando enjoar`,
  "Frete grátis na ida e na volta",
  "Gostou? Compre por 70% do valor, descontando o que já pagou de aluguel",
  "Marcas que você já conhece: C&A, Renner, Zara e mais",
] as const;

function Perks() {
  return (
    <ul className="grid gap-3">
      {PERKS.map((perk) => (
        <li key={perk} className="flex gap-3">
          <span aria-hidden="true" className="mt-1 text-lg leading-none">
            ✦
          </span>
          <span className="text-base font-medium lg:text-lg">{perk}</span>
        </li>
      ))}
    </ul>
  );
}

function PriceHook({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Plano de {PLAN_SIZE} peças</p>
      <p className="mt-1 whitespace-nowrap font-display text-[clamp(2rem,3.6vw,3.5rem)] font-extrabold leading-none tracking-[-0.03em]">
        {formatMoney(REFERENCE_PLAN.monthly)}
        <span className="text-[0.4em] font-bold tracking-normal"> /mês</span>
      </p>
      <p className="mt-2 text-ink-soft">
        em vez de <span className="line-through">{formatMoney(REFERENCE_PLAN.full)}</span> alugando peça por peça
      </p>
    </div>
  );
}

function ScrollSection() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // O giro só roda enquanto a cena está visível, para não gastar bateria com ela fora da tela.
  const visible = useInView(stage);

  return (
    <section ref={section} aria-labelledby="manequins-titulo" className="relative h-[300dvh]">
      <div className="sticky top-[6.75rem] flex h-[calc(100dvh-6.75rem)] flex-col overflow-hidden px-5 md:px-8">
        <div className="mx-auto w-full max-w-[82rem] pt-8">
          <h2 id="manequins-titulo" className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Um look, várias peças.
          </h2>
          <p className="sr-only">Dois manequins giram e trocam de lugar e de roupa conforme você rola a página.</p>
        </div>

        <div className="mx-auto grid min-h-0 w-full max-w-[82rem] flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2.3fr)_minmax(0,0.85fr)] lg:grid-rows-1 lg:items-center lg:gap-6">
          <PriceHook className="hidden lg:block" />

          <div ref={stage} aria-hidden="true" className="relative min-h-0 lg:h-full">
            <ManequimStage progress={scrollYProgress} spinning={visible} />
          </div>

          <div className="hidden lg:block">
            <Perks />
            <div className="mt-6">
              <ButtonLink href="/assinatura" size="lg" iconAfter="arrow-right">
                Montar meu plano
              </ButtonLink>
            </div>
          </div>

          {/* Celular e tablet: o gancho vira uma faixa curta embaixo da cena */}
          <div className="flex items-center justify-between gap-4 pb-4 lg:hidden">
            <p className="font-display text-2xl font-extrabold leading-tight">
              {formatMoney(REFERENCE_PLAN.monthly)}
              <span className="block text-sm font-bold text-ink-soft">/mês, {PLAN_SIZE} peças, frete grátis</span>
            </p>
            <ButtonLink href="/assinatura" iconAfter="arrow-right">
              Montar plano
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Cena 3D com os manequins; sem WebGL, em aparelho fraco ou com movimento reduzido, mostra os looks em 2D. */
export function ManequimShowcase() {
  const canRender3D = useCanRender3D();
  // Cada versão fica no seu contêiner: a troca depois da hidratação remonta um bloco só.
  return canRender3D ? (
    <div key="3d">
      <ScrollSection />
    </div>
  ) : (
    <div key="2d">
      <LookShowcase />
    </div>
  );
}
