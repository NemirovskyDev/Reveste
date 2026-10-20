"use client";

import { create } from "zustand";

type ReadyState = { ready: boolean; markReady: () => void };

/**
 * Marca que a leitura do armazenamento local terminou, com ou sem sucesso. Sem localStorage (bloqueio do
 * navegador) o zustand nunca marca "hidratado", então a tela esperaria para sempre; este flag resolve isso.
 */
export const useStoresReady = create<ReadyState>()((set) => ({
  ready: false,
  markReady: () => set({ ready: true }),
}));
