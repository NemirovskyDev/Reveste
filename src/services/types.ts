/**
 * Contratos dos serviços. As telas só conhecem estas interfaces; hoje cada uma tem um adaptador
 * local (src/services/local), e quando o backend existir basta trocar a implementação em `index.ts`.
 */
import type { Address, BrandContactInput, CardInput, LoginInput, SignUpInput } from "@/lib/validation";
import type { RentalDays } from "@/lib/pricing";
import type { Size } from "@/data/catalog";

export type User = { id: string; name: string; email: string };

export type AuthService = {
  signUp(input: SignUpInput): Promise<User>;
  signIn(input: LoginInput): Promise<User>;
  signOut(): Promise<void>;
  getSession(): Promise<User | null>;
};

export type OrderLine = {
  pieceId: string;
  /** Texto pronto para exibir, ex.: "Zara Blazer estruturado". Guardado no pedido para não mudar se o catálogo mudar. */
  title: string;
  size: Size;
  kind: "plan" | "rental";
  /** Só no aluguel avulso. */
  days?: RentalDays;
  priceCents: number;
};

export type ShippingQuote = { cents: number; days: number; label: string };

export type PaymentSummary =
  | { method: "pix"; reference: string }
  | { method: "card"; reference: string; last4: string };

export type OrderStatus = "confirmado" | "em-separacao" | "enviado" | "entregue" | "devolucao-agendada" | "devolvido";

export type Order = {
  id: string;
  /** Número exibido ao cliente, ex.: RV-482913. */
  number: string;
  userId: string;
  createdAt: string;
  kind: "plan" | "rental" | "mixed";
  lines: OrderLine[];
  subtotalCents: number;
  shippingCents: number;
  /** Prazo de entrega prometido na hora da compra, em dias úteis. Pedidos antigos podem não ter. */
  deliveryDays?: number;
  totalCents: number;
  address: Address;
  payment: PaymentSummary;
  status: OrderStatus;
  /** Data (AAAA-MM-DD) escolhida para a devolução. */
  returnOn?: string;
  /** Data (AAAA-MM-DD) da próxima renovação, quando há plano. */
  renewsOn?: string;
};

export type CreateOrderInput = {
  userId: string;
  lines: OrderLine[];
  address: Address;
  shipping: ShippingQuote;
  payment: PaymentSummary;
};

export type OrdersService = {
  create(input: CreateOrderInput): Promise<Order>;
  list(userId: string): Promise<Order[]>;
  get(userId: string, id: string): Promise<Order | null>;
  scheduleReturn(userId: string, id: string, returnOn: string): Promise<Order>;
};

export type PaymentRequest =
  | { method: "pix"; amountCents: number }
  | { method: "card"; amountCents: number; card: CardInput };

export type PaymentResult =
  | { ok: true; method: "pix"; reference: string; pixCode: string }
  | { ok: true; method: "card"; reference: string; last4: string }
  | { ok: false; reason: string };

export type PaymentsService = {
  authorize(request: PaymentRequest): Promise<PaymentResult>;
};

export type CepLookup = { street: string; district: string; city: string; state: string };

export type ShippingService = {
  /** Devolve `null` quando o CEP não existe; lança ServiceError("cep-unavailable") se a consulta falhar. */
  lookupCep(cep: string): Promise<CepLookup | null>;
  quote(cep: string, kind: "plan" | "rental", pieceCount: number): Promise<ShippingQuote>;
};

export type LeadsService = {
  sendBrandContact(input: BrandContactInput): Promise<void>;
  subscribe(email: string): Promise<void>;
};

export type Services = {
  auth: AuthService;
  orders: OrdersService;
  payments: PaymentsService;
  shipping: ShippingService;
  leads: LeadsService;
};
