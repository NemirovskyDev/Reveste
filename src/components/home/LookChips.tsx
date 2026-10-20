"use client";

import Link from "next/link";
import { PieceImage } from "@/components/piece/PieceImage";
import { QuickAddButton } from "@/components/piece/QuickAddButton";
import { LOOK_PIECE_IDS } from "@/components/three/cast";
import { getPiece } from "@/data/catalog";
import { pieceBrandName } from "@/lib/piece";

/**
 * As peças que os manequins estão vestindo neste look, como chips clicáveis: cada um leva para a página da peça e
 * tem um botão para adicioná-la ao plano. É o jeito acessível (teclado, leitor de tela, celular) de comprar o que
 * se vê na cena 3D, que é só ilustração e se move sozinha.
 */
export function LookChips({ look }: { look: 0 | 1 }) {
  const pieces = LOOK_PIECE_IDS[look].map((id) => getPiece(id));
  return (
    <div className="pt-2">
      <p id="look-pecas" className="mb-2 text-sm font-bold text-ink-soft">
        {look === 0 ? "Peças do primeiro look" : "Peças do segundo look"}
      </p>
      <ul aria-labelledby="look-pecas" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {pieces.map((piece) => (
          <li key={piece.id} className="flex shrink-0 snap-start items-center gap-1 rounded-full border-2 border-ink bg-canvas/90 p-1">
            <Link href={`/peca/${piece.id}`} className="flex items-center gap-2 rounded-full pr-2 outline-offset-2">
              <span className="block h-11 w-9 shrink-0 overflow-hidden rounded-full bg-white">
                <PieceImage piece={piece} className="h-full w-full !rounded-none" />
              </span>
              <span className="grid text-left leading-tight">
                <span className="text-xs font-bold">{pieceBrandName(piece)}</span>
                <span className="text-sm">{piece.name}</span>
              </span>
            </Link>
            <QuickAddButton piece={piece} variant="chip" />
          </li>
        ))}
      </ul>
    </div>
  );
}
