"use client";

import { useState } from "react";
import { GarmentArt } from "@/components/garments/GarmentArt";
import type { Piece } from "@/data/catalog";
import { assetUrl } from "@/lib/assets";
import { cn } from "@/lib/cn";

type Props = {
  piece: Pick<Piece, "id" | "type" | "color">;
  /** Descrição da imagem para leitores de tela; sem ela a imagem é decorativa. */
  title?: string;
  /** Primeira dobra: carrega já, sem esperar rolar. */
  priority?: boolean;
  className?: string;
};

/**
 * Foto da peça (public/images/pieces/<id>.webp, 4:5, fundo branco). Fica sobre um painel branco, sem mistura
 * de cor com a etiqueta, para a cor da peça aparecer fiel. Se a foto faltar ou falhar, volta para a ilustração.
 */
export function PieceImage({ piece, title, priority = false, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <GarmentArt type={piece.type} color={piece.color} title={title} className={className} />;

  return (
    // `next/image` não otimiza em exportação estática; o WebP já sai pronto no tamanho certo.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl(`/images/pieces/${piece.id}.webp`)}
      alt={title ?? ""}
      width={900}
      height={1125}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("block rounded-control bg-white object-contain", className)}
    />
  );
}
