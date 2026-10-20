"use client";

import { useId, useState } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import {
  SIM_VALUE_MAX_REAIS,
  SIM_VALUE_MIN_REAIS,
  SIM_VALUE_STEP_REAIS,
  normalizeSimulation,
  simulatePlan,
} from "@/lib/planSimulator";
import { PLAN_SIZE } from "@/lib/pricing";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
};

/** Slider nativo (teclado, toque e leitor de tela de graça) com o valor atual sempre visível. */
function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-bold">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-xl font-extrabold">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ backgroundSize: `${fill}% 6px, 100% 6px` }}
        className="sim-range mt-3 h-11 w-full cursor-pointer"
      />
    </div>
  );
}

/** Simulador: o visitante arrasta os controles e vê a mensalidade do plano mudar na hora. */
export function PlanSimulator() {
  const [input, setInput] = useState({ valueReais: 300, premiumCount: 2 });
  const { valueReais, premiumCount } = normalizeSimulation(input);
  const sim = simulatePlan({ valueReais, premiumCount });

  return (
    <Container as="section" aria-labelledby="simulador" className="py-16 md:py-24">
      <h2 id="simulador" className="mb-3 max-w-3xl text-[clamp(2rem,4.6vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        Simule o seu plano.
      </h2>
      <p className="mb-10 max-w-2xl text-lg text-ink-soft md:text-xl">
        Escolha o valor médio das {PLAN_SIZE} peças e quantas são Premium. A conta é a mesma do montador.
      </p>

      <div className="grid gap-8 rounded-card border-2 border-ink bg-peach p-6 md:p-10 lg:grid-cols-2 lg:items-center">
        <div className="grid gap-8">
          <Slider
            label="Valor médio da peça"
            value={valueReais}
            min={SIM_VALUE_MIN_REAIS}
            max={SIM_VALUE_MAX_REAIS}
            step={SIM_VALUE_STEP_REAIS}
            display={formatMoney(valueReais * 100)}
            onChange={(next) => setInput({ valueReais: next, premiumCount })}
          />
          <Slider
            label="Peças Premium no plano"
            value={premiumCount}
            min={0}
            max={PLAN_SIZE}
            step={1}
            display={`${premiumCount} de ${PLAN_SIZE}`}
            onChange={(next) => setInput({ valueReais, premiumCount: next })}
          />
        </div>

        <div role="status" aria-live="polite" aria-atomic="true" className="rounded-card border-2 border-ink bg-canvas p-6">
          <dl className="grid gap-2">
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>Aluguel avulso de 30 dias</dt>
              <dd className="tabular-nums">{formatMoney(sim.full)}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4">
              <dt>Desconto do plano ({sim.savingsPercent}%)</dt>
              <dd className="tabular-nums">−{formatMoney(sim.discount)}</dd>
            </div>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 border-t-2 border-ink pt-3 font-display text-2xl font-extrabold sm:text-3xl">
              <dt>Mensalidade</dt>
              <dd className="tabular-nums">{formatMoney(sim.monthly)}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <ButtonLink href="/assinatura" iconAfter="arrow-right">
              Montar meu plano
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
