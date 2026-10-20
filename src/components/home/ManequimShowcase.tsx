"use client";

import { useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { LookShowcase } from "@/components/home/LookShowcase";
import { useCanRender3D } from "@/components/three/capabilities";

// Three.js só é baixado no navegador e fora do JavaScript inicial da página.
const ManequimStage = dynamic(() => import("@/components/three/ManequimStage").then((module) => module.ManequimStage), {
  ssr: false,
  loading: () => null,
});

function ScrollSection() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  return (
    <section ref={section} aria-labelledby="manequins-titulo" className="relative h-[300dvh]">
      <div className="sticky top-[6.75rem] flex h-[calc(100dvh-6.75rem)] flex-col overflow-hidden px-5 md:px-8">
        <div className="mx-auto w-full max-w-[82rem] pt-8">
          <h2 id="manequins-titulo" className="text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Um look, várias peças.
          </h2>
          <p className="sr-only">Dois manequins trocam de lugar e de roupa conforme você rola a página.</p>
        </div>
        <div aria-hidden="true" className="relative mx-auto min-h-0 w-full max-w-[82rem] flex-1">
          <ManequimStage progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

/** Cena 3D com os manequins; sem WebGL, em aparelho fraco ou com movimento reduzido, mostra os looks em 2D. */
export function ManequimShowcase() {
  const canRender3D = useCanRender3D();
  return canRender3D ? <ScrollSection /> : <LookShowcase />;
}
