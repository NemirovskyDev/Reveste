"use client";

import Link from "next/link";
import { PieceImage } from "@/components/piece/PieceImage";
import { QuickAddButton } from "@/components/piece/QuickAddButton";
import { getPiece } from "@/data/catalog";
import { pieceBrandName } from "@/lib/piece";
import { lookPieceIds, type Look } from "./looks";

/**
 * As peças que as pessoas estão vestindo neste look, como chips clicáveis: cada um leva para a página da peça e
 * tem um botão para adicioná-la ao plano. É o jeito acessível (teclado, leitor de tela, celular) de comprar o que
 * se vê nas fotos.
 */
export function LookChips({ look }: { look: Look }) {
  const pieces = lookPieceIds(look).map((id) => getPiece(id));
  const labelId = `look-pecas-${look.id}`;
  return (
    <div className="pt-2">
      <p id={labelId} className="mb-2 text-sm font-bold text-ink-soft">
        Peças do {look.title.toLowerCase()}
      </p>
      <ul aria-labelledby={labelId} className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {pieces.map((piece) => (
          <li key={piece.id} className="flex shrink-0 snap-start items-center gap-1 rounded-full border-2 border-ink bg-canvas/90 p-1 transition duration-300 ease-out-expo hover:bg-lavender/40 fx:scale-[1.03]">
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
