/**
 * Armazenamento dos adaptadores locais: localStorage com prefixo e versão, e memória como reserva
 * quando o navegador bloqueia o armazenamento (modo privado restrito, por exemplo).
 */
import type { ZodType } from "zod";

const PREFIX = "reveste:v1:";
const memory = new Map<string, string>();

function backend(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    const probe = "__reveste_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Lê e valida; qualquer valor ausente, corrompido ou fora do formato vira `fallback`. */
export function readStored<T>(key: string, schema: ZodType<T>, fallback: T): T {
  const store = backend();
  const raw = store ? store.getItem(PREFIX + key) : (memory.get(key) ?? null);
  if (raw === null) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Lê uma lista item a item: um registro inválido (schema que evoluiu, dado corrompido) é descartado sem levar
 * os outros junto. Assim a próxima gravação não apaga pedidos, contas ou contatos que ainda estão bons.
 */
export function readStoredList<T>(key: string, itemSchema: ZodType<T>): T[] {
  const store = backend();
  const raw = store ? store.getItem(PREFIX + key) : (memory.get(key) ?? null);
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = itemSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function writeStored(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  const store = backend();
  if (store) {
    try {
      store.setItem(PREFIX + key, raw);
      return;
    } catch {
      // cota cheia: cai para a memória
    }
  }
  memory.set(key, raw);
}

export function removeStored(key: string): void {
  const store = backend();
  try {
    store?.removeItem(PREFIX + key);
  } catch {
    // ignora
  }
  memory.delete(key);
}

export function randomId(): string {
  return globalThis.crypto.randomUUID();
}
