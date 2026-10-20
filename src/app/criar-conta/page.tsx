import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-md rounded-card border-2 border-ink bg-cream p-6 md:p-10">
          <h1 className="mb-2 text-4xl font-extrabold tracking-[-0.03em]">Criar conta</h1>
          <p className="mb-8 text-ink-soft">Leva menos de um minuto. Depois é só escolher suas peças.</p>
          <Suspense fallback={<p className="text-ink-soft">Carregando…</p>}>
            <AuthForm mode="criar" />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
