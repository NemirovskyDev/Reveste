"use client";

import { useEffect } from "react";
import { useMotionOff } from "@/lib/motion";

/** Espaço do header fixo (6,75rem + folga), para o destino não ficar escondido embaixo dele. */
const SCROLL_OFFSET = 112;

/**
 * Rolagem suave (Lenis) ligada ao ScrollTrigger do GSAP: o Lenis avisa o ScrollTrigger a cada passo
 * e o relógio do GSAP move o Lenis, para as animações presas à rolagem ficarem em sincronia.
 * Quem pediu movimento reduzido fica com a rolagem nativa.
 *
 * As bibliotecas entram por import dinâmico: não pesam no JavaScript inicial de nenhuma página.
 */
export function SmoothScroll() {
  const motionOff = useMotionOff();
  useEffect(() => {
    if (motionOff) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("lenis"), import("@/lib/gsap")]).then(([{ default: Lenis }, { getGsap }]) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger } = getGsap();
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
      const onScroll = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);

      // Links para um trecho da página em que já estamos (nav "Como funciona", botões do hero): o Next
      // pularia direto; aqui a rolagem desliza até lá. Em captura, para o Link do Next ver `defaultPrevented`.
      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element | null)?.closest("a");
        if (!link || link.target === "_blank") return;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || !url.hash) return;
        const strip = (path: string) => path.replace(/\/$/, "");
        if (strip(url.pathname) !== strip(window.location.pathname)) return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -SCROLL_OFFSET, duration: 1.2 });
        window.history.pushState(null, "", url.hash);
      };
      document.addEventListener("click", onClick, true);

      lenis.on("scroll", onScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        document.removeEventListener("click", onClick, true);
        gsap.ticker.remove(tick);
        lenis.off("scroll", onScroll);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [motionOff]);

  return null;
}
