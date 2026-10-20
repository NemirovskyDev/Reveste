"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { safeNextPath } from "@/lib/site";
import { loginSchema, signUpSchema } from "@/lib/validation";
import { ServiceError } from "@/services";
import { useSession } from "@/store/session";

type Mode = "entrar" | "criar";
type Values = { name?: string; email: string; password: string };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const user = useSession((state) => state.user);
  const signIn = useSession((state) => state.signIn);
  const signUp = useSession((state) => state.signUp);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const signingUp = mode === "criar";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(signingUp ? signUpSchema : loginSchema) as never,
    defaultValues: { name: "", email: "", password: "" },
  });

  // Quem já está logada vai direto para o destino.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function onSubmit(values: Values) {
    setFormError("");
    try {
      if (signingUp) await signUp({ name: values.name ?? "", email: values.email, password: values.password });
      else await signIn({ email: values.email, password: values.password });
      router.replace(next);
    } catch (error) {
      setFormError(error instanceof ServiceError ? error.message : "Não foi possível continuar agora. Tente de novo.");
    }
  }

  const otherHref = `${signingUp ? "/entrar" : "/criar-conta"}${next !== "/conta" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label={signingUp ? "Criar conta" : "Entrar"}>
      {formError && (
        <p role="alert" className="rounded-control border-2 border-danger bg-danger-soft p-4 font-medium text-danger">
          {formError}
        </p>
      )}

      {signingUp && (
        <TextField
          label="Nome"
          required
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
      )}
      <TextField
        label="E-mail"
        required
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="grid gap-2">
        <TextField
          label="Senha"
          required
          type={showPassword ? "text" : "password"}
          autoComplete={signingUp ? "new-password" : "current-password"}
          hint={signingUp ? "Use 8 ou mais caracteres." : undefined}
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          variant="ghost"
          size="sm"
          className="justify-self-start"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((value) => !value)}
        >
          Mostrar senha
        </Button>
      </div>

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Aguarde…" : signingUp ? "Criar conta" : "Entrar"}
      </Button>

      <p className="text-center text-ink-soft">
        {signingUp ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={otherHref} className="font-bold text-ink underline underline-offset-4">
          {signingUp ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </form>
  );
}
