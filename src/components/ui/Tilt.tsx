"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

const MAX_DEG = 6;

/**
 * Inclina o filho em 3D seguindo o ponteiro. Só reage a mouse e caneta (toque rola a página, não inclina),
 * e o CSS desliga o efeito com movimento reduzido. A inclinação é escrita em variáveis CSS, sem re-render.
 */
export function Tilt({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType === "touch") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-y * MAX_DEG * 2).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * MAX_DEG * 2).toFixed(2)}deg`);
  };

  const reset = () => {
    ref.current?.style.removeProperty("--tilt-x");
    ref.current?.style.removeProperty("--tilt-y");
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`tilt ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
