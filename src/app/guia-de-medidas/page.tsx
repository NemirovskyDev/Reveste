import type { Metadata } from "next";
import { SizeFinder } from "@/components/help/SizeFinder";
import { Container } from "@/components/layout/Container";
import { SIZES } from "@/data/catalog";
import { MEASURES, MEASURE_LABEL, rangeText, type SizeKind } from "@/lib/sizeGuide";

export const metadata: Metadata = {
  title: "Guia de medidas: descubra seu tamanho",
  description:
    "Meça busto ou peito, cintura e quadril, veja a tabela de PP a GG e descubra o tamanho ideal antes de alugar ou comprar uma peça na Reveste.",
  alternates: { canonical: "/guia-de-medidas" },
  openGraph: { url: "/guia-de-medidas" },
};

const KINDS: readonly { id: SizeKind; title: string }[] = [
  { id: "feminino", title: "Tabela feminina (em cm)" },
  { id: "masculino", title: "Tabela masculina (em cm)" },
];

const HOW_TO = [
  { id: "busto", title: "Busto ou peito", text: "Passe a fita na parte mais larga do peito, por cima das axilas, sem apertar." },
  { id: "cintura", title: "Cintura", text: "Meça a parte mais fina do tronco, que fica um pouco acima do umbigo." },
  { id: "quadril", title: "Quadril", text: "Meça a parte mais larga do quadril, passando pelo bumbum." },
] as const;

export default function SizeGuidePage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <header className="pb-10 pt-10 md:pb-14 md:pt-16">
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Descubra o seu tamanho
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft md:text-xl">
            Use uma fita métrica, digite as suas medidas e veja o tamanho sugerido. A tabela é uma referência: cada marca
            modela de um jeito, então leia também a descrição de cada peça.
          </p>
        </header>

        <section aria-labelledby="como-medir" className="border-t-2 border-ink py-12">
          <h2 id="como-medir" className="mb-8 text-3xl font-bold">
            Como medir
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {HOW_TO.map((step, index) => (
              <li key={step.id} className="grid content-start gap-2">
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-full border-2 border-ink bg-mint font-display font-extrabold">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-extrabold">{step.title}</h3>
                <p className="text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl text-sm text-ink-soft">
            Meça sobre roupa fina ou roupa de baixo e mantenha a fita reta e justa, sem apertar.
          </p>
        </section>

        <section aria-labelledby="calculadora" className="border-t-2 border-ink py-12">
          <h2 id="calculadora" className="mb-6 text-3xl font-bold">
            Calculadora de tamanho
          </h2>
          <SizeFinder />
          <p className="mt-4 max-w-2xl text-sm text-ink-soft">
            Quando as medidas caem em tamanhos diferentes, sugerimos o maior, porque a roupa precisa servir na parte mais
            larga. Na dúvida entre dois tamanhos, escolha pela modelagem descrita na peça.
          </p>
        </section>

        <section aria-labelledby="tabelas" className="border-t-2 border-ink py-12">
          <h2 id="tabelas" className="mb-8 text-3xl font-bold">
            Tabelas de referência
          </h2>
          <div className="grid gap-10 lg:grid-cols-2">
            {KINDS.map((kind) => (
              <div key={kind.id} role="region" aria-label={kind.title} tabIndex={0} className="overflow-x-auto rounded-card border-2 border-ink bg-cream">
                <table className="w-full min-w-[22rem] border-collapse text-left">
                  <caption className="p-4 text-left font-display text-lg font-extrabold">{kind.title}</caption>
                  <thead className="bg-lavender">
                    <tr>
                      <th scope="col" className="border-y-2 border-ink p-3">Tamanho</th>
                      {MEASURES.map((measure) => (
                        <th key={measure} scope="col" className="border-y-2 border-ink p-3">
                          {MEASURE_LABEL[measure][kind.id]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES.map((size) => (
                      <tr key={size} className="border-b border-line last:border-b-0">
                        <th scope="row" className="p-3 font-bold">{size}</th>
                        {MEASURES.map((measure) => (
                          <td key={measure} className="p-3">{rangeText(kind.id, measure, size)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
