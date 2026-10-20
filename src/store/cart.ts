"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RentalDays } from "@/lib/pricing";
import { sanitizeCart, type CartLine } from "./sanitize";

type CartState = {
  lines: CartLine[];
  /** Adiciona o aluguel avulso ou a compra (`buy`); se a peça já está na sacola, troca tamanho, prazo e modo. */
  add: (line: CartLine) => void;
  remove: (pieceId: string) => void;
  setDays: (pieceId: string, days: RentalDays) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => ({ lines: [...state.lines.filter((item) => item.pieceId !== line.pieceId), line] })),
      remove: (pieceId) => set((state) => ({ lines: state.lines.filter((item) => item.pieceId !== pieceId) })),
      setDays: (pieceId, days) =>
        set((state) => ({ lines: state.lines.map((item) => (item.pieceId === pieceId && !item.buy ? { ...item, days } : item)) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "reveste:cart:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // A hidratação é manual (StoreHydrator) para o primeiro render do cliente bater com o do servidor.
      skipHydration: true,
      partialize: (state) => ({ lines: state.lines }),
      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeCart((persisted as { lines?: unknown } | undefined)?.lines),
      }),
    },
  ),
);
