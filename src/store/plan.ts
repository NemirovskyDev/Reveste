"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Size } from "@/data/catalog";
import { PLAN_SIZE } from "@/lib/pricing";
import { sanitizePlan, type PlanSlot } from "./sanitize";

type PlanState = {
  slots: PlanSlot[];
  /** Marca ou desmarca a peça. Devolve false quando o plano já tem 4 peças e a peça não estava nele. */
  toggle: (pieceId: string, size: Size) => boolean;
  setSize: (pieceId: string, size: Size) => void;
  remove: (pieceId: string) => void;
  clear: () => void;
};

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      slots: [],
      toggle: (pieceId, size) => {
        const { slots } = get();
        if (slots.some((slot) => slot.pieceId === pieceId)) {
          set({ slots: slots.filter((slot) => slot.pieceId !== pieceId) });
          return true;
        }
        if (slots.length >= PLAN_SIZE) return false;
        set({ slots: [...slots, { pieceId, size }] });
        return true;
      },
      setSize: (pieceId, size) =>
        set((state) => ({ slots: state.slots.map((slot) => (slot.pieceId === pieceId ? { ...slot, size } : slot)) })),
      remove: (pieceId) => set((state) => ({ slots: state.slots.filter((slot) => slot.pieceId !== pieceId) })),
      clear: () => set({ slots: [] }),
    }),
    {
      name: "reveste:plan:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ slots: state.slots }),
      merge: (persisted, current) => ({
        ...current,
        slots: sanitizePlan((persisted as { slots?: unknown } | undefined)?.slots),
      }),
    },
  ),
);
