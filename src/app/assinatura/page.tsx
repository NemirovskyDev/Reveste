import type { Metadata } from "next";
import { Container, PageIntro } from "@/components/layout/Container";
import { PlanBuilder } from "@/components/plan/PlanBuilder";

export const metadata: Metadata = {
  title: "Assinatura de roupas: monte seu plano de 4 peças",
  description:
    "Aluguel de roupas por assinatura: 4 peças por mês numa mensalidade, com 5% de desconto na linha Essencial e 10% na Premium. Frete grátis.",
  alternates: { canonical: "/assinatura" },
  openGraph: { url: "/assinatura" },
};

const FACTS = [
  { title: "5% e 10% de desconto", text: "5% nas peças Essencial e 10% nas Premium, sobre o aluguel de 30 dias." },
  { title: "Frete grátis", text: "A entrega do plano não tem custo." },
  { title: "Troca todo mês", text: "Na renovação você devolve as peças e escolhe outras 4." },
] as const;

export default function PlanPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro
          title="Monte seu plano de 4 peças"
          lead="Uma mensalidade, quatro looks. Escolha as peças e veja o valor mudar na hora."
        />
        <dl className="mb-12 grid gap-4 border-y-2 border-ink py-6 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.title}>
              <dt className="font-display text-lg font-extrabold">{fact.title}</dt>
              <dd className="text-ink-soft">{fact.text}</dd>
            </div>
          ))}
        </dl>
        <PlanBuilder />
      </Container>
    </main>
  );
}
