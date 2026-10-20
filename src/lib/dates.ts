/**
 * Datas de negócio (vencimento do plano, limite de devolução) valem no dia de Brasília: um pedido feito às
 * 22h não pode "virar" o dia seguinte só porque em UTC já é madrugada.
 */
const SAO_PAULO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-10-19": o dia do calendário em Brasília para esse instante. */
export function isoDateInSaoPaulo(date: Date): string {
  return SAO_PAULO.format(date); // en-CA já devolve AAAA-MM-DD
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Soma dias a uma data AAAA-MM-DD sem depender de fuso (conta em UTC ao meio-dia). */
export function addDaysIso(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T12:00:00Z`).getTime();
  return new Date(base + days * DAY_MS).toISOString().slice(0, 10);
}
