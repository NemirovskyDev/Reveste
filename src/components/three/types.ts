import type { GarmentType } from "@/data/garments";

/** Uma peça pendurada na arara. `color` é hex #rrggbb. */
export type RackItem = { type: GarmentType; color: string };

/** Compatível com `MotionValue<number>` de "motion/react" (progresso 0 a 1 da rolagem). */
export type ProgressSource = {
  get(): number;
  on(event: "change", cb: (v: number) => void): () => void;
};
