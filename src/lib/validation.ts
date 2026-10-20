/**
 * Validação de entradas (Zod 4). Toda entrada do usuário passa por aqui antes de chegar a um serviço.
 * As mensagens são escritas para quem digitou: dizem o que está errado e como corrigir.
 */
import { z } from "zod";

const MAX_YEARS_AHEAD = 20;

export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** MM/AA. O mês atual ainda vale; `now` entra por parâmetro para o teste. */
export function expiryValid(value: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const current = now.getFullYear() * 12 + now.getMonth();
  const informed = year * 12 + (month - 1);
  return informed >= current && year <= now.getFullYear() + MAX_YEARS_AHEAD;
}

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Digite seu nome, com 2 letras ou mais.")
  .max(80, "Use no máximo 80 caracteres no nome.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Esse e-mail é longo demais.")
  .pipe(z.email({ error: "Digite um e-mail válido, como nome@exemplo.com." }));

export const passwordSchema = z
  .string()
  .min(8, "Use uma senha com 8 ou mais caracteres.")
  .max(128, "Use no máximo 128 caracteres na senha.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Digite sua senha."),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const cepSchema = z
  .string()
  .transform(onlyDigits)
  .refine((value) => value.length === 8, "Digite um CEP com 8 números.");

export const stateSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, "Use a sigla do estado com 2 letras, como RJ.");

export const addressSchema = z.object({
  cep: cepSchema,
  street: z.string().trim().min(3, "Digite a rua ou avenida.").max(120),
  number: z.string().trim().min(1, "Digite o número.").max(10, "Use até 10 caracteres no número."),
  complement: z.string().trim().max(60, "Use até 60 caracteres no complemento.").optional(),
  district: z.string().trim().min(2, "Digite o bairro.").max(80),
  city: z.string().trim().min(2, "Digite a cidade.").max(80),
  state: stateSchema,
});

export const cardSchema = z.object({
  holder: z.string().trim().min(2, "Digite o nome como está no cartão.").max(80),
  number: z
    .string()
    .transform(onlyDigits)
    .refine((value) => value.length >= 13 && value.length <= 19 && luhnValid(value), {
      error: "O número do cartão parece incorreto. Confira os dígitos e tente de novo.",
    }),
  expiry: z.string().refine((value) => expiryValid(value), {
    error: "Use MM/AA com uma data que ainda não venceu.",
  }),
  cvv: z.string().regex(/^\d{3,4}$/, "O CVV tem 3 ou 4 dígitos."),
});

// Mesmas faixas de `STOCK_SIZE_OPTIONS` (src/content/brands.ts), que alimenta o formulário.
export const STOCK_SIZES = ["ate-100", "100-500", "500-2000", "mais-2000"] as const;

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => value === "" || [10, 11].includes(onlyDigits(value).length), {
    error: "Digite o telefone com DDD, por exemplo (21) 99999-0000.",
  });

export const brandContactSchema = z.object({
  brandName: z.string().trim().min(2, "Digite o nome da marca.").max(80),
  contactName: nameSchema,
  email: emailSchema,
  phone: optionalPhone,
  stockSize: z.union([z.enum(STOCK_SIZES), z.literal("")]),
  message: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais, com pelo menos 10 caracteres.")
    .max(1000, "Use no máximo 1.000 caracteres na mensagem."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type AddressInput = z.input<typeof addressSchema>;
export type Address = z.output<typeof addressSchema>;
export type CardInput = z.input<typeof cardSchema>;
export type BrandContactInput = z.input<typeof brandContactSchema>;
