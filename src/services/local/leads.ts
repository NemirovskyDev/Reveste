/** Contatos de marcas e inscrições, guardados localmente até haver backend de e-mail. */
import { z } from "zod";
import { brandContactSchema, emailSchema } from "@/lib/validation";
import { ServiceError } from "../errors";
import type { LeadsService } from "../types";
import { readStoredList, writeStored } from "./storage";

function append(key: string, entry: unknown): void {
  writeStored(key, [...readStoredList(key, z.unknown()), entry]);
}

export function createLocalLeads(now: () => Date = () => new Date()): LeadsService {
  return {
    async sendBrandContact(input) {
      const parsed = brandContactSchema.safeParse(input);
      if (!parsed.success) {
        throw new ServiceError("invalid-input", parsed.error.issues[0]?.message ?? "Confira os dados do contato.");
      }
      append("brand-contacts", { ...parsed.data, receivedAt: now().toISOString() });
    },

    async subscribe(email) {
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) {
        throw new ServiceError("invalid-input", parsed.error.issues[0]?.message ?? "Digite um e-mail válido.");
      }
      append("newsletter", { email: parsed.data, subscribedAt: now().toISOString() });
    },
  };
}
