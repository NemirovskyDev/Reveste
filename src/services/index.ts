/**
 * Ponto único de acesso aos serviços. Hoje todos usam adaptadores locais; ao criar o backend, troque
 * a implementação aqui e as telas não mudam.
 */
import { createLocalAuth } from "./local/auth";
import { createLocalLeads } from "./local/leads";
import { createLocalOrders } from "./local/orders";
import { createLocalPayments } from "./local/payments";
import { createShipping } from "./local/shipping";
import type { Services } from "./types";

export const services: Services = {
  auth: createLocalAuth(),
  orders: createLocalOrders(),
  payments: createLocalPayments(),
  shipping: createShipping(),
  leads: createLocalLeads(),
};

export { ServiceError } from "./errors";
export type * from "./types";
