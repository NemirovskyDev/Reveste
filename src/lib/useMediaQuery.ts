"use client";

import { useSyncExternalStore } from "react";

/**
 * Resultado de uma media query. No servidor e na hidratação vale `false` (mesmo HTML dos dois lados);
 * depois da hidratação o React relê o valor real e re-renderiza se for diferente.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
