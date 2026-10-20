import type { ElementType, ReactNode } from "react";
import type { Tier } from "@/data/catalog";
import { cn } from "@/lib/cn";

/**
 * Etiqueta de roupa: o motivo da marca. O furo e o cordão são desenhados em CSS; a cor indica a linha
 * (lavanda = Essencial, pêssego = Premium).
 */
export function LabelTag({
  tier,
  as: Tag = "div",
  className,
  children,
}: {
  tier: Tier;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "relative rounded-t-card rounded-b-control border-2 border-ink px-4 pb-4 pt-9",
        tier === "premium" ? "bg-peach" : "bg-lavender",
        // furo
        "before:absolute before:left-1/2 before:top-3 before:z-10 before:size-3.5 before:-translate-x-1/2",
        "before:rounded-full before:border-2 before:border-ink before:bg-canvas before:content-['']",
        // cordão
        "after:absolute after:-top-3.5 after:left-1/2 after:h-[1.375rem] after:w-0.5 after:-translate-x-1/2",
        "after:bg-ink after:content-['']",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
