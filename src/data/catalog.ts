import type { GarmentType } from "./garments";

export type Tier = "essencial" | "premium";
export type Size = "PP" | "P" | "M" | "G" | "GG";

export const SIZES: readonly Size[] = ["PP", "P", "M", "G", "GG"];

export const TIER_LABEL: Record<Tier, string> = {
  essencial: "Essencial",
  premium: "Premium",
};

export type Brand = { id: string; name: string; tier: Tier };

export const BRANDS: readonly Brand[] = [
  { id: "c-and-a", name: "C&A", tier: "essencial" },
  { id: "renner", name: "Renner", tier: "essencial" },
  { id: "riachuelo", name: "Riachuelo", tier: "essencial" },
  { id: "zara", name: "Zara", tier: "premium" },
  { id: "mango", name: "Mango", tier: "premium" },
  { id: "farm", name: "Farm", tier: "premium" },
];

export type Piece = {
  id: string;
  brandId: string;
  name: string;
  tier: Tier;
  type: GarmentType;
  /** Cor principal da peça (hex), usada na ilustração e na cena 3D. */
  color: string;
  /** Valor de loja da peça, em centavos. */
  valueCents: number;
  sizes: readonly Size[];
  description: string;
  material: string;
};

const ALL: readonly Size[] = SIZES;
const MID: readonly Size[] = ["P", "M", "G"];

// Cores das peças: tons mais saturados que a paleta da interface, para a peça destacar do fundo pastel.
const C = {
  sage: "#9CC3AE",
  blush: "#E7A1B0",
  lavender: "#B8A3E4",
  apricot: "#F0B48A",
  sky: "#9DC0E8",
  butter: "#EBD48C",
  cream: "#E9DFCF",
  charcoal: "#4A4852",
  denim: "#6F93BF",
} as const;

export const CATALOG: readonly Piece[] = [
  // Essencial
  { id: "ca-camisa", brandId: "c-and-a", name: "Camisa de linho", tier: "essencial", type: "shirt", color: C.sage, valueCents: 11990, sizes: ALL, description: "Camisa leve de caimento solto, ótima para o calor.", material: "Linho e viscose" },
  { id: "ca-jaqueta", brandId: "c-and-a", name: "Jaqueta jeans", tier: "essencial", type: "jacket", color: C.denim, valueCents: 16990, sizes: ALL, description: "Jaqueta clássica de lavagem média, vai com tudo.", material: "Algodão" },
  { id: "ca-saia", brandId: "c-and-a", name: "Saia midi plissada", tier: "essencial", type: "skirt", color: C.blush, valueCents: 9990, sizes: MID, description: "Plissado fino que se move a cada passo.", material: "Poliéster" },
  { id: "renner-vestido", brandId: "renner", name: "Vestido midi floral", tier: "essencial", type: "dress", color: C.apricot, valueCents: 14990, sizes: ALL, description: "Estampa floral delicada e cintura marcada.", material: "Viscose" },
  { id: "renner-calca", brandId: "renner", name: "Calça pantalona", tier: "essencial", type: "trousers", color: C.cream, valueCents: 12990, sizes: ALL, description: "Perna larga e cintura alta, do trabalho ao jantar.", material: "Crepe" },
  { id: "renner-blazer", brandId: "renner", name: "Blazer de alfaiataria", tier: "essencial", type: "blazer", color: C.lavender, valueCents: 18990, sizes: MID, description: "Modelagem reta com ombro marcado.", material: "Poliviscose" },
  { id: "riachuelo-calca", brandId: "riachuelo", name: "Calça de alfaiataria", tier: "essencial", type: "trousers", color: C.charcoal, valueCents: 13990, sizes: ALL, description: "Corte reto e vinco frontal, pronta para entrevistas.", material: "Poliviscose" },
  { id: "riachuelo-camisa", brandId: "riachuelo", name: "Camisa oversized", tier: "essencial", type: "shirt", color: C.sky, valueCents: 8990, sizes: ALL, description: "Modelagem ampla para usar fechada ou aberta.", material: "Algodão" },
  // Premium
  { id: "zara-blazer", brandId: "zara", name: "Blazer estruturado", tier: "premium", type: "blazer", color: C.cream, valueCents: 34900, sizes: ALL, description: "Ombreiras discretas e acabamento forrado.", material: "Lã e poliéster" },
  { id: "zara-slip", brandId: "zara", name: "Vestido slip de cetim", tier: "premium", type: "dress", color: C.apricot, valueCents: 29900, sizes: MID, description: "Cetim fluido com alças finas e barra assimétrica.", material: "Cetim" },
  { id: "zara-camisa", brandId: "zara", name: "Camisa de popeline", tier: "premium", type: "shirt", color: C.sky, valueCents: 22900, sizes: ALL, description: "Popeline firme com colarinho estruturado.", material: "Algodão" },
  { id: "mango-trench", brandId: "mango", name: "Trench coat", tier: "premium", type: "coat", color: C.butter, valueCents: 49900, sizes: MID, description: "Clássico duplo-peito com cinto marcado.", material: "Gabardine" },
  { id: "mango-vestido", brandId: "mango", name: "Vestido de linho", tier: "premium", type: "dress", color: C.sage, valueCents: 31900, sizes: ALL, description: "Linho encorpado com decote reto.", material: "Linho" },
  { id: "mango-calca", brandId: "mango", name: "Calça wide leg", tier: "premium", type: "trousers", color: C.charcoal, valueCents: 25900, sizes: ALL, description: "Perna larguíssima com cintura alta.", material: "Crepe" },
  { id: "farm-saia", brandId: "farm", name: "Saia estampada", tier: "premium", type: "skirt", color: C.blush, valueCents: 38900, sizes: MID, description: "Estampa exclusiva em tecido leve e rodado.", material: "Viscose" },
  { id: "farm-vestido", brandId: "farm", name: "Vestido longo estampado", tier: "premium", type: "dress", color: C.lavender, valueCents: 52900, sizes: MID, description: "Comprimento longo e estampa de ateliê.", material: "Viscose" },
];

const BY_ID = new Map(CATALOG.map((piece) => [piece.id, piece]));
const BRAND_BY_ID = new Map(BRANDS.map((brand) => [brand.id, brand]));

export function findPiece(id: string): Piece | undefined {
  return BY_ID.get(id);
}

export function getPiece(id: string): Piece {
  const piece = BY_ID.get(id);
  if (!piece) throw new Error(`Peça desconhecida: ${id.slice(0, 40)}`);
  return piece;
}

export function getBrand(brandId: string): Brand {
  const brand = BRAND_BY_ID.get(brandId);
  if (!brand) throw new Error(`Marca desconhecida: ${brandId.slice(0, 40)}`);
  return brand;
}
