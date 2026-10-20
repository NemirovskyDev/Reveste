import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";
import { Container, PageIntro } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro title="Minha conta" />
        <AccountView />
      </Container>
    </main>
  );
}
