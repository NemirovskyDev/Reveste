import Link from "next/link";
import { GarmentArt } from "@/components/garments/GarmentArt";
import { LabelTag } from "@/components/ui/LabelTag";
import { TIER_LABEL, type Piece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { pieceBrandName } from "@/lib/piece";
import { rentalCents } from "@/lib/pricing";

/** Card de peça: a ilustração pendurada na etiqueta, com marca, nome e preço do aluguel de 7 dias. */
export function PieceCard({ piece, priority = false }: { piece: Piece; priority?: boolean }) {
  return (
    <article className="group relative">
      <Link href={`/peca/${piece.id}`} className="block rounded-card pt-4 outline-offset-4">
        <LabelTag
          tier={piece.tier}
          className="transition duration-500 ease-out-expo group-hover:-translate-y-1.5 group-hover:shadow-lift"
        >
          <div className="mx-auto aspect-[5/6] w-full max-w-64" data-priority={priority ? "" : undefined}>
            <GarmentArt type={piece.type} color={piece.color} className="h-full w-full" />
          </div>
        </LabelTag>
        <div className="mt-4 grid gap-0.5">
          <p className="font-display text-lg font-extrabold leading-tight">{pieceBrandName(piece)}</p>
          <h3 className="font-sans text-base font-medium leading-snug">{piece.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="font-bold text-ink">{formatMoney(rentalCents(piece, 7))}</span> por 7 dias
            <span aria-hidden="true"> · </span>
            {TIER_LABEL[piece.tier]}
          </p>
        </div>
      </Link>
    </article>
  );
}
