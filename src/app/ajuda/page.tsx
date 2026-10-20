import type { Metadata } from "next";
import { Container, PageIntro } from "@/components/layout/Container";
import { FaqList } from "@/components/help/FaqList";
import { FAQ, FAQ_CATEGORY_LABEL, type FaqCategory } from "@/content/faq";
import { RULES_TABLE, SUBSCRIPTION_RULES } from "@/content/rules";

export const metadata: Metadata = {
  title: "Ajuda: assinatura, aluguel, devolução e pagamento",
  description:
    "Tire dúvidas sobre o aluguel de roupas por assinatura: como funciona o plano, prazos, devolução, pagamento, atraso, dano e compra da peça.",
  alternates: { canonical: "/ajuda" },
  openGraph: { url: "/ajuda" },
};

const ORDER: readonly FaqCategory[] = ["assinatura", "aluguel", "devolucao", "pagamento", "marcas"];

export default function HelpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <PageIntro
          title="Ajuda"
          lead="Respostas sobre o plano, o aluguel avulso, a devolução e o pagamento."
        />

        <nav aria-label="Seções da ajuda" className="mb-12 flex flex-wrap gap-2">
          {ORDER.map((category) => (
            <a
              key={category}
              href={`#${category}`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 font-bold hover:bg-lavender/60"
            >
              {FAQ_CATEGORY_LABEL[category]}
            </a>
          ))}
          <a href="#regras" className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 font-bold hover:bg-lavender/60">
            Atraso, dano e compra
          </a>
        </nav>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-14">
          {ORDER.map((category) => {
            const items = FAQ.filter((item) => item.category === category);
            return (
              <section key={category} id={category} aria-labelledby={`${category}-titulo`} className="scroll-mt-32">
                <h2 id={`${category}-titulo`} className="mb-5 text-3xl font-bold">
                  {FAQ_CATEGORY_LABEL[category]}
                </h2>
                <FaqList items={items} />
              </section>
            );
          })}

          <section id="regras" aria-labelledby="regras-titulo" className="scroll-mt-32">
            <h2 id="regras-titulo" className="mb-3 text-3xl font-bold">
              Atraso, dano e compra
            </h2>
            <p className="mb-6 max-w-2xl text-ink-soft">
              Cuidar da peça mantém a roda girando. Estas são as regras e um exemplo calculado.
            </p>
            <div
              role="region"
              aria-label="Regras de atraso, dano e compra"
              tabIndex={0}
              className="overflow-x-auto rounded-card border-2 border-ink bg-cream"
            >
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <caption className="sr-only">Regras comerciais com exemplo calculado</caption>
                <thead className="bg-lavender">
                  <tr>
                    <th scope="col" className="border-b-2 border-ink p-4">Situação</th>
                    <th scope="col" className="border-b-2 border-ink p-4">Como é cobrado</th>
                    <th scope="col" className="border-b-2 border-ink p-4">Exemplo</th>
                  </tr>
                </thead>
                <tbody>
                  {RULES_TABLE.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-0">
                      <th scope="row" className="p-4 align-top font-bold">{row.situation}</th>
                      <td className="p-4 align-top">{row.how}</td>
                      <td className="p-4 align-top font-bold">{row.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-6 grid max-w-3xl list-disc gap-2 pl-6 text-ink-soft">
              {SUBSCRIPTION_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </Container>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
