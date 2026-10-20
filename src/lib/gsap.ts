"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registra o ScrollTrigger uma única vez (só no navegador) e devolve o gsap pronto para uso. */
export function getGsap(): { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger } {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
