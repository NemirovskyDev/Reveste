"use client";

import { useSyncExternalStore } from "react";

/**
 * Preferência de movimento. Há duas fontes: o sistema (`prefers-reduced-motion`) e um interruptor do próprio site,
 * guardado no navegador. Quando qualquer uma pede menos movimento, as animações ficam desligadas.
 */
const KEY = "reveste:motion";
const EVENT = "reveste:motion-change";
const QUERY = "(prefers-reduced-motion: reduce)";

/** Texto do script que roda no <head> antes da pintura, para a escolha valer desde o primeiro quadro. */
export const MOTION_INIT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(KEY)})==="off")document.documentElement.dataset.motion="off"}catch(e){}`;

export function readUserMotionOff(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "off";
  } catch {
    return false;
  }
}

export function readOsReducedMotion(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** `true` quando as animações devem ficar desligadas, por escolha do sistema ou do site. */
export function readMotionOff(): boolean {
  return readOsReducedMotion() || readUserMotionOff();
}

/** Liga ou desliga as animações no site (a escolha fica guardada neste navegador). */
export function setUserMotionOff(off: boolean): void {
  try {
    if (off) window.localStorage.setItem(KEY, "off");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Sem armazenamento (modo privado, bloqueio): a escolha vale só até recarregar a página.
  }
  if (off) document.documentElement.dataset.motion = "off";
  else delete document.documentElement.dataset.motion;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Animações desligadas (sistema ou site). Falso no servidor e na hidratação, como `useMediaQuery`. */
export function useMotionOff(): boolean {
  return useSyncExternalStore(subscribe, readMotionOff, () => false);
}

/** O sistema pede menos movimento. */
export function useOsReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readOsReducedMotion, () => false);
}

/** O interruptor do site está em "desligadas". */
export function useUserMotionOff(): boolean {
  return useSyncExternalStore(subscribe, readUserMotionOff, () => false);
}
