"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Revela o conteúdo ao entrar na tela. Só esconde o que está abaixo da dobra depois de montar no navegador,
 * então o HTML inicial e quem tem movimento reduzido sempre veem tudo. Confere a posição na rolagem em vez
 * de depender do IntersectionObserver, que não avisa quando um elemento é pulado por uma rolagem rápida.
 */
export function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("reveal-pending");
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.remove("reveal-pending");
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [reduced]);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;
  return (
    <div ref={ref} style={style} className={`reveal ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
