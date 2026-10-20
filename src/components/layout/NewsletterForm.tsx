"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { emailSchema } from "@/lib/validation";
import { services, ServiceError } from "@/services";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "done" } | { kind: "error"; message: string };

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setState({ kind: "error", message: parsed.error.issues[0].message });
      return;
    }
    setState({ kind: "loading" });
    try {
      await services.leads.subscribe(parsed.data);
      setEmail("");
      setState({ kind: "done" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof ServiceError ? error.message : "Não foi possível cadastrar agora. Tente de novo.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3" aria-label="Receber novidades">
      <TextField
        label="Seu e-mail"
        required
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (state.kind !== "idle") setState({ kind: "idle" });
        }}
        error={state.kind === "error" ? state.message : undefined}
      />
      <Button type="submit" variant="primary" disabled={state.kind === "loading"}>
        {state.kind === "loading" ? "Cadastrando…" : "Receber novidades"}
      </Button>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
        {state.kind === "done" ? "Pronto! Você vai receber as novidades da Reveste." : ""}
      </p>
    </form>
  );
}
