import { getBrand, TIER_LABEL, type Piece } from "@/data/catalog";
import { GARMENT_LABEL } from "@/data/garments";

/** "Zara Blazer estruturado": o texto que identifica a peça em listas, pedidos e rótulos. */
export function pieceTitle(piece: Pick<Piece, "brandId" | "name">): string {
  return `${getBrand(piece.brandId).name} ${piece.name}`;
}

export function pieceBrandName(piece: Pick<Piece, "brandId">): string {
  return getBrand(piece.brandId).name;
}

export function pieceKindLabel(piece: Pick<Piece, "type" | "tier">): string {
  return `${GARMENT_LABEL[piece.type]} ${TIER_LABEL[piece.tier].toLowerCase()}`;
}
