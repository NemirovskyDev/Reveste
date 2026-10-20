/** Filtros e ordenação do catálogo. A URL é a fonte da verdade, então a busca é compartilhável. */
import { BRANDS, SIZES, type Piece, type Size, type Tier } from "@/data/catalog";
import { GARMENT_SHAPES, type GarmentType } from "@/data/garments";

export type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "nome";

export type CatalogFilters = {
  tier?: Tier;
  brand?: string;
  type?: GarmentType;
  size?: Size;
  sort: SortKey;
};

export const SORT_LABEL: Record<SortKey, string> = {
  relevancia: "Destaques",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  nome: "Nome (A a Z)",
};

const TIERS: readonly Tier[] = ["essencial", "premium"];
const SORTS = Object.keys(SORT_LABEL) as SortKey[];
const TYPES = Object.keys(GARMENT_SHAPES) as GarmentType[];

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: Params, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Lê os filtros da URL; qualquer valor desconhecido é ignorado. */
export function parseFilters(params: Params): CatalogFilters {
  const tier = read(params, "linha");
  const brand = read(params, "marca");
  const type = read(params, "tipo");
  const size = read(params, "tamanho");
  const sort = read(params, "ordem");

  const filters: CatalogFilters = { sort: "relevancia" };
  if (tier && (TIERS as readonly string[]).includes(tier)) filters.tier = tier as Tier;
  if (brand && BRANDS.some((item) => item.id === brand)) filters.brand = brand;
  if (type && (TYPES as readonly string[]).includes(type)) filters.type = type as GarmentType;
  if (size && (SIZES as readonly string[]).includes(size)) filters.size = size as Size;
  if (sort && (SORTS as readonly string[]).includes(sort)) filters.sort = sort as SortKey;
  return filters;
}

export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.tier) params.set("linha", filters.tier);
  if (filters.brand) params.set("marca", filters.brand);
  if (filters.type) params.set("tipo", filters.type);
  if (filters.size) params.set("tamanho", filters.size);
  if (filters.sort !== "relevancia") params.set("ordem", filters.sort);
  return params.toString();
}

export function filterPieces(pieces: readonly Piece[], filters: CatalogFilters): Piece[] {
  const result = pieces.filter(
    (piece) =>
      (!filters.tier || piece.tier === filters.tier) &&
      (!filters.brand || piece.brandId === filters.brand) &&
      (!filters.type || piece.type === filters.type) &&
      (!filters.size || piece.sizes.includes(filters.size)),
  );
  switch (filters.sort) {
    case "menor-preco":
      return result.sort((a, b) => a.valueCents - b.valueCents);
    case "maior-preco":
      return result.sort((a, b) => b.valueCents - a.valueCents);
    case "nome":
      return result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    default:
      return result;
  }
}
