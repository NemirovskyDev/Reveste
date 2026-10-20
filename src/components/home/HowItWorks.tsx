"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { GarmentArt } from "@/components/garments/GarmentArt";
import { Icon } from "@/components/ui/Icon";
import { findPiece } from "@/data/catalog";
import { getGsap } from "@/lib/gsap";

const PICKS = ["zara-blazer", "renner-vestido", "ca-camisa", "farm-saia"].map((id) => findPiece(id)!);

function ChooseVisual() {
  return (
    <div className="grid grid-cols-4 gap-2" aria-hidden="true">
      {PICKS.map((piece) => (
        <div key={piece.id} className="rounded-control border-2 border-ink bg-white p-1.5">
          <GarmentArt type={piece.type} color={piece.color} className="w-full" />
        </div>
      ))}
    </div>
  );
}

function DeliverVisual() {
  return (
    <div className="grid place-items-center gap-3" aria-hidden="true">
      <div className="grid size-28 place-items-center rounded-full border-2 border-ink bg-blush">
        <Icon name="truck" size={56} />
      </div>
      <div className="h-0 w-full border-t-2 border-dashed border-ink" />
    </div>
  );
}

/** Calendário de 30 dias com os marcos de 7, 14 e 30: mostra os prazos sem texto extra. */
function UseVisual() {
  return (
    <div className="grid grid-cols-10 gap-1.5" aria-hidden="true">
      {Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        const tone = day <= 7 ? "bg-mint" : day <= 14 ? "bg-lavender" : "bg-peach";
        return <span key={day} className={`aspect-square rounded-md border-2 border-ink ${tone}`} />;
      })}
    </div>
  );
}

function ReturnVisual() {
  return (
    <div className="grid place-items-center" aria-hidden="true">
      <div className="grid size-28 place-items-center rounded-full border-2 border-ink bg-mint">
        <Icon name="refresh" size={56} />
      </div>
    </div>
  );
}

const STEPS: ReadonlyArray<{ title: string; text: string; visual: ReactNode }> = [
  {
    title: "Escolha 4 peças",
    text: "Navegue pelo catálogo, de marcas acessíveis às premium, e monte o seu plano.",
    visual: <ChooseVisual />,
  },
  {
    title: "Receba em casa",
    text: "As peças chegam higienizadas e prontas para usar. O frete do plano é grátis.",
    visual: <DeliverVisual />,
  },
  {
    title: "Use por até 30 dias",
    text: "Repita o look ou troque de ideia. Gostou muito de uma peça? Dá para ficar com ela.",
    visual: <UseVisual />,
  },
  {
    title: "Devolva e renove",
    text: "No mês seguinte você escolhe outras 4 peças e a roda continua girando.",
    visual: <ReturnVisual />,
  },
];

export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
    const matchMedia = gsap.matchMedia();

    // Só no desktop e sem "reduzir movimento": a seção fica presa e os passos correm na horizontal.
    // No celular e para quem pediu menos movimento, os passos ficam empilhados e a rolagem é normal.
    matchMedia.add("(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
      const root = section.current;
      const el = track.current;
      if (!root || !el) return;
      const distance = () => Math.max(0, el.scrollWidth - root.clientWidth);
      const trigger = {
        trigger: root,
        start: "top top+=108",
        end: () => `+=${distance()}`,
        invalidateOnRefresh: true,
      };
      gsap.to(el, { x: () => -distance(), ease: "none", scrollTrigger: { ...trigger, pin: true, scrub: 0.6, anticipatePin: 1 } });
      gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { ...trigger, scrub: true } });
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <section
      ref={section}
      id="como-funciona"
      aria-labelledby="como-titulo"
      className="scroll-mt-28 overflow-x-clip py-20 pin:flex pin:h-[calc(100dvh-6.75rem)] pin:flex-col pin:justify-center pin:py-0"
    >
      <div className="mx-auto w-full max-w-[82rem] px-5 md:px-8">
        <h2 id="como-titulo" className="max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Uma assinatura, quatro peças, a troca todo mês.
        </h2>
        <div aria-hidden="true" className="mt-8 hidden h-1 w-full rounded-full bg-line pin:block">
          <div ref={bar} className="h-full origin-left scale-x-0 rounded-full bg-ink" />
        </div>
      </div>

      <ol
        ref={track}
        className="mx-auto mt-10 grid w-full max-w-[82rem] gap-6 px-5 md:grid-cols-2 md:px-8 pin:mx-0 pin:mt-12 pin:flex pin:w-max pin:max-w-none pin:gap-8 pin:pl-[max(2rem,calc((100vw-82rem)/2+2rem))] pin:pr-16"
      >
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid content-start gap-6 rounded-card border-2 border-ink bg-cream p-6 pin:w-[30rem] pin:shrink-0 pin:p-8"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full border-2 border-ink bg-mint font-display text-xl font-extrabold"
              >
                {index + 1}
              </span>
              <h3 className="font-display text-2xl font-extrabold leading-tight">{step.title}</h3>
            </div>
            <div className="min-h-32 content-center">{step.visual}</div>
            <p className="max-w-sm text-ink-soft">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
