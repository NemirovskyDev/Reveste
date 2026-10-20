import { getPiece } from "@/data/catalog";
import { GARMENT_PHOTO_COLOR } from "./garmentPhotos";
import type { BodyType, Garment, Hair, Outfit } from "./Mannequin";

/** Peça do catálogo como roupa do manequim: cor média da foto (para a roupa lisa combinar) e a própria foto. */
const wear = (id: string): Garment => ({ color: GARMENT_PHOTO_COLOR[id] ?? getPiece(id).color, photo: id });

export type Person = {
  id: string;
  type: BodyType;
  skin: string;
  hair: Hair;
  /** Cor dos sapatos. */
  shoes: string;
  /** Proporção desta pessoa: largura e altura em relação ao corpo-base. */
  build: { w: number; h: number };
  /** Primeiro look (sai) e segundo look (entra). */
  looks: [Outfit, Outfit];
};

/**
 * Elenco: duas mulheres e dois homens, brancos e negros. Cada par vizinho (0 e 1, 2 e 3) troca de lugar
 * enquanto as roupas mudam.
 */
export const CAST: readonly Person[] = [
  {
    id: "mulher-branca",
    type: "female",
    skin: "#f0c9ae",
    shoes: "#f3f1ec",
    build: { w: 0.97, h: 1 },
    hair: { style: "long" },
    looks: [
      { dress: { ...wear("renner-vestido"), hemY: 0.5, hemRadius: 0.27, fold: { count: 16, amp: 0.03 } } },
      { top: { ...wear("zara-blazer"), sleeve: "long" }, skirt: { ...wear("farm-saia"), hemY: 0.5, hemRadius: 0.3, fold: { count: 12, amp: 0.04 } } },
    ],
  },
  {
    id: "homem-negro",
    type: "male",
    skin: "#6a4330",
    shoes: "#efece6",
    build: { w: 1.02, h: 1.05 },
    hair: { style: "crop" },
    looks: [
      { top: { ...wear("ca-camisa"), sleeve: "short" }, bottom: wear("riachuelo-calca") },
      { top: { ...wear("ca-jaqueta"), sleeve: "long" }, bottom: wear("mango-calca") },
    ],
  },
  {
    id: "mulher-negra",
    type: "female",
    skin: "#5d3b2a",
    shoes: "#b98763",
    build: { w: 1.05, h: 1.03 },
    hair: { style: "puff" },
    looks: [
      { dress: { ...wear("farm-vestido"), hemY: 0.1, hemRadius: 0.34, fold: { count: 18, amp: 0.035 } } },
      { top: { ...wear("renner-blazer"), sleeve: "long" }, skirt: { ...wear("ca-saia"), hemY: 0.55, hemRadius: 0.28, fold: { count: 44, amp: 0.022 } } },
    ],
  },
  {
    id: "homem-branco",
    type: "male",
    skin: "#efc7a8",
    shoes: "#5a3d2b",
    build: { w: 0.98, h: 1 },
    hair: { style: "cap" },
    looks: [
      { top: { ...wear("riachuelo-camisa"), sleeve: "long" }, bottom: wear("renner-calca") },
      { top: { ...wear("zara-camisa"), sleeve: "long" }, bottom: wear("mango-calca") },
    ],
  },
];

/** Ids das peças de cada look (0 = primeiro, 1 = segundo), sem repetir, na ordem em que aparecem no elenco. */
export const LOOK_PIECE_IDS: readonly [readonly string[], readonly string[]] = [0, 1].map((index) => {
  const ids: string[] = [];
  for (const person of CAST) {
    const outfit = person.looks[index];
    for (const garment of [outfit.top, outfit.bottom, outfit.dress, outfit.skirt]) {
      if (garment?.photo && !ids.includes(garment.photo)) ids.push(garment.photo);
    }
  }
  return ids;
}) as unknown as readonly [readonly string[], readonly string[]];
