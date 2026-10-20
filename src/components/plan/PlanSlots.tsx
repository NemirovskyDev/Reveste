import { PieceImage } from "@/components/piece/PieceImage";
import type { Piece } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { PLAN_SIZE } from "@/lib/pricing";

/** Cabide em traço, igual ao do logo: gancho em cima e ombros inclinados. */
function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M24 12V9.5a4 4 0 1 0-4-4" />
      <path d="M24 12 4 24.5a2 2 0 0 0 1 3.5h38a2 2 0 0 0 1-3.5L24 12Z" />
    </svg>
  );
}

/**
 * A capacidade do plano como uma arara de 4 cabides: cada peça escolhida ocupa um cabide (com um "estalo" ao entrar) e
 * os vazios ficam tracejados. É só um resumo visual: a lista logo abaixo traz as mesmas informações em texto, então
 * este bloco fica escondido de leitores de tela.
 */
export function PlanSlots({ pieces }: { pieces: readonly Piece[] }) {
  const full = pieces.length === PLAN_SIZE;
  return (
    <div aria-hidden="true" className="mb-5">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: PLAN_SIZE }, (_, index) => {
          const piece = pieces[index];
          return (
            <div key={piece ? piece.id : `vazio-${index}`} className="grid justify-items-center gap-1">
              <Hanger className={cn("h-6 w-9 transition-colors duration-300", piece ? "text-ink" : "text-ink/30")} />
              {piece ? (
                <div className="check-pop w-full overflow-hidden rounded-control border-2 border-ink bg-white">
                  <PieceImage piece={piece} className="aspect-[4/5] w-full !rounded-none" />
                </div>
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center rounded-control border-2 border-dashed border-ink/25 text-lg font-bold text-ink/30">
                  {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out-expo", full ? "bg-mint" : "bg-ink")}
          style={{ width: `${(pieces.length / PLAN_SIZE) * 100}%` }}
        />
      </div>
    </div>
  );
}
