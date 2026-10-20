/**
 * Pagamentos locais, no lugar do gateway. Cartão: valida o formato e aprova, exceto o cartão de teste
 * terminado em 0002, que a operadora "recusa". Pix: gera um BR Code com o valor do pedido. Nada do
 * cartão é guardado nem devolvido além dos 4 últimos dígitos.
 */
import { cardSchema } from "@/lib/validation";
import { buildPixPayload } from "../pix";
import type { PaymentsService } from "../types";
import { randomId } from "./storage";

const DECLINED_SUFFIX = "0002";
// Chave aleatória de Pix: até existir uma conta de recebimento real, o código gerado não leva a ninguém.
const STAND_IN_PIX_KEY = "00000000-0000-4000-8000-000000000000";

export function createLocalPayments({ delayMs = 900 }: { delayMs?: number } = {}): PaymentsService {
  const wait = () => (delayMs > 0 ? new Promise<void>((resolve) => setTimeout(resolve, delayMs)) : Promise.resolve());

  return {
    async authorize(request) {
      if (!Number.isInteger(request.amountCents) || request.amountCents <= 0) {
        return { ok: false, reason: "O valor do pedido é inválido. Volte à sacola e tente de novo." };
      }
      await wait();
      const reference = randomId();

      if (request.method === "pix") {
        const pixCode = buildPixPayload({
          key: STAND_IN_PIX_KEY,
          merchantName: "Reveste",
          city: "Rio de Janeiro",
          amountCents: request.amountCents,
          txid: reference.replace(/-/g, ""),
        });
        return { ok: true, method: "pix", reference, pixCode };
      }

      const parsed = cardSchema.safeParse(request.card);
      if (!parsed.success) {
        return { ok: false, reason: parsed.error.issues[0]?.message ?? "Confira os dados do cartão." };
      }
      if (parsed.data.number.endsWith(DECLINED_SUFFIX)) {
        return { ok: false, reason: "O banco recusou o cartão. Tente outro cartão ou pague com Pix." };
      }
      return { ok: true, method: "card", reference, last4: parsed.data.number.slice(-4) };
    },
  };
}
