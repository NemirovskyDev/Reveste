"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Detalhes ligados à rolagem da página: uma linha lavanda que se desenha na borda esquerda
 * e um brilho que acompanha a posição. Decorativo (aria-hidden) e desligado com movimento reduzido.
 */
export function ScrollAccents() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const glowTop = useTransform(smooth, [0, 1], ["8%", "78%"]);

  if (reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ top: glowTop }}
        className="absolute -right-40 h-[28rem] w-[28rem] rounded-full bg-lavender opacity-60 blur-3xl"
      />
      <motion.div style={{ scaleY: smooth }} className="absolute inset-y-0 left-0 w-[3px] origin-top bg-ink/70 max-sm:w-[2px]" />
    </div>
  );
}
