"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { PieceImage } from "@/components/piece/PieceImage";
import { getPiece } from "@/data/catalog";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const LOOKS = [
  { title: "Reunião de manhã", ids: ["zara-blazer", "ca-camisa", "farm-saia"] },
  { title: "Jantar com amigas", ids: ["renner-vestido", "zara-slip", "mango-trench"] },
  { title: "Fim de semana", ids: ["ca-jaqueta", "riachuelo-calca", "farm-vestido"] },
].map((look) => ({ title: look.title, pieces: look.ids.map(getPiece) }));

function Look({ look, active, className }: { look: (typeof LOOKS)[number]; active: boolean; className?: string }) {
  return (
    <div
      aria-hidden={active ? undefined : true}
      className={`absolute inset-0 grid content-center gap-6 transition-opacity duration-700 ease-out-expo ${active ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
    >
      <p className="font-display text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold leading-tight tracking-[-0.03em]">{look.title}</p>
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {look.pieces.map((piece) => (
          <div key={piece.id} className="rounded-card border-2 border-ink bg-cream p-2 md:p-4">
            <PieceImage piece={piece} className="aspect-[4/5] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LookShowcase() {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(LOOKS.length - 1, Math.floor(value * LOOKS.length));
    setActive((current) => (current === next ? current : next));
  });

  if (reduced) {
    return (
      <section aria-labelledby="looks-titulo" className="mx-auto w-full max-w-[82rem] px-5 py-20 md:px-8 md:py-28">
        <h2 id="looks-titulo" className="mb-10 max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Um look, várias peças.
        </h2>
        <div className="grid gap-12">
          {LOOKS.map((look) => (
            <div key={look.title} className="grid gap-4">
              <p className="font-display text-2xl font-extrabold">{look.title}</p>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {look.pieces.map((piece) => (
                  <div key={piece.id} className="rounded-card border-2 border-ink bg-cream p-2 md:p-4">
                    <PieceImage piece={piece} className="aspect-[4/5] w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={section}
      aria-labelledby="looks-titulo"
      className="relative h-[290dvh]"
    >
      <div className="sticky top-[6.75rem] flex h-[calc(100dvh-6.75rem)] flex-col justify-center overflow-hidden px-5 md:px-8">
        <div className="mx-auto w-full max-w-[82rem]">
          <h2 id="looks-titulo" className="mb-8 text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Um look, várias peças.
          </h2>
          <div className="relative h-[min(52dvh,30rem)]">
            {LOOKS.map((look, index) => (
              <Look key={look.title} look={look} active={index === active} />
            ))}
          </div>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            {LOOKS.map((look, index) => (
              <span
                key={look.title}
                className={`h-2 rounded-full border-2 border-ink transition-all duration-500 ${index === active ? "w-10 bg-ink" : "w-4 bg-transparent"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
