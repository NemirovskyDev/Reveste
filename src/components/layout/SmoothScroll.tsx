"use client";

import { useEffect } from "react";

/**
 * Rolagem suave (Lenis) ligada ao ScrollTrigger do GSAP: o Lenis avisa o ScrollTrigger a cada passo
 * e o relógio do GSAP move o Lenis, para as animações presas à rolagem ficarem em sincronia.
 * Quem pediu movimento reduzido fica com a rolagem nativa.
 *
 * As bibliotecas entram por import dinâmico: não pesam no JavaScript inicial de nenhuma página.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("lenis"), import("@/lib/gsap")]).then(([{ default: Lenis }, { getGsap }]) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger } = getGsap();
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
      const onScroll = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);

      lenis.on("scroll", onScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.off("scroll", onScroll);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
