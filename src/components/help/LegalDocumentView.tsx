import { Container } from "@/components/layout/Container";
import type { LegalDocument } from "@/content/legal";
import { formatDateLong } from "@/lib/format";

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="pb-10">
        <header className="pb-8 pt-10 md:pb-12 md:pt-16">
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {document.title}
          </h1>
          <p className="mt-4 text-ink-soft">Atualizado em {formatDateLong(document.updatedAt)}</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <nav aria-label="Nesta página" className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="mb-3 font-display text-lg font-bold">Nesta página</h2>
            <ol className="grid gap-x-6 gap-y-0 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-1 lg:text-base">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="inline-block py-1.5 underline-offset-4 hover:underline">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid max-w-3xl gap-10">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-titulo`} className="scroll-mt-32">
                <h2 id={`${section.id}-titulo`} className="mb-3 text-2xl font-bold">
                  {section.title}
                </h2>
                <div className="grid gap-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
