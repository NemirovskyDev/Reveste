"use client";

import { useSyncExternalStore } from "react";

type NavigatorExtras = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Aparelho fraco (2 núcleos ou menos, 2 GB de RAM ou menos) ou com economia de dados ligada. */
function isLightDevice(): boolean {
  const nav = navigator as NavigatorExtras;
  return (
    (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
    nav.connection?.saveData === true
  );
}

const subscribeNothing = () => () => {};

/** `true` quando vale poupar vídeo e movimento pesado. No servidor e na hidratação é `false`. */
export function useLightDevice(): boolean {
  return useSyncExternalStore(subscribeNothing, isLightDevice, () => false);
}
