import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-md rounded-card border-2 border-ink bg-cream p-6 md:p-10">
          <h1 className="mb-2 text-4xl font-extrabold tracking-[-0.03em]">Entrar</h1>
          <p className="mb-8 text-ink-soft">Acesse seus pedidos, seu plano e as devoluções.</p>
          <Suspense fallback={<p className="text-ink-soft">Carregando…</p>}>
            <AuthForm mode="entrar" />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
