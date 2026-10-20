"use client";

import { useMediaQuery } from "./useMediaQuery";

/** Preferência de "reduzir movimento" do sistema (falsa no servidor e na hidratação; ver `useMediaQuery`). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
