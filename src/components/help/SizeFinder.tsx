"use client";

import { useState } from "react";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { TextField } from "@/components/ui/Field";
import {
  MAX_CM,
  MEASURES,
  MEASURE_LABEL,
  MIN_CM,
  recommendSize,
  type Measure,
  type SizeKind,
} from "@/lib/sizeGuide";

const KINDS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
] as const;

/** Calculadora: a pessoa digita as medidas em cm e vê o tamanho sugerido na hora. */
export function SizeFinder() {
  const [kind, setKind] = useState<SizeKind>("feminino");
  const [raw, setRaw] = useState<Record<Measure, string>>({ chest: "", waist: "", hip: "" });

  const numbers = Object.fromEntries(MEASURES.map((measure) => [measure, raw[measure].trim() === "" ? undefined : Number(raw[measure].replace(",", "."))])) as Partial<Record<Measure, number>>;
  const invalid = (measure: Measure) => {
    const value = numbers[measure];
    return value !== undefined && (!Number.isFinite(value) || value < MIN_CM || value > MAX_CM);
  };
  const hasError = MEASURES.some(invalid);
  const result = hasError ? null : recommendSize(kind, numbers);

  return (
    <div className="grid gap-6 rounded-card border-2 border-ink bg-cream p-6 md:p-8">
      <ChoiceGroup legend="A peça é" options={KINDS.map((item) => ({ ...item }))} value={kind} onChange={setKind} />

      <div className="grid gap-4 sm:grid-cols-3">
        {MEASURES.map((measure) => (
          <TextField
            key={measure}
            label={`${MEASURE_LABEL[measure][kind]} (cm)`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Ex.: 90"
            value={raw[measure]}
            error={invalid(measure) ? `Use um valor entre ${MIN_CM} e ${MAX_CM} cm.` : undefined}
            onChange={(event) => setRaw((current) => ({ ...current, [measure]: event.target.value }))}
          />
        ))}
      </div>

      <div role="status" aria-live="polite" className="rounded-control border-2 border-ink bg-lavender/50 p-4">
        {result === null && <p>Digite pelo menos uma medida para ver o tamanho sugerido.</p>}
        {result?.size && (
          <p className="text-lg">
            Tamanho sugerido: <strong className="font-display text-2xl font-extrabold">{result.size}</strong>
          </p>
        )}
        {result && result.size === null && (
          <p>Suas medidas passam do GG da nossa tabela. Fale com a gente pela página de ajuda para ver outras opções.</p>
        )}
      </div>
    </div>
  );
}
