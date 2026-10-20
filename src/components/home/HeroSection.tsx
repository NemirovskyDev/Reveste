"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { HeroRack } from "@/components/home/HeroRack";
import { ButtonLink } from "@/components/ui/Button";
import type { RackItem } from "@/components/three/types";
import { getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { PLAN_SIZE, planQuote } from "@/lib/pricing";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const RACK_IDS = ["zara-blazer", "renner-vestido", "ca-camisa", "mango-trench", "riachuelo-calca", "farm-saia", "ca-jaqueta", "zara-slip"];

const RACK_ITEMS: readonly RackItem[] = RACK_IDS.map((id) => {
  const piece = getPiece(id);
  return { type: piece.type, color: piece.color };
});

const REFERENCE_PLAN = planQuote(["zara-blazer", "zara-slip", "ca-camisa", "renner-vestido"].map(getPiece));

const RISE = 48;

/**
 * Opacidade e deslocamento de uma legenda. As faixas de rolagem precisam ficar entre 0 e 1 e em ordem
 * crescente (exigência da API de animação do navegador); por isso a primeira legenda já nasce visível
 * e a última não some.
 */
function useCaption(
  progress: MotionValue<number>,
  { enter, leave }: { enter?: readonly [number, number]; leave?: readonly [number, number] },
) {
  const points = [...(enter ?? [0]), ...(leave ?? [1])];
  const opacities = [...(enter ? [0, 1] : [1]), ...(leave ? [1, 0] : [1])];
  const offsets = [...(enter ? [RISE, 0] : [0]), ...(leave ? [0, -RISE] : [0])];
  const opacity = useTransform(progress, points, opacities);
  const y = useTransform(progress, points, offsets);
  return { opacity, y };
}

const HEADLINE = "A roupa que sobrou vira a roupa do seu mês.";
const LEAD =
  "Aluguel de roupas por assinatura com peças que sobraram de marcas como C&A, Renner e Zara. Você escolhe 4 por mês, usa e devolve. Nada vai para o lixo.";

function StaticHero() {
  return (
    <section aria-labelledby="titulo-hero" className="mx-auto grid w-full max-w-[82rem] items-center gap-10 px-5 py-12 md:px-8 lg:grid-cols-2 lg:py-20">
      <div>
        <h1 id="titulo-hero" className="text-[clamp(2.5rem,6.4vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
          {HEADLINE}
        </h1>
        <p className="mt-6 max-w-xl text-xl text-ink-soft">{LEAD}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/assinatura" size="lg" iconAfter="arrow-right">
            Monte seus 4 looks
          </ButtonLink>
          <ButtonLink href="#como-funciona" size="lg" variant="secondary">
            Veja como funciona
          </ButtonLink>
        </div>
      </div>
      <HeroRack progress={{ get: () => 0.15, on: () => () => {} }} items={RACK_ITEMS} className="aspect-square w-full max-w-xl justify-self-center" />
    </section>
  );
}

function ScrollHero() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  // Qual legenda está em cena: só ela recebe foco e clique.
  useMotionValueEvent(scrollYProgress, "change", (value) => setActive(value < 0.3 ? 0 : value < 0.62 ? 1 : 2));

  const first = useCaption(scrollYProgress, { leave: [0.22, 0.3] });
  const second = useCaption(scrollYProgress, { enter: [0.3, 0.38], leave: [0.54, 0.62] });
  const third = useCaption(scrollYProgress, { enter: [0.62, 0.7] });
  const disc = useTransform(scrollYProgress, [0, 0.5, 1], ["#f4c9d1", "#d9ccf0", "#cfe8dc"]);
  const discScale = useTransform(scrollYProgress, [0, 1], [0.86, 1.08]);
  const cue = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section ref={section} aria-labelledby="titulo-hero" className="relative h-[330dvh]">
      <div className="sticky top-[6.75rem] h-[calc(100dvh-6.75rem)] overflow-hidden">
        <div className="mx-auto grid size-full max-w-[82rem] grid-rows-[minmax(0,38fr)_minmax(0,62fr)] px-5 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:grid-rows-1">
          {/* Arara: no celular fica no alto; no desktop, à direita */}
          <div className="relative order-1 min-h-0 lg:order-2">
            <motion.div
              aria-hidden="true"
              style={{ backgroundColor: disc, scale: discScale }}
              className="absolute left-1/2 top-1/2 aspect-square w-[min(94%,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
            <HeroRack progress={scrollYProgress} items={RACK_ITEMS} className="absolute inset-0" />
          </div>

          {/* Legendas empilhadas; cada uma entra e sai conforme a rolagem */}
          <div className="relative z-10 order-2 min-h-0 lg:order-1">
            {/* Todo o texto fica na árvore de acessibilidade (a opacidade não esconde de leitor de tela),
                então o h1, o preço e as mensagens são lidos em ordem. Só os links ficam `inert` quando a legenda
                não está em cena, para o foco do teclado não cair em algo invisível. */}
            <motion.div
              style={{ opacity: first.opacity, y: first.y }}
              className="absolute inset-0 grid content-center gap-4 lg:gap-5 lg:pr-10"
            >
              <h1 id="titulo-hero" className="text-[clamp(2rem,5.6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
                {HEADLINE}
              </h1>
              <p className="max-w-xl text-base text-ink-soft lg:text-xl">{LEAD}</p>
              <div inert={active !== 0} className="flex flex-wrap gap-3">
                <ButtonLink href="/assinatura" size="lg" iconAfter="arrow-right">
                  Monte seus 4 looks
                </ButtonLink>
                <ButtonLink href="#como-funciona" size="lg" variant="secondary">
                  Veja como funciona
                </ButtonLink>
              </div>
            </motion.div>

            <motion.p
              style={{ opacity: second.opacity, y: second.y }}
              className="absolute inset-0 grid content-center font-display text-[clamp(1.75rem,4.4vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] lg:pr-10"
            >
              Marcas como C&amp;A, Renner e Zara cedem o estoque que não vendeu.
            </motion.p>

            <motion.div
              style={{ opacity: third.opacity, y: third.y }}
              className="absolute inset-0 grid content-center gap-4 lg:gap-5 lg:pr-10"
            >
              <p className="font-display text-[clamp(1.75rem,4.4vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
                Você escolhe {PLAN_SIZE} peças por mês. Usa e devolve.
              </p>
              <p className="max-w-lg text-base text-ink-soft lg:text-lg">
                Um plano de {PLAN_SIZE} peças, como o do exemplo, sai por{" "}
                <strong className="text-ink">{formatMoney(REFERENCE_PLAN.monthly)} ao mês</strong>, com frete grátis.
              </p>
              <div inert={active !== 2}>
                <ButtonLink href="/assinatura" size="lg" iconAfter="arrow-right">
                  Montar meu plano
                </ButtonLink>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          style={{ opacity: cue }}
          className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-sm font-medium text-ink-soft md:block"
        >
          Role para a arara girar
        </motion.div>
      </div>
    </section>
  );
}

// O hero preso à rolagem precisa de altura para o texto: em telas baixas (celular pequeno, notebook com
// zoom alto) o conteúdo seria cortado sem como rolar, então elas ficam com a versão estática.
const SHORT_VIEWPORT = "(max-height: 640px), (min-width: 1024px) and (max-height: 700px)";

export function HeroSection() {
  const reduced = usePrefersReducedMotion();
  const short = useMediaQuery(SHORT_VIEWPORT);
  return reduced || short ? <StaticHero /> : <ScrollHero />;
}
