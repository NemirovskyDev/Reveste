"use client";

import { useMotionOff } from "./motion";

/**
 * Quando as animações devem ficar desligadas: o sistema pediu menos movimento ou a pessoa desligou no site
 * (falso no servidor e na hidratação; ver `useMotionOff`).
 */
export function usePrefersReducedMotion(): boolean {
  return useMotionOff();
}
