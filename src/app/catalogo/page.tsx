import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, PageIntro } from "@/components/layout/Container";
import { CatalogBrowser } from "@/components/piece/CatalogBrowser";
import { PieceCard } from "@/components/piece/PieceCard";
import { CATALOG } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Catálogo de roupas de marca para alugar",
  description:
    "Alugue camisas, vestidos, blazers e calças de C&A, Renner, Riachuelo, Zara, Mango e Farm por 7, 14 ou 30 dias, ou monte seu plano mensal.",
  alternates: { canonical: "/catalogo" },
  openGraph: { url: "/catalogo" },
};

/**
 * Enquanto o navegador monta os filtros (que dependem da URL), o servidor já entrega a lista completa de
 * peças: o HTML tem todos os links para as páginas de peça, para buscadores e para quem está sem JavaScript.
 */
function CatalogList() {
  return (
    <div>
      <h2 className="sr-only">Peças disponíveis</h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {CATALOG.map((piece) => (
          <li key={piece.id}>
            <PieceCard piece={piece} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro
          title="Catálogo"
          lead="Peças de marcas que você já conhece. Alugue por 7, 14 ou 30 dias, ou escolha 4 para o plano mensal."
        />
        <Suspense fallback={<CatalogList />}>
          <CatalogBrowser pieces={CATALOG} />
        </Suspense>
      </Container>
    </main>
  );
}
