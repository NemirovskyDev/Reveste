import { useSyncExternalStore } from "react";
import { useMotionOff } from "@/lib/motion";

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

const subscribeNothing = () => () => {};

function getCapable(): boolean {
  return !isWeakDevice() && hasWebGL2();
}

/**
 * `true` quando é seguro e desejável montar a cena WebGL: o aparelho aguenta e as animações não estão desligadas
 * (pelo sistema ou pelo interruptor do site). No servidor e na hidratação vale `false`: o HTML inicial já traz a
 * versão estática.
 */
export function useCanRender3D(): boolean {
  const capable = useSyncExternalStore(subscribeNothing, getCapable, () => false);
  const motionOff = useMotionOff();
  return capable && !motionOff;
}
