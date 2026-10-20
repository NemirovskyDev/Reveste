/** Frete e consulta de CEP. O CEP vem do ViaCEP; o preço do frete é uma tabela local até haver transportadora. */
import { onlyDigits } from "@/lib/validation";
import { ServiceError } from "../errors";
import type { ShippingService } from "../types";

const BASE_CENTS = 1490;
const EXTRA_PIECE_CENTS = 300;
const LOOKUP_TIMEOUT_MS = 5000;

// Prazo em dias úteis pelo primeiro dígito do CEP (região postal).
const DAYS_BY_REGION: Record<string, number> = {
  "0": 3, "1": 3, "2": 2, "3": 3, "4": 4, "5": 5, "6": 7, "7": 5, "8": 4, "9": 5,
};

export function createShipping(): ShippingService {
  return {
    async lookupCep(cep) {
      const digits = onlyDigits(cep);
      if (digits.length !== 8) return null;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal });
        if (!response.ok) throw new Error(`ViaCEP respondeu ${response.status}`);
        const data = (await response.json()) as Record<string, unknown>;
        if (data.erro) return null;
        const text = (value: unknown) => (typeof value === "string" ? value : "");
        return {
          street: text(data.logradouro),
          district: text(data.bairro),
          city: text(data.localidade),
          state: text(data.uf),
        };
      } catch {
        throw new ServiceError(
          "cep-unavailable",
          "Não conseguimos consultar o CEP agora. Preencha o endereço manualmente.",
        );
      } finally {
        clearTimeout(timer);
      }
    },

    async quote(cep, kind, pieceCount) {
      const digits = onlyDigits(cep);
      if (digits.length !== 8) throw new ServiceError("invalid-input", "Digite um CEP com 8 números.");
      const days = DAYS_BY_REGION[digits[0]] ?? 5;
      const label = `Entrega em até ${days} dias úteis`;
      if (kind === "plan") return { cents: 0, days, label: `Frete grátis. ${label}` };
      const cents = BASE_CENTS + EXTRA_PIECE_CENTS * Math.max(0, pieceCount - 1);
      return { cents, days, label };
    },
  };
}
