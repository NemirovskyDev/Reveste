import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

// O Next já marca a 404 como noindex; repetir aqui duplicaria a meta.
export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="grid justify-items-start gap-6 py-24">
        <p className="font-display text-7xl font-extrabold tracking-[-0.04em]">404</p>
        <h1 className="text-4xl font-extrabold tracking-[-0.03em]">Essa página não existe</h1>
        <p className="max-w-lg text-lg text-ink-soft">O endereço pode ter mudado ou a peça saiu do catálogo.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/catalogo">Ver o catálogo</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Voltar ao início
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
