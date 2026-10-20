/**
 * Autenticação local, no lugar do backend. A senha nunca é guardada: só um hash PBKDF2-SHA256 com
 * sal aleatório, suficiente para conferir o login neste navegador. Com backend, esta troca por chamadas
 * de API e o contrato (`AuthService`) continua o mesmo.
 */
import { z } from "zod";
import { loginSchema, signUpSchema } from "@/lib/validation";
import { ServiceError } from "../errors";
import type { AuthService, User } from "../types";
import { randomId, readStored, readStoredList, removeStored, writeStored } from "./storage";

const ITERATIONS = 150_000;
const ACCOUNTS_KEY = "accounts";
const SESSION_KEY = "session";

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  salt: z.string(),
  hash: z.string(),
});
const sessionSchema = z.object({ userId: z.string() }).nullable();

type Account = z.infer<typeof accountSchema>;

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text: string): Uint8Array => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const subtle = globalThis.crypto.subtle;
  const key = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: ITERATIONS },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

const publicUser = ({ id, name, email }: Account): User => ({ id, name, email });
const readAccounts = () => readStoredList(ACCOUNTS_KEY, accountSchema);

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Confira os dados informados.";
}

export function createLocalAuth(): AuthService {
  return {
    async signUp(input) {
      const parsed = signUpSchema.safeParse(input);
      if (!parsed.success) throw new ServiceError("invalid-input", firstIssue(parsed.error));
      const { name, email, password } = parsed.data;

      const accounts = readAccounts();
      if (accounts.some((account) => account.email === email)) {
        throw new ServiceError("email-in-use", "Já existe uma conta com esse e-mail. Entre ou use outro e-mail.");
      }

      const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
      const account: Account = { id: randomId(), name, email, salt: toBase64(salt), hash: await hashPassword(password, salt) };
      writeStored(ACCOUNTS_KEY, [...accounts, account]);
      writeStored(SESSION_KEY, { userId: account.id });
      return publicUser(account);
    },

    async signIn(input) {
      const parsed = loginSchema.safeParse(input);
      if (!parsed.success) throw new ServiceError("invalid-input", firstIssue(parsed.error));
      const { email, password } = parsed.data;

      // Mesma mensagem para e-mail desconhecido e senha errada: não revela quais e-mails têm conta.
      const failure = new ServiceError("invalid-credentials", "E-mail ou senha incorretos. Confira e tente de novo.");
      const account = readAccounts().find((candidate) => candidate.email === email);
      if (!account) throw failure;
      if ((await hashPassword(password, fromBase64(account.salt))) !== account.hash) throw failure;

      writeStored(SESSION_KEY, { userId: account.id });
      return publicUser(account);
    },

    async signOut() {
      removeStored(SESSION_KEY);
    },

    async getSession() {
      const session = readStored(SESSION_KEY, sessionSchema, null);
      if (!session) return null;
      const account = readAccounts().find((candidate) => candidate.id === session.userId);
      return account ? publicUser(account) : null;
    },
  };
}
