"use client";

import { useState } from "react";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { SelectField } from "@/components/ui/Field";
import { CATALOG, getPiece } from "@/data/catalog";
import { formatMoney } from "@/lib/format";
import { pieceTitle } from "@/lib/piece";
import { buyoutCents } from "@/lib/pricing";

const MONTHS = [1, 2, 3] as const;

export function BuyoutCalculator() {
  const [pieceId, setPieceId] = useState("zara-blazer");
  const [months, setMonths] = useState<(typeof MONTHS)[number]>(1);

  const piece = getPiece(pieceId);
  const full = buyoutCents(piece, 0);
  const remaining = buyoutCents(piece, months);

  return (
    <div className="grid gap-8 rounded-card border-2 border-ink bg-mint p-6 md:p-10 lg:grid-cols-2 lg:items-center">
      <div className="grid gap-6">
        <SelectField label="Peça" value={pieceId} onChange={(event) => setPieceId(event.target.value)}>
          {CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {pieceTitle(item)} ({formatMoney(item.valueCents)})
            </option>
          ))}
        </SelectField>
        <ChoiceGroup
          legend="Meses que você já alugou no plano"
          value={months}
          onChange={setMonths}
          options={MONTHS.map((value) => ({ value, label: value === 1 ? "1 mês" : `${value} meses` }))}
        />
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="rounded-card border-2 border-ink bg-canvas p-6">
        <p>
          Preço de compra: <strong>{formatMoney(full)}</strong>. Já pago em aluguel:{" "}
          <strong>{formatMoney(full - remaining)}</strong>.
        </p>
        <p className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
          {remaining === 0 ? "Quitada. A peça é sua." : `Falta pagar ${formatMoney(remaining)}`}
        </p>
      </div>
    </div>
  );
}
