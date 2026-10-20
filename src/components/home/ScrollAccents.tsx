"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Detalhes ligados à rolagem da página: uma linha que se desenha na borda esquerda e um brilho lavanda que
 * acompanha a posição. Decorativo (aria-hidden) e desligado com movimento reduzido.
 *
 * Só animam `transform` (que roda na GPU, sem recalcular layout) e o brilho é um gradiente radial, não um
 * `blur` (filtro caro de redesenhar a cada quadro, o que travava a rolagem em celulares).
 */
export function ScrollAccents() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const glowY = useTransform(smooth, [0, 1], ["8vh", "78vh"]);

  if (reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: glowY }}
        className="absolute -right-40 top-0 size-[32rem] rounded-full [background:radial-gradient(closest-side,rgb(217_204_240/0.75),rgb(217_204_240/0))] will-change-transform"
      />
      <motion.div style={{ scaleY: smooth }} className="absolute inset-y-0 left-0 w-[3px] origin-top bg-ink/70 will-change-transform max-sm:w-[2px]" />
    </div>
  );
}
