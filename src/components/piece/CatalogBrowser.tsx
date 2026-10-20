"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";
import { PieceCard } from "@/components/piece/PieceCard";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { BRANDS, SIZES, TIER_LABEL, type Piece, type Tier } from "@/data/catalog";
import { GARMENT_LABEL, type GarmentType } from "@/data/garments";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import {
  SORT_LABEL,
  filterPieces,
  parseFilters,
  serializeFilters,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalogFilter";

const TIER_OPTIONS: ReadonlyArray<{ value: Tier | undefined; label: string }> = [
  { value: undefined, label: "Todas" },
  { value: "essencial", label: TIER_LABEL.essencial },
  { value: "premium", label: TIER_LABEL.premium },
];

export function CatalogBrowser({ pieces }: { pieces: readonly Piece[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const status = useRef<HTMLParagraphElement>(null);
  const filters = useMemo(() => parseFilters(params), [params]);
  const results = useMemo(() => filterPieces(pieces, filters), [pieces, filters]);
  const hasFilters = Boolean(filters.tier || filters.brand || filters.type || filters.size);

  function update(patch: Partial<CatalogFilters>) {
    const query = serializeFilters({ ...filters, ...patch });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // Os botões "Limpar filtros" somem ao limpar; o foco vai para a contagem de peças em vez de cair no topo.
  function clearFilters() {
    update({ tier: undefined, brand: undefined, type: undefined, size: undefined });
    status.current?.focus();
  }

  return (
    <div>
      <form
        aria-label="Filtros do catálogo"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-5 border-y-2 border-ink py-5 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-8"
      >
        <fieldset>
          <legend className="mb-2 font-bold">Linha</legend>
          <div className="flex flex-wrap gap-2">
            {TIER_OPTIONS.map((option) => {
              const active = filters.tier === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ tier: option.value })}
                  className={cn(
                    "min-h-11 rounded-full border-2 border-ink px-5 font-bold transition duration-300 ease-out-expo",
                    active ? "bg-ink text-canvas" : "bg-transparent hover:bg-lavender/60",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
          <SelectField
            label="Marca"
            value={filters.brand ?? ""}
            onChange={(event) => update({ brand: event.target.value || undefined })}
          >
            <option value="">Todas</option>
            {BRANDS.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tipo de peça"
            value={filters.type ?? ""}
            onChange={(event) => update({ type: (event.target.value || undefined) as GarmentType | undefined })}
          >
            <option value="">Todos</option>
            {(Object.keys(GARMENT_LABEL) as GarmentType[]).map((type) => (
              <option key={type} value={type}>
                {GARMENT_LABEL[type].charAt(0).toUpperCase() + GARMENT_LABEL[type].slice(1)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tamanho"
            value={filters.size ?? ""}
            onChange={(event) => update({ size: (event.target.value || undefined) as CatalogFilters["size"] })}
          >
            <option value="">Todos</option>
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Ordenar por"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value as SortKey })}
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </SelectField>
        </div>
      </form>

      <div className="flex items-center justify-between gap-4 py-5">
        <p ref={status} tabIndex={-1} role="status" aria-live="polite" className="text-ink-soft">
          {results.length} {plural(results.length, "peça", "peças")}
        </p>
        {hasFilters && results.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      <h2 className="sr-only">Peças disponíveis</h2>
      {results.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {results.map((piece, index) => (
            <li key={piece.id}>
              <Reveal delay={(index % 4) * 90}>
                <PieceCard piece={piece} priority={index < 4} />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid justify-items-start gap-4 rounded-card border-2 border-ink bg-cream p-8">
          <h2 className="text-2xl font-bold">Nenhuma peça com esses filtros</h2>
          <p className="max-w-lg text-ink-soft">Tire um filtro ou mude a marca para ver mais peças.</p>
          <Button variant="secondary" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
