"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PieceCard } from "@/components/piece/PieceCard";
import { Icon } from "@/components/ui/Icon";
import type { Piece } from "@/data/catalog";
import { readMotionOff } from "@/lib/motion";

/** Carrossel com rolagem nativa e encaixe; os botões só ajudam quem não usa o gesto de arrastar. */
export function FeaturedCarousel({ pieces, label }: { pieces: readonly Piece[]; label: string }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  function move(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    if (direction === 1 ? edge.end : edge.start) return; // botão no limite: só avisa pelo aria-disabled
    const reduced = readMotionOff();
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
  }

  const arrow =
    "grid size-12 place-items-center rounded-full border-2 border-ink bg-canvas transition duration-300 ease-out-expo " +
    "hover:-translate-y-0.5 hover:shadow-lift aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        {/* aria-disabled em vez de disabled: o botão no limite mantém o foco do teclado. */}
        <button type="button" className={arrow} onClick={() => move(-1)} aria-disabled={edge.start} aria-label="Peças anteriores">
          <Icon name="arrow-left" />
        </button>
        <button type="button" className={arrow} onClick={() => move(1)} aria-disabled={edge.end} aria-label="Próximas peças">
          <Icon name="arrow-right" />
        </button>
      </div>
      <ul
        ref={scroller}
        onScroll={measure}
        tabIndex={0}
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 pt-2 [scrollbar-width:thin] md:-mx-8 md:px-8"
      >
        {pieces.map((piece) => (
          <li key={piece.id} className="w-[min(16rem,72vw)] shrink-0 snap-start">
            <PieceCard piece={piece} />
          </li>
        ))}
      </ul>
    </div>
  );
}
