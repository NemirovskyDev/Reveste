/**
 * Os looks da home: cada pessoa aparece de corpo inteiro vestindo peças do catálogo. As fotos são ilustrações geradas
 * por IA (public/images/looks/<look>-<pessoa>.webp, 720x894), por isso a seção avisa isso na tela. As roupas de cada
 * foto precisam ser as mesmas das peças listadas em `pieceIds`, porque elas viram os botões de compra abaixo.
 */
export type LookPerson = {
  id: string;
  /** Descrição para leitores de tela. */
  alt: string;
  src: string;
  /** Ids das peças do catálogo que a pessoa veste neste look. */
  pieceIds: readonly string[];
};

export type Look = { id: string; title: string; people: readonly LookPerson[] };

const photo = (name: string) => `/images/looks/${name}.webp`;

export const LOOKS: readonly Look[] = [
  {
    id: "look1",
    title: "Primeiro look",
    people: [
      {
        id: "mulher-branca",
        alt: "Mulher de cabelo loiro vestindo um vestido midi laranja sem mangas",
        src: photo("look1-mulher-branca"),
        pieceIds: ["renner-vestido"],
      },
      {
        id: "homem-negro",
        alt: "Homem de cabelo curto vestindo camisa de linho verde-clara de mangas curtas e calça cinza de alfaiataria",
        src: photo("look1-homem-negro"),
        pieceIds: ["ca-camisa", "riachuelo-calca"],
      },
      {
        id: "mulher-negra",
        alt: "Mulher de cabelo black power vestindo um vestido longo floral lilás de alças finas",
        src: photo("look1-mulher-negra"),
        pieceIds: ["farm-vestido"],
      },
      {
        id: "homem-branco",
        alt: "Homem de cabelo castanho avermelhado vestindo camisa azul-clara larga e calça creme de pregas",
        src: photo("look1-homem-branco"),
        pieceIds: ["riachuelo-camisa", "renner-calca"],
      },
    ],
  },
  {
    id: "look2",
    title: "Segundo look",
    people: [
      {
        id: "mulher-branca",
        alt: "Mulher de cabelo loiro vestindo blazer creme e saia midi rosa com estampa de folhas laranja",
        src: photo("look2-mulher-branca"),
        pieceIds: ["zara-blazer", "farm-saia"],
      },
      {
        id: "mulher-negra",
        alt: "Mulher de cabelo black power vestindo blazer lilás e saia midi plissada rosa",
        src: photo("look2-mulher-negra"),
        pieceIds: ["renner-blazer", "ca-saia"],
      },
      {
        id: "homem-negro",
        alt: "Homem de cabelo curto vestindo jaqueta jeans clara, camiseta branca e calça cinza larga de pregas",
        src: photo("look2-homem-negro"),
        pieceIds: ["ca-jaqueta", "mango-calca"],
      },
      {
        id: "homem-branco",
        alt: "Homem de cabelo castanho avermelhado vestindo camisa azul-clara e calça cinza de pregas",
        src: photo("look2-homem-branco"),
        pieceIds: ["zara-camisa", "mango-calca"],
      },
    ],
  },
];

/** Ids das peças de um look, sem repetir, na ordem das pessoas. */
export function lookPieceIds(look: Look): string[] {
  return [...new Set(look.people.flatMap((person) => person.pieceIds))];
}
