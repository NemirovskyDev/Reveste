"use client";

import { useState } from "react";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { SelectField } from "@/components/ui/Field";
import { CATALOG, getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { pieceTitle } from "@/lib/piece";
import { RENTAL_DAYS, buyoutAfterRentalCents, buyoutCents, rentalPaidCents, type RentalDays, type RentalPeriod } from "@/lib/pricing";

type Mode = "plan" | "rental";

const MODES = [
  { value: "plan", label: "Plano mensal" },
  { value: "rental", label: "Aluguel avulso" },
] as const;

const MONTHS = [1, 2, 3] as const;

/** Calculadora: a pessoa diz como e por quanto tempo alugou a peça e vê quanto falta para ficar com ela. */
export function BuyoutCalculator() {
  const [pieceId, setPieceId] = useState("zara-blazer");
  const [mode, setMode] = useState<Mode>("plan");
  const [months, setMonths] = useState<(typeof MONTHS)[number]>(1);
  const [days, setDays] = useState<RentalDays>(7);

  const piece = getPiece(pieceId);
  const full = buyoutCents(piece, 0);
  const period: RentalPeriod = mode === "plan" ? { kind: "plan", months } : { kind: "rental", days };
  const paid = rentalPaidCents(piece, period);
  const remaining = buyoutAfterRentalCents(piece, period);
  // O aluguel pago pode passar do preço de compra (2 meses de plano, por exemplo): nesse caso só o necessário abate.
  const covered = Math.min(paid, full);

  return (
    <div className="grid gap-8 rounded-card border-2 border-ink bg-mint p-6 md:p-10 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-6">
        <SelectField label="Peça" value={pieceId} onChange={(event) => setPieceId(event.target.value)}>
          {CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {pieceTitle(item)} ({formatMoney(item.valueCents)})
            </option>
          ))}
        </SelectField>

        <ChoiceGroup legend="Como você alugou?" value={mode} onChange={setMode} options={MODES} />

        {mode === "plan" ? (
          <ChoiceGroup
            legend="Por quanto tempo ficou com a peça?"
            value={months}
            onChange={setMonths}
            layout="stack"
            options={MONTHS.map((value) => ({
              value,
              label: value === 1 ? "1 mês" : `${value} meses`,
              detail: `${formatMoney(rentalPaidCents(piece, { kind: "plan", months: value }))} pagos`,
            }))}
          />
        ) : (
          <ChoiceGroup
            legend="Por quanto tempo ficou com a peça?"
            value={days}
            onChange={setDays}
            layout="stack"
            options={RENTAL_DAYS.map((value) => ({
              value,
              label: `${value} dias`,
              detail: `${formatMoney(rentalPaidCents(piece, { kind: "rental", days: value }))} pagos`,
            }))}
          />
        )}
      </div>

      {/* Altura mínima: a frase do resultado muda de tamanho e, sem ela, a seção inteira "pulava" a cada escolha. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="min-h-48 rounded-card border-2 border-ink bg-canvas p-6">
        <p>
          Preço de compra: <strong>{formatMoney(full)}</strong>. Já pago em aluguel: <strong>{formatMoney(paid)}</strong>.
        </p>
        <p className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
          {remaining === 0 ? "Quitada. A peça é sua." : `Falta pagar ${formatMoney(remaining)}`}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          {remaining === 0
            ? `O aluguel que você pagou (${formatMoney(paid)}) já cobre o preço de compra.`
            : `O aluguel abate ${formatMoney(covered)} do preço de compra.`}
        </p>
      </div>
    </div>
  );
}
