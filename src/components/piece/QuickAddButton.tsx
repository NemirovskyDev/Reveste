"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Piece, Size } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { pieceTitle } from "@/lib/piece";
import { PLAN_SIZE } from "@/lib/pricing";
import { usePlan } from "@/store/plan";

/** Tamanho do meio da grade da peça; quem quiser outro ajusta na montagem do plano. */
function defaultSize(piece: Pick<Piece, "sizes">): Size {
  return piece.sizes[Math.floor((piece.sizes.length - 1) / 2)] as Size;
}

type Props = {
  piece: Pick<Piece, "id" | "name" | "brandId" | "sizes">;
  /** `card`: botão com texto no canto do card. `chip`: só o ícone, para chips pequenos. */
  variant?: "card" | "chip";
  className?: string;
};

/**
 * Adiciona a peça ao plano de 4 peças com um toque. Fica sempre visível (no celular não existe "passar o mouse"),
 * mostra o estado (no plano, plano cheio) e avisa o resultado para leitores de tela.
 */
export function QuickAddButton({ piece, variant = "card", className }: Props) {
  const slots = usePlan((state) => state.slots);
  const toggle = usePlan((state) => state.toggle);
  const [announcement, setAnnouncement] = useState("");

  const inPlan = slots.some((slot) => slot.pieceId === piece.id);
  const full = !inPlan && slots.length >= PLAN_SIZE;
  const title = pieceTitle(piece);
  const size = defaultSize(piece);

  function onClick() {
    const ok = toggle(piece.id, size);
    if (!ok) {
      setAnnouncement("Seu plano já tem 4 peças. Tire uma para trocar.");
      return;
    }
    setAnnouncement(
      inPlan
        ? `${title} saiu do plano.`
        : `${title} entrou no plano, tamanho ${size}. ${slots.length + 1} de ${PLAN_SIZE} peças. Ajuste o tamanho em Montar plano.`,
    );
  }

  const label = inPlan ? `Tirar ${title} do plano` : full ? "Plano cheio" : `Adicionar ${title} ao plano`;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={inPlan}
        aria-disabled={full}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink font-bold transition duration-300 ease-out-expo",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
          inPlan ? "bg-mint" : "bg-canvas hover:-translate-y-0.5 hover:shadow-lift",
          variant === "card" ? "min-h-11 px-4 text-sm" : "size-10",
          className,
        )}
        // No estado "plano cheio" o clique só avisa; por isso é aria-disabled e não disabled (o foco do teclado fica).
      >
        <Icon name={inPlan ? "check" : "plus"} size={18} />
        {variant === "card" && <span aria-hidden="true">{inPlan ? "No plano" : full ? "Plano cheio" : "Plano"}</span>}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
