import type { Metadata } from "next";
import { BagView } from "@/components/bag/BagView";
import { Container, PageIntro } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Sacola",
  robots: { index: false },
};

export default function BagPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro title="Sacola" />
        <BagView />
      </Container>
    </main>
  );
}
