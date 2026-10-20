import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderView } from "@/components/account/OrderView";
import { Container, PageIntro } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro title="Seu pedido" />
        <Suspense fallback={<p className="py-10 text-ink-soft">Carregando seu pedido…</p>}>
          <OrderView />
        </Suspense>
      </Container>
    </main>
  );
}
