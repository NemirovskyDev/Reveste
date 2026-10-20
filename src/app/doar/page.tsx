import type { Metadata } from "next";
import { DonationForm } from "@/components/donate/DonationForm";
import { Container } from "@/components/layout/Container";
import { DONATION_CATEGORIES, DONATION_GROUP_SIZE, MAX_DISCOUNT, MIN_DISCOUNT } from "@/lib/donation";

export const metadata: Metadata = {
  title: "Doe suas roupas e ganhe desconto",
  description: `Doe peças que você não usa mais para a Reveste. A cada ${DONATION_GROUP_SIZE} peças você ganha um desconto de ${MIN_DISCOUNT}% a ${MAX_DISCOUNT}% no aluguel ou na compra, sem precisar ser uma empresa.`,
  alternates: { canonical: "/doar" },
  openGraph: { url: "/doar" },
};

const STEPS = [
  { id: "separe", title: "Separe as peças", text: "Roupas limpas, sem manchas, furos nem zíperes quebrados." },
  { id: "cadastre", title: "Faça o cadastro", text: "Diga quantas peças de cada tipo você vai doar. Leva 2 minutos." },
  { id: "envie", title: "Envie ou combine a coleta", text: "Respondemos por e-mail com o endereço e as instruções." },
  { id: "desconto", title: "Receba o desconto", text: "Depois de conferir as peças, enviamos o seu desconto por e-mail." },
] as const;

export default function DonatePage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Container>
        <header className="pb-10 pt-10 md:pb-14 md:pt-16">
          <h1 className="max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Doe o que você não usa mais e ganhe desconto
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft md:text-xl">
            Não precisa ser uma empresa. Qualquer pessoa pode doar roupas para a Reveste: a cada {DONATION_GROUP_SIZE}{" "}
            peças doadas você ganha um desconto de {MIN_DISCOUNT}% a {MAX_DISCOUNT}%, que vale para alugar ou comprar.
          </p>
        </header>

        <section aria-labelledby="como-funciona-doacao" className="border-t-2 border-ink py-12">
          <h2 id="como-funciona-doacao" className="mb-8 text-3xl font-bold">
            Como funciona
          </h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => (
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

        <section aria-labelledby="descontos" className="border-t-2 border-ink py-12">
          <h2 id="descontos" className="mb-3 text-3xl font-bold">
            Quanto desconto cada peça vale
          </h2>
          <p className="mb-6 max-w-2xl text-ink-soft">
            O desconto de cada grupo de {DONATION_GROUP_SIZE} peças é a média do percentual das peças do grupo. As
            peças de maior percentual entram primeiro nos grupos.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DONATION_CATEGORIES.map((category) => (
              <li key={category.id} className="rounded-card border-2 border-ink bg-cream p-5">
                <p className="font-display text-3xl font-extrabold">{category.discount}%</p>
                <p className="mt-1 font-bold">{category.label}</p>
                <p className="mt-1 text-sm text-ink-soft">{category.examples}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-sm text-ink-soft">
            O valor final depende da conferência da equipe. Peças que não estiverem em condições de uso podem ser
            recusadas e não entram na conta. Esta doação não gera recibo para dedução de imposto.
          </p>
        </section>

        <section aria-labelledby="doar-agora" className="grid grid-cols-[minmax(0,1fr)] gap-10 border-t-2 border-ink py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <h2 id="doar-agora" className="mb-3 text-3xl font-bold">
              Quero doar
            </h2>
            <p className="max-w-md text-ink-soft">
              Preencha o cadastro. Você ainda não precisa mandar nada: respondemos por e-mail com as instruções.
            </p>
          </div>
          <DonationForm />
        </section>
      </Container>
    </main>
  );
}
