"use client";

import { create } from "zustand";
import type { LoginInput, SignUpInput } from "@/lib/validation";
import { services } from "@/services";
import type { User } from "@/services/types";

type SessionState = {
  user: User | null;
  /** `idle` até a primeira leitura da sessão terminar; evita piscar "Entrar" para quem já está logada. */
  status: "idle" | "ready";
  hydrate: () => Promise<void>;
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => Promise<void>;
};

export const useSession = create<SessionState>()((set) => ({
  user: null,
  status: "idle",
  hydrate: async () => {
    const user = await services.auth.getSession();
    set({ user, status: "ready" });
  },
  signIn: async (input) => {
    const user = await services.auth.signIn(input);
    set({ user, status: "ready" });
    return user;
  },
  signUp: async (input) => {
    const user = await services.auth.signUp(input);
    set({ user, status: "ready" });
    return user;
  },
  signOut: async () => {
    await services.auth.signOut();
    set({ user: null, status: "ready" });
  },
}));
