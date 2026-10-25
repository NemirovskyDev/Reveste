"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type Choice<T extends string | number> = {
  value: T;
  label: ReactNode;
  /** Texto de apoio na segunda linha (preço, por exemplo). */
  detail?: ReactNode;
  disabled?: boolean;
};

/** Grupo de opções exclusivas (rádio) com aparência de botões; navegação por setas vem do navegador. */
export function ChoiceGroup<T extends string | number>({
  legend,
  options,
  value,
  onChange,
  layout = "row",
  className,
}: {
  legend: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: "row" | "stack";
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-2 font-bold">{legend}</legend>
      <div className={cn("gap-2", layout === "row" ? "flex flex-wrap" : "grid")}>
        {options.map((option) => (
          <label key={String(option.value)} className="relative cursor-pointer has-[:disabled]:cursor-not-allowed">
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <span
              className={cn(
                "flex min-h-11 items-center justify-between gap-4 rounded-control border-2 border-ink bg-white px-4 py-2 font-bold",
                "transition duration-300 ease-out-expo",
                // Selecionado: fundo, sombra e um check. A cor sozinha não basta (contraste 1,44:1 com o branco).
                "peer-checked:bg-lavender peer-checked:shadow-lift peer-hover:bg-lavender/40 peer-hover:scale-[1.03] peer-active:scale-[0.98]",
                "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink",
                "peer-disabled:opacity-45 peer-disabled:line-through",
              )}
            >
              <span className="inline-flex items-center gap-2">
                {/* O espaço do check é sempre reservado: sem isso a opção escolhida ficava mais larga, as outras mudavam de lugar e a linha "tremia" no celular. */}
                <Icon
                  key={option.value === value ? "on" : "off"}
                  name="check"
                  size={18}
                  className={option.value === value ? "check-pop" : "invisible"}
                />
                {option.label}
              </span>
              {option.detail && <span className="font-medium text-ink-soft">{option.detail}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
