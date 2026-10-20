"use client";

import { useState } from "react";
import { GarmentArt } from "@/components/garments/GarmentArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { LabelTag } from "@/components/ui/LabelTag";
import { CATALOG, TIER_LABEL, getPiece, type Size, type Tier } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatMoney, plural } from "@/lib/format";
import { pieceBrandName, pieceTitle } from "@/lib/piece";
import { PLAN_SIZE, netPlanRentalCents, partialPlanQuote, planDiscountRate } from "@/lib/pricing";
import { usePlan } from "@/store/plan";

type TierFilter = Tier | "todas";

const FILTERS: ReadonlyArray<{ value: TierFilter; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "essencial", label: TIER_LABEL.essencial },
  { value: "premium", label: TIER_LABEL.premium },
];

export function PlanBuilder() {
  const slots = usePlan((state) => state.slots);
  const toggle = usePlan((state) => state.toggle);
  const setSize = usePlan((state) => state.setSize);
  const remove = usePlan((state) => state.remove);
  const clear = usePlan((state) => state.clear);

  const [tier, setTier] = useState<TierFilter>("todas");
  const [message, setMessage] = useState("");

  const pieces = CATALOG.filter((piece) => tier === "todas" || piece.tier === tier);
  const chosen = slots.map((slot) => ({ slot, piece: getPiece(slot.pieceId) }));
  const quote = partialPlanQuote(chosen.map((item) => item.piece));
  const full = slots.length === PLAN_SIZE;
  const missing = PLAN_SIZE - slots.length;

  function onToggle(pieceId: string, defaultSize: Size) {
    const wasChosen = slots.some((slot) => slot.pieceId === pieceId);
    const ok = toggle(pieceId, defaultSize);
    if (!ok) {
      setMessage("Seu plano já tem 4 peças. Tire uma para trocar.");
      return;
    }
    const piece = getPiece(pieceId);
    setMessage(
      wasChosen
        ? `${pieceTitle(piece)} saiu do plano.`
        : `${pieceTitle(piece)} entrou no plano. ${slots.length + 1} de ${PLAN_SIZE} peças.`,
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section aria-labelledby="escolha-titulo">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="escolha-titulo" className="text-2xl font-bold">
            Escolha 4 peças
          </h2>
          <div role="group" aria-label="Filtrar por linha" className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={tier === option.value}
                onClick={() => setTier(option.value)}
                className={cn(
                  "min-h-11 rounded-full border-2 border-ink px-5 font-bold transition duration-300 ease-out-expo",
                  tier === option.value ? "bg-ink text-canvas" : "hover:bg-lavender/60",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-5">
          {pieces.map((piece) => {
            const slot = slots.find((item) => item.pieceId === piece.id);
            const selected = Boolean(slot);
            const defaultSize = piece.sizes[Math.floor((piece.sizes.length - 1) / 2)] as Size;
            return (
              <li key={piece.id} className="pt-4">
                <LabelTag
                  tier={piece.tier}
                  className={cn("transition duration-500 ease-out-expo", selected && "-translate-y-1.5 shadow-lift")}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${pieceTitle(piece)}, ${TIER_LABEL[piece.tier]}, ${formatMoney(netPlanRentalCents(piece))} ao mês no plano`}
                    onClick={() => onToggle(piece.id, defaultSize)}
                    className="relative block w-full rounded-control"
                  >
                    <span className="mx-auto block aspect-[5/6] w-full max-w-56">
                      <GarmentArt type={piece.type} color={piece.color} className="h-full w-full" />
                    </span>
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-2 -top-6 grid size-8 place-items-center rounded-full border-2 border-ink bg-mint"
                      >
                        <Icon name="check" size={18} />
                      </span>
                    )}
                  </button>
                </LabelTag>
                <div className="mt-3 grid gap-0.5">
                  <p className="font-display text-base font-extrabold">{pieceBrandName(piece)}</p>
                  <p className="leading-snug">{piece.name}</p>
                  <p className="text-sm text-ink-soft">
                    <span className="font-bold text-ink">{formatMoney(netPlanRentalCents(piece))}</span> ao mês, com{" "}
                    {Math.round(planDiscountRate(piece.tier) * 100)}% de desconto
                  </p>
                </div>
                {slot && (
                  <SelectField
                    label="Tamanho"
                    className="mt-3"
                    value={slot.size}
                    onChange={(event) => setSize(piece.id, event.target.value as Size)}
                  >
                    {piece.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </SelectField>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <aside aria-labelledby="resumo" className="rounded-card border-2 border-ink bg-cream p-6 lg:sticky lg:top-32">
        <h2 id="resumo" tabIndex={-1} className="mb-4 text-2xl font-bold">
          Seu plano
        </h2>
        <ol className="mb-5 grid gap-2">
          {Array.from({ length: PLAN_SIZE }, (_, index) => {
            const item = chosen[index];
            if (!item) {
              return (
                <li key={index} className="rounded-control border-2 border-dashed border-line px-3 py-3 text-ink-soft">
                  Escolha uma peça
                </li>
              );
            }
            return (
              <li
                key={item.piece.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-control border-2 border-ink px-3 py-2",
                  item.piece.tier === "premium" ? "bg-peach" : "bg-lavender",
                )}
              >
                <span className="min-w-0 leading-snug">
                  <span className="block truncate font-bold">{pieceTitle(item.piece)}</span>
                  <span className="text-sm">
                    Tamanho {item.slot.size} · {formatMoney(netPlanRentalCents(item.piece))}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    remove(item.piece.id);
                    // O botão some junto com a peça; o foco vai para o resumo em vez de cair no topo da página.
                    document.getElementById("resumo")?.focus();
                  }}
                  aria-label={`Tirar ${pieceTitle(item.piece)} do plano`}
                  className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/60"
                >
                  <Icon name="close" size={20} />
                </button>
              </li>
            );
          })}
        </ol>

        <dl className="mb-4 grid gap-1">
          <div className="flex justify-between gap-3">
            <dt>Aluguel avulso de 30 dias</dt>
            <dd>{formatMoney(quote.full)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Desconto do plano</dt>
            <dd>{quote.discount > 0 ? `−${formatMoney(quote.discount)}` : formatMoney(0)}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-3 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold">
            <dt>{full ? "Mensalidade" : "Total parcial"}</dt>
            <dd>{formatMoney(quote.monthly)}</dd>
          </div>
        </dl>

        <p role="status" aria-live="polite" className="mb-4 min-h-12 text-sm text-ink-soft">
          {message ||
            (full
              ? "Plano completo. A mensalidade renova todo mês com as peças que você escolher."
              : `Faltam ${missing} ${plural(missing, "peça", "peças")} para fechar o plano.`)}
        </p>

        {full ? (
          <ButtonLink href="/sacola" size="lg" block iconAfter="arrow-right">
            Continuar com {formatMoney(quote.monthly)} ao mês
          </ButtonLink>
        ) : (
          <Button size="lg" block disabled>
            Escolha mais {missing} {plural(missing, "peça", "peças")}
          </Button>
        )}
        {slots.length > 0 && (
          <Button variant="ghost" size="sm" block className="mt-2" onClick={clear}>
            Limpar plano
          </Button>
        )}
      </aside>

      {slots.length > 0 && (
        <div className="sticky bottom-3 z-30 flex items-center justify-between gap-3 rounded-full border-2 border-ink bg-ink py-2 pl-5 pr-2 text-canvas shadow-lift lg:hidden">
          <span aria-hidden="true" className="font-bold">
            {slots.length} de {PLAN_SIZE} peças · {formatMoney(quote.monthly)}
          </span>
          {/* O contorno de foco padrão é grafite e a barra também; aqui ele fica claro para aparecer. */}
          <ButtonLink
            href="#resumo"
            variant="secondary"
            size="sm"
            className="whitespace-nowrap focus-visible:outline-canvas"
          >
            Ver plano
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
