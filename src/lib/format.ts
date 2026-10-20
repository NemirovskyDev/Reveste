const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const LONG = { day: "numeric", month: "long", year: "numeric" } as const;
const SHORT = { day: "2-digit", month: "2-digit", year: "numeric" } as const;

// Data sem hora (AAAA-MM-DD) é um dia de calendário e não pode andar com o fuso: formata em UTC.
// Instante completo (ISO com hora) mostra o dia de Brasília, que é o que a cliente vive.
const longDay = new Intl.DateTimeFormat("pt-BR", { ...LONG, timeZone: "UTC" });
const shortDay = new Intl.DateTimeFormat("pt-BR", { ...SHORT, timeZone: "UTC" });
const longInstant = new Intl.DateTimeFormat("pt-BR", { ...LONG, timeZone: "America/Sao_Paulo" });
const shortInstant = new Intl.DateTimeFormat("pt-BR", { ...SHORT, timeZone: "America/Sao_Paulo" });

/** Centavos inteiros para "R$ 1.234,56". */
export function formatMoney(cents: number): string {
  return money.format(cents / 100);
}

function parse(iso: string): { date: Date; dayOnly: boolean } {
  const dayOnly = iso.length === 10;
  return { date: new Date(dayOnly ? `${iso}T00:00:00Z` : iso), dayOnly };
}

/** Aceita AAAA-MM-DD ou ISO completo; devolve "18 de novembro de 2026". Datas inválidas viram texto vazio. */
export function formatDateLong(iso: string): string {
  const { date, dayOnly } = parse(iso);
  return Number.isNaN(date.getTime()) ? "" : (dayOnly ? longDay : longInstant).format(date);
}

export function formatDateShort(iso: string): string {
  const { date, dayOnly } = parse(iso);
  return Number.isNaN(date.getTime()) ? "" : (dayOnly ? shortDay : shortInstant).format(date);
}

/** "22640100" para "22640-100". */
export function formatCep(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, 8);
  return clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
}

/** Agrupa o número do cartão de 4 em 4 dígitos, como o cliente digita. */
export function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

/** "1230" para "12/30". */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
