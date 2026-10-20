/** Pedidos no armazenamento local, no lugar do backend. Os totais são sempre recalculados a partir das linhas. */
import { z } from "zod";
import { addDaysIso, isoDateInSaoPaulo } from "@/lib/dates";
import { addressSchema } from "@/lib/validation";
import { ServiceError } from "../errors";
import type { CreateOrderInput, Order, OrdersService } from "../types";
import { randomId, readStoredList, writeStored } from "./storage";

const ORDERS_KEY = "orders";
const PLAN_RENEWAL_DAYS = 30;
const MAX_RETURN_DAYS_AHEAD = 90;

const lineSchema = z.object({
  pieceId: z.string(),
  title: z.string(),
  size: z.enum(["PP", "P", "M", "G", "GG"]),
  kind: z.enum(["plan", "rental", "purchase"]),
  days: z.union([z.literal(7), z.literal(14), z.literal(30)]).optional(),
  priceCents: z.number().int().nonnegative(),
});

const orderSchema = z.object({
  id: z.string(),
  number: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  kind: z.enum(["plan", "rental", "purchase", "mixed"]),
  lines: z.array(lineSchema),
  subtotalCents: z.number().int(),
  shippingCents: z.number().int(),
  deliveryDays: z.number().int().positive().optional(),
  totalCents: z.number().int(),
  address: addressSchema,
  payment: z.discriminatedUnion("method", [
    z.object({ method: z.literal("pix"), reference: z.string() }),
    z.object({ method: z.literal("card"), reference: z.string(), last4: z.string() }),
  ]),
  status: z.enum(["confirmado", "em-separacao", "enviado", "entregue", "devolucao-agendada", "devolvido"]),
  returnOn: z.string().optional(),
  renewsOn: z.string().optional(),
});


function orderNumber(existing: readonly Order[]): string {
  const taken = new Set(existing.map((order) => order.number));
  for (;;) {
    const number = `RV-${String(globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0")}`;
    if (!taken.has(number)) return number;
  }
}

export function createLocalOrders(now: () => Date = () => new Date()): OrdersService {
  const readAll = (): Order[] => readStoredList(ORDERS_KEY, orderSchema) as Order[];

  return {
    async create(input: CreateOrderInput) {
      if (input.lines.length === 0) {
        throw new ServiceError("invalid-input", "O pedido precisa de pelo menos uma peça.");
      }
      const all = readAll();
      const created = now();
      const subtotalCents = input.lines.reduce((sum, line) => sum + line.priceCents, 0);
      const kinds = new Set(input.lines.map((line) => line.kind));
      const hasPlan = kinds.has("plan");

      const order: Order = {
        id: randomId(),
        number: orderNumber(all),
        userId: input.userId,
        createdAt: created.toISOString(),
        kind: kinds.size > 1 ? "mixed" : (input.lines[0].kind as Order["kind"]),
        lines: input.lines,
        subtotalCents,
        shippingCents: input.shipping.cents,
        deliveryDays: input.shipping.days,
        totalCents: subtotalCents + input.shipping.cents,
        address: input.address,
        payment: input.payment,
        status: "confirmado",
        ...(hasPlan ? { renewsOn: addDaysIso(isoDateInSaoPaulo(created), PLAN_RENEWAL_DAYS) } : {}),
      };
      writeStored(ORDERS_KEY, [...all, order]);
      return order;
    },

    async list(userId) {
      return readAll()
        .filter((order) => order.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(userId, id) {
      return readAll().find((order) => order.id === id && order.userId === userId) ?? null;
    },

    async scheduleReturn(userId, id, returnOn) {
      const all = readAll();
      const index = all.findIndex((order) => order.id === id && order.userId === userId);
      if (index === -1) throw new ServiceError("not-found", "Não encontramos esse pedido.");

      const parsed = /^\d{4}-\d{2}-\d{2}$/.test(returnOn) ? new Date(`${returnOn}T00:00:00Z`) : null;
      if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== returnOn) {
        throw new ServiceError("invalid-input", "Escolha uma data válida para a devolução.");
      }
      const today = isoDateInSaoPaulo(now());
      const limit = addDaysIso(today, MAX_RETURN_DAYS_AHEAD);
      if (returnOn < today || returnOn > limit) {
        throw new ServiceError("invalid-input", "Escolha uma data a partir de hoje e dentro dos próximos 90 dias.");
      }

      const updated: Order = { ...all[index], returnOn, status: "devolucao-agendada" };
      all[index] = updated;
      writeStored(ORDERS_KEY, all);
      return updated;
    },
  };
}
