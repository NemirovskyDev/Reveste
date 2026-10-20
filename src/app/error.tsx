"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Com backend, este é o ponto para enviar o erro a um serviço de monitoramento.
    console.error(error);
  }, [error]);

  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="grid justify-items-start gap-6 py-24">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em]">Algo deu errado</h1>
        <p className="max-w-lg text-lg text-ink-soft">Não conseguimos carregar esta página. Tente de novo em instantes.</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>Tentar de novo</Button>
          <ButtonLink href="/" variant="secondary">
            Voltar ao início
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
