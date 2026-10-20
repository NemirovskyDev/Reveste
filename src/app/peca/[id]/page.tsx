import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PieceImage } from "@/components/piece/PieceImage";
import { Container } from "@/components/layout/Container";
import { PieceActions } from "@/components/piece/PieceActions";
import { PieceCard } from "@/components/piece/PieceCard";
import { LabelTag } from "@/components/ui/LabelTag";
import { CATALOG, TIER_LABEL, findPiece } from "@/data/catalog";
import { GARMENT_LABEL } from "@/data/garments";
import { formatMoney } from "@/lib/format";
import { pieceBrandName, pieceTitle } from "@/lib/piece";
import { RENTAL_DAYS, buyoutCents, netPlanRentalCents, rentalCents } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return CATALOG.map((piece) => ({ id: piece.id }));
}

export async function generateMetadata(props: PageProps<"/peca/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const piece = findPiece(id);
  if (!piece) return {};
  const title = pieceTitle(piece);
  return {
    title: `Alugar ${title}`,
    description: `Alugue ${title} por 7, 14 ou 30 dias a partir de ${formatMoney(rentalCents(piece, 7))}, ou no plano de 4 peças. ${piece.description}`,
    alternates: { canonical: `/peca/${piece.id}` },
    openGraph: { url: `/peca/${piece.id}` },
  };
}

export default async function PiecePage(props: PageProps<"/peca/[id]">) {
  const { id } = await props.params;
  const piece = findPiece(id);
  if (!piece) notFound();

  const related = CATALOG.filter((item) => item.id !== piece.id && (item.brandId === piece.brandId || item.tier === piece.tier)).slice(0, 4);

  const pageUrl = `${SITE_URL}/peca/${piece.id}`;
  const seller = { "@type": "Organization", name: "Reveste", url: SITE_URL };
  // Aluguel é uma oferta de "lease out" (GoodRelations), uma por prazo; a compra é uma oferta de venda à parte.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: pieceTitle(piece),
      description: piece.description,
      image: [`${pageUrl}/opengraph-image`],
      brand: { "@type": "Brand", name: pieceBrandName(piece) },
      material: piece.material,
      url: pageUrl,
      offers: [
        ...RENTAL_DAYS.map((days) => ({
          "@type": "Offer",
          url: pageUrl,
          seller,
          priceCurrency: "BRL",
          price: (rentalCents(piece, days) / 100).toFixed(2),
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
          eligibleDuration: { "@type": "QuantitativeValue", value: days, unitCode: "DAY" },
        })),
        {
          "@type": "Offer",
          url: pageUrl,
          seller,
          priceCurrency: "BRL",
          price: (buyoutCents(piece, 0) / 100).toFixed(2),
          businessFunction: "http://purl.org/goodrelations/v1#Sell",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalogo` },
        { "@type": "ListItem", position: 3, name: pieceTitle(piece), item: pageUrl },
      ],
    },
  ];

  return (
    <main id="conteudo" tabIndex={-1}>
      <Container className="pb-8 pt-6">
        <nav aria-label="Você está em" className="mb-6 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/catalogo" className="underline underline-offset-4">
                Catálogo
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{piece.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="pt-4">
            <LabelTag tier={piece.tier} className="px-6 pb-8 pt-12 lg:sticky lg:top-32">
              <div className="mx-auto aspect-[4/5] w-full max-w-md">
                <PieceImage
                  piece={piece}
                  priority
                  title={`${pieceTitle(piece)}, ${GARMENT_LABEL[piece.type]}`}
                  className="h-full w-full"
                />
              </div>
            </LabelTag>
          </div>

          <div className="grid content-start gap-7">
            <div>
              <p className="font-display text-xl font-extrabold">{pieceBrandName(piece)}</p>
              <h1 className="mt-1 text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
                {piece.name}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
                <span className="rounded-full border-2 border-ink bg-white px-3 py-0.5 text-sm font-bold text-ink">
                  {TIER_LABEL[piece.tier]}
                </span>
                <span>{piece.material}</span>
                <span aria-hidden="true">·</span>
                <span>Valor da peça {formatMoney(piece.valueCents)}</span>
              </p>
              <p className="mt-4 max-w-prose text-lg">{piece.description}</p>
            </div>
            <PieceActions piece={piece} />
          </div>
        </div>
      </Container>

      <Container as="section" aria-labelledby="precos" className="pt-16">
        <h2 id="precos" className="mb-5 text-3xl font-bold">
          Preços e prazos
        </h2>
        <div
          role="region"
          aria-label={`Preços de ${pieceTitle(piece)}`}
          tabIndex={0}
          className="overflow-x-auto rounded-card border-2 border-ink bg-cream"
        >
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <caption className="sr-only">Preço de {pieceTitle(piece)} por prazo de aluguel e para compra</caption>
            <thead className="bg-lavender">
              <tr>
                <th scope="col" className="border-b-2 border-ink p-4">Opção</th>
                <th scope="col" className="border-b-2 border-ink p-4">Valor</th>
                <th scope="col" className="border-b-2 border-ink p-4">Por dia</th>
              </tr>
            </thead>
            <tbody>
              {RENTAL_DAYS.map((days) => (
                <tr key={days} className="border-b border-line">
                  <th scope="row" className="p-4 font-bold">Aluguel de {days} dias</th>
                  <td className="p-4">{formatMoney(rentalCents(piece, days))}</td>
                  <td className="p-4 text-ink-soft">{formatMoney(Math.round(rentalCents(piece, days) / days))}</td>
                </tr>
              ))}
              <tr className="border-b border-line">
                <th scope="row" className="p-4 font-bold">No plano de 4 peças, por mês</th>
                <td className="p-4">{formatMoney(netPlanRentalCents(piece))}</td>
                <td className="p-4 text-ink-soft">{formatMoney(Math.round(netPlanRentalCents(piece) / 30))}</td>
              </tr>
              <tr>
                <th scope="row" className="p-4 font-bold">Compra da peça</th>
                <td className="p-4">{formatMoney(buyoutCents(piece, 0))}</td>
                <td className="p-4 text-ink-soft">O aluguel já pago é descontado</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Tamanhos disponíveis: {piece.sizes.join(", ")}. {piece.material}. Atraso, dano e devolução seguem as{" "}
          <Link href="/ajuda#regras" className="font-bold underline underline-offset-4">
            regras da Reveste
          </Link>
          .
        </p>
      </Container>

      <Container as="section" aria-labelledby="relacionadas" className="pt-16">
        <h2 id="relacionadas" className="mb-8 text-3xl font-bold">
          Combina com
        </h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {related.map((item) => (
            <li key={item.id}>
              <PieceCard piece={item} />
            </li>
          ))}
        </ul>
      </Container>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
