"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { LookChips } from "@/components/home/LookChips";
import { LOOKS, type Look } from "@/components/home/looks";
import { ButtonLink } from "@/components/ui/Button";
import { getPiece } from "@/data/catalog";
import { assetUrl } from "@/lib/assets";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { PLAN_SIZE, planQuote } from "@/lib/pricing";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/** Mesmo plano de exemplo do hero e da seção de plano: os números vêm das regras de preço. */
const REFERENCE_PLAN = planQuote(["zara-blazer", "zara-slip", "ca-camisa", "renner-vestido"].map(getPiece));

const AI_NOTE = "Imagens geradas por inteligência artificial, só para ilustrar os looks.";

function Photo({ person, className }: { person: Look["people"][number]; className?: string }) {
  return (
    // `next/image` não otimiza em exportação estática; o WebP já sai pronto no tamanho certo.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl(person.src)}
      alt={person.alt}
      width={720}
      height={894}
      loading="lazy"
      decoding="async"
      className={cn("aspect-[4/5] rounded-card border-2 border-ink bg-white object-cover", className)}
    />
  );
}

function PlanStrip() {
  return (
    <div className="flex items-center justify-between gap-4 pb-4 pt-1">
      <p className="font-display text-xl font-extrabold leading-tight md:text-2xl">
        {formatMoney(REFERENCE_PLAN.monthly)}
        <span className="block text-sm font-bold text-ink-soft">/mês, {PLAN_SIZE} peças, frete grátis</span>
      </p>
      <ButtonLink href="/assinatura" iconAfter="arrow-right">
        Montar meu plano
      </ButtonLink>
    </div>
  );
}

/** Sem rolagem presa: os looks empilhados, com tudo visível (animações desligadas). */
function StaticLooks() {
  return (
    <section aria-labelledby="looks-titulo" className="mx-auto w-full max-w-[82rem] px-5 py-20 md:px-8 md:py-28">
      <h2 id="looks-titulo" className="mb-10 max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        Um look, várias peças.
      </h2>
      <div className="grid gap-14">
        {LOOKS.map((look) => (
          <div key={look.id} className="grid gap-4">
            <h3 className="font-display text-2xl font-extrabold">{look.title}</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {look.people.map((person) => (
                <Photo key={person.id} person={person} className="w-full" />
              ))}
            </div>
            <LookChips look={look} />
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft">{AI_NOTE}</p>
      <div className="mt-6">
        <PlanStrip />
      </div>
    </section>
  );
}

/** Os looks trocam por fusão enquanto a página rola; a seção fica fixa na tela durante a troca. */
function ScrollLooks() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(LOOKS.length - 1, Math.floor(value * LOOKS.length));
    setActive((current) => (current === next ? current : next));
  });

  return (
    <section ref={section} aria-labelledby="looks-titulo" className="relative h-[240dvh]">
      <div className="sticky top-[6.75rem] flex h-[calc(100dvh-6.75rem)] flex-col overflow-hidden px-5 md:px-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[82rem] flex-1 flex-col">
          <h2 id="looks-titulo" className="pt-6 text-[clamp(1.75rem,4.2vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Um look, várias peças.
          </h2>

          {/* Contêiner de tamanho: as fotos medem a altura livre (celular, com rolagem lateral) ou 1/4 da largura (telas largas), o que for menor. */}
          <div className="relative my-3 min-h-0 flex-1 [container-type:size]">
            {LOOKS.map((look, index) => (
              <div
                key={look.id}
                inert={index !== active}
                aria-hidden={index !== active ? true : undefined}
                className={cn(
                  "absolute inset-0 flex snap-x snap-mandatory gap-3 overflow-x-auto transition-opacity duration-700 ease-out-expo lg:justify-center lg:gap-5 lg:overflow-visible",
                  index === active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {look.people.map((person) => (
                  <Photo key={person.id} person={person} className="w-[calc(100cqh*0.8)] shrink-0 snap-center lg:w-[min(calc((100cqw-3.75rem)/4),calc(100cqh*0.8))]" />
                ))}
              </div>
            ))}
          </div>

          <div className="relative">
            {LOOKS.map((look, index) => (
              <div key={look.id} inert={index !== active} aria-hidden={index !== active ? true : undefined} className={cn(index === active ? "" : "hidden")}>
                <LookChips look={look} />
              </div>
            ))}
            <p className="pb-1 text-xs text-ink-soft">{AI_NOTE}</p>
          </div>
          <PlanStrip />
        </div>
      </div>
    </section>
  );
}

/** Pessoas vestindo as peças do catálogo; sem animação (preferência do sistema ou do site) os looks aparecem empilhados. */
export function RealLooks() {
  const reduced = usePrefersReducedMotion();
  // Cada versão fica no seu contêiner: a troca depois da hidratação remonta um bloco só.
  return reduced ? (
    <div key="static">
      <StaticLooks />
    </div>
  ) : (
    <div key="scroll">
      <ScrollLooks />
    </div>
  );
}
