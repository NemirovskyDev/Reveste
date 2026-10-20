import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { Container, PageIntro } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Pagamento",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro title="Pagamento" />
        <CheckoutView />
      </Container>
    </main>
  );
}
