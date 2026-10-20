"use client";

import Link from "next/link";
import { PieceImage } from "@/components/piece/PieceImage";
import { ButtonLink } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { getPiece } from "@/data/catalog";
import { formatMoney, plural } from "@/lib/format";
import { summarizeBag } from "@/lib/orderLines";
import { pieceTitle } from "@/lib/piece";
import { PLAN_SIZE, RENTAL_DAYS, buyoutCents, netPlanRentalCents, rentalCents, type RentalDays } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { usePlan } from "@/store/plan";
import { useBagHydrated } from "@/store/useHydrated";

function Thumb({ pieceId }: { pieceId: string }) {
  const piece = getPiece(pieceId);
  return (
    <span className="grid size-20 shrink-0 place-items-center rounded-control border-2 border-ink bg-white p-1.5" aria-hidden="true">
      <PieceImage piece={piece} className="size-full" />
    </span>
  );
}

export function BagView() {
  const lines = useCart((state) => state.lines);
  const removeLine = useCart((state) => state.remove);
  const setDays = useCart((state) => state.setDays);
  const slots = usePlan((state) => state.slots);
  const removeSlot = usePlan((state) => state.remove);

  const hydrated = useBagHydrated();
  const summary = summarizeBag(slots, lines);
  const empty = slots.length === 0 && lines.length === 0;

  if (!hydrated) return <p className="py-10 text-ink-soft">Carregando sua sacola…</p>;

  if (empty) {
    return (
      <div className="grid justify-items-start gap-5 rounded-card border-2 border-ink bg-cream p-8 md:p-12">
        <Icon name="bag" size={40} />
        <h2 className="text-3xl font-bold">Sua sacola está vazia</h2>
        <p className="max-w-lg text-lg text-ink-soft">
          Monte seu plano de 4 peças, alugue uma peça avulsa por 7, 14 ou 30 dias ou compre a peça que você mais gostou.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assinatura">Montar meu plano</ButtonLink>
          <ButtonLink href="/catalogo" variant="secondary">
            Ver o catálogo
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <div className="grid gap-10">
        {slots.length > 0 && (
          <section aria-labelledby="plano-titulo">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="plano-titulo" className="text-2xl font-bold">
                Plano mensal
              </h2>
              <Link href="/assinatura" className="font-bold underline underline-offset-4">
                Editar plano
              </Link>
            </div>

            {!summary.hasPlan && (
              <p role="status" className="mb-4 rounded-control border-2 border-ink bg-peach p-4">
                Seu plano tem {slots.length} de {PLAN_SIZE} peças. Escolha mais {PLAN_SIZE - slots.length}{" "}
                {plural(PLAN_SIZE - slots.length, "peça", "peças")} para incluí-lo no pagamento.{" "}
                <Link href="/assinatura" className="font-bold underline underline-offset-4">
                  Escolher peças
                </Link>
              </p>
            )}

            <ul className="grid gap-3">
              {slots.map((slot) => {
                const piece = getPiece(slot.pieceId);
                return (
                  <li key={slot.pieceId} className="flex items-center gap-4 rounded-card border-2 border-ink bg-cream p-3">
                    <Thumb pieceId={slot.pieceId} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{pieceTitle(piece)}</p>
                      <p className="text-sm text-ink-soft">
                        Tamanho {slot.size} · 30 dias · {formatMoney(netPlanRentalCents(piece))} ao mês
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.pieceId)}
                      aria-label={`Tirar ${pieceTitle(piece)} do plano`}
                      className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-lavender/60"
                    >
                      <Icon name="close" size={20} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {summary.purchaseCount > 0 && (
          <section aria-labelledby="compras-titulo">
            <h2 id="compras-titulo" className="mb-4 text-2xl font-bold">
              Peças para comprar
            </h2>
            <ul className="grid gap-3">
              {lines
                .filter((line) => line.buy)
                .map((line) => {
                  const piece = getPiece(line.pieceId);
                  return (
                    <li key={line.pieceId} className="flex flex-wrap items-center gap-4 rounded-card border-2 border-ink bg-cream p-3">
                      <Thumb pieceId={line.pieceId} />
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="font-bold leading-snug">{pieceTitle(piece)}</p>
                        <p className="text-sm text-ink-soft">Tamanho {line.size} · fica com você</p>
                        <p className="mt-1 font-bold">{formatMoney(buyoutCents(piece, 0))}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.pieceId)}
                        aria-label={`Tirar ${pieceTitle(piece)} da sacola`}
                        className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-lavender/60"
                      >
                        <Icon name="close" size={20} />
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}

        {summary.rentalCount > 0 && (
          <section aria-labelledby="avulsos-titulo">
            <h2 id="avulsos-titulo" className="mb-4 text-2xl font-bold">
              Aluguéis avulsos
            </h2>
            <ul className="grid gap-3">
              {lines.filter((line) => !line.buy).map((line) => {
                const piece = getPiece(line.pieceId);
                return (
                  <li key={line.pieceId} className="flex flex-wrap items-center gap-4 rounded-card border-2 border-ink bg-cream p-3">
                    <Thumb pieceId={line.pieceId} />
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="font-bold leading-snug">{pieceTitle(piece)}</p>
                      <p className="text-sm text-ink-soft">Tamanho {line.size}</p>
                      <p className="mt-1 font-bold">{formatMoney(rentalCents(piece, line.days))}</p>
                    </div>
                    <SelectField
                      label="Prazo"
                      className="w-36"
                      value={line.days}
                      onChange={(event) => setDays(line.pieceId, Number(event.target.value) as RentalDays)}
                    >
                      {RENTAL_DAYS.map((days) => (
                        <option key={days} value={days}>
                          {days} dias
                        </option>
                      ))}
                    </SelectField>
                    <button
                      type="button"
                      onClick={() => removeLine(line.pieceId)}
                      aria-label={`Tirar ${pieceTitle(piece)} da sacola`}
                      className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-lavender/60"
                    >
                      <Icon name="close" size={20} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <aside aria-labelledby="resumo-titulo" className="rounded-card border-2 border-ink bg-cream p-6 lg:sticky lg:top-32">
        <h2 id="resumo-titulo" className="mb-4 text-2xl font-bold">
          Resumo
        </h2>
        <dl className="mb-5 grid gap-2">
          {summary.hasPlan && (
            <>
              <div className="flex justify-between gap-3">
                <dt>Plano mensal (4 peças)</dt>
                <dd>{formatMoney(summary.planCents)}</dd>
              </div>
              {summary.planDiscountCents > 0 && (
                <div className="flex justify-between gap-3 text-sm text-ink-soft">
                  <dt>Você economiza com o plano</dt>
                  <dd>{formatMoney(summary.planDiscountCents)}</dd>
                </div>
              )}
            </>
          )}
          {summary.pendingPlanSlots > 0 && (
            <div className="flex justify-between gap-3 text-ink-soft">
              <dt>
                Plano em montagem ({summary.pendingPlanSlots} de {PLAN_SIZE})
              </dt>
              <dd>{formatMoney(summary.pendingPlanCents)}</dd>
            </div>
          )}
          {summary.rentalCount > 0 && (
            <div className="flex justify-between gap-3">
              <dt>
                {summary.rentalCount} {plural(summary.rentalCount, "aluguel avulso", "aluguéis avulsos")}
              </dt>
              <dd>{formatMoney(summary.rentalsCents)}</dd>
            </div>
          )}
          {summary.purchaseCount > 0 && (
            <div className="flex justify-between gap-3">
              <dt>
                {summary.purchaseCount} {plural(summary.purchaseCount, "peça comprada", "peças compradas")}
              </dt>
              <dd>{formatMoney(summary.purchasesCents)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt>Frete</dt>
            <dd>{summary.hasPlan && lines.length === 0 ? "Grátis" : "No pagamento"}</dd>
          </div>
          <div className="mt-2 flex justify-between gap-3 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold">
            <dt>Subtotal</dt>
            <dd>{formatMoney(summary.subtotalCents)}</dd>
          </div>
        </dl>
        {summary.hasPlan && (
          <p className="mb-5 text-sm text-ink-soft">
            Todo mês você devolve as 4 peças e escolhe outras 4, pelo mesmo valor.
          </p>
        )}
        {summary.canCheckout ? (
          <ButtonLink href="/checkout" size="lg" block iconAfter="arrow-right">
            Ir para o pagamento
          </ButtonLink>
        ) : (
          <ButtonLink href="/assinatura" size="lg" block iconAfter="arrow-right">
            Escolher mais {PLAN_SIZE - summary.pendingPlanSlots} {plural(PLAN_SIZE - summary.pendingPlanSlots, "peça", "peças")}
          </ButtonLink>
        )}
      </aside>
    </div>
  );
}
