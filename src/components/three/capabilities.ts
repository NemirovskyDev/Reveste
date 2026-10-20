import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

let webgl2Cached: boolean | undefined;

/** Testa WebGL2 uma única vez e devolve o contexto de teste ao navegador (há limite de contextos). */
function hasWebGL2(): boolean {
  if (webgl2Cached !== undefined) return webgl2Cached;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl2Cached = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2Cached = false;
  }
  return webgl2Cached;
}

/** Aparelhos com 2 núcleos ou menos, ou 2 GB de RAM ou menos, ficam com a versão estática. */
function isWeakDevice(): boolean {
  const nav = navigator as NavigatorWithMemory;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
  return false;
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return !window.matchMedia(REDUCED_MOTION).matches && !isWeakDevice() && hasWebGL2();
}

/** No servidor e na hidratação vale `false`: o HTML inicial já traz a versão estática. */
function getServerSnapshot(): boolean {
  return false;
}

/** `true` quando é seguro e desejável montar a cena WebGL. Reage a mudanças de reduced-motion. */
export function useCanRender3D(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
