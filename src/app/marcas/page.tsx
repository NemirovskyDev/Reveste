import type { Metadata } from "next";
import { BrandContactForm } from "@/components/brands/BrandContactForm";
import { Container } from "@/components/layout/Container";
import { BRAND_PITCH } from "@/content/brands";

export const metadata: Metadata = {
  title: "Parceria para marcas: dê nova vida ao estoque",
  description:
    "Coloque peças que não venderam para circular no aluguel por assinatura, sem custo de entrada e sem operação extra para a sua equipe.",
  alternates: { canonical: "/marcas" },
  openGraph: { url: "/marcas" },
};

export default function BrandsPage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <header className="pb-10 pt-10 md:pb-14 md:pt-16">
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {BRAND_PITCH.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft md:text-xl">{BRAND_PITCH.subtitle}</p>
        </header>

        <section aria-labelledby="beneficios" className="border-t-2 border-ink py-12">
          <h2 id="beneficios" className="mb-8 text-3xl font-bold">
            O que muda para a sua marca
          </h2>
          <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {BRAND_PITCH.benefits.map((benefit) => (
              <div key={benefit.id}>
                <dt className="font-display text-xl font-extrabold">{benefit.title}</dt>
                <dd className="mt-1 max-w-md text-ink-soft">{benefit.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="como-comecar" className="border-t-2 border-ink py-12">
          <h2 id="como-comecar" className="mb-8 text-3xl font-bold">
            Como começa a parceria
          </h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {BRAND_PITCH.steps.map((step, index) => (
              <li key={step.id} className="grid content-start gap-2">
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full border-2 border-ink bg-mint font-display font-extrabold"
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-extrabold">{step.title}</h3>
                <p className="text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="contato" className="grid grid-cols-[minmax(0,1fr)] gap-10 border-t-2 border-ink py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <h2 id="contato" className="mb-3 text-3xl font-bold">
              Fale com a gente
            </h2>
            <p className="max-w-md text-ink-soft">
              Conte o que você tem em estoque e o que espera da parceria. Respondemos por e-mail.
            </p>
          </div>
          <BrandContactForm />
        </section>
      </Container>
    </main>
  );
}
