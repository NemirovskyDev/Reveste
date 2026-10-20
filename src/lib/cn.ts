/** Junta classes ignorando valores falsos: cn("a", cond && "b") */
export function cn(...parts: ReadonlyArray<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
