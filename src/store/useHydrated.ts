"use client";

import { useStoresReady } from "./ready";

/** Verdadeiro quando sacola e plano já foram lidos do armazenamento; evita piscar "sacola vazia". */
export function useBagHydrated(): boolean {
  return useStoresReady((state) => state.ready);
}
