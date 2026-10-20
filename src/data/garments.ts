/**
 * Silhuetas compartilhadas pela ilustração SVG (`GarmentArt`) e pela cena 3D
 * (textura das peças na arara). Tudo vive no mesmo espaço de coordenadas:
 * viewBox 0 0 200 240, peça centralizada em x = 100.
 *
 * `outline` é o contorno fechado da peça (use com fill).
 * `seams` são traços internos (costuras, lapelas, bolsos) para usar com stroke.
 * `hangerY` é o ponto onde o gancho do cabide encosta na peça.
 */
export type GarmentType = "shirt" | "dress" | "trousers" | "skirt" | "blazer" | "jacket" | "coat";

export type GarmentShape = {
  outline: string;
  seams: readonly string[];
  hangerY: number;
};

export const GARMENT_VIEWBOX = { width: 200, height: 240 } as const;

export const GARMENT_LABEL: Record<GarmentType, string> = {
  shirt: "camisa",
  dress: "vestido",
  trousers: "calça",
  skirt: "saia",
  blazer: "blazer",
  jacket: "jaqueta",
  coat: "casaco",
};

export const GARMENT_SHAPES: Record<GarmentType, GarmentShape> = {
  shirt: {
    outline:
      "M70 22 L100 38 L130 22 L170 40 L192 94 L166 106 L158 86 L158 226 L42 226 L42 86 L34 106 L8 94 L30 40 Z",
    seams: [
      "M100 38 L100 226",
      "M70 22 L84 52 L100 38",
      "M130 22 L116 52 L100 38",
      "M42 86 L42 120",
      "M158 86 L158 120",
    ],
    hangerY: 22,
  },
  dress: {
    outline:
      "M78 18 Q100 44 122 18 L148 30 L140 80 L174 228 Q100 238 26 228 L60 80 L52 30 Z",
    seams: ["M60 80 L140 80", "M100 44 L100 80", "M78 18 L82 44", "M122 18 L118 44"],
    hangerY: 18,
  },
  trousers: {
    outline: "M50 18 L150 18 L158 226 L110 226 L100 88 L90 226 L42 226 Z",
    seams: ["M50 36 L150 36", "M100 36 L100 88", "M120 36 L124 60", "M76 150 L72 226", "M124 150 L128 226"],
    hangerY: 18,
  },
  skirt: {
    outline: "M54 22 L146 22 L182 224 Q100 232 18 224 Z",
    seams: ["M54 40 L146 40", "M100 40 L100 224", "M76 40 L58 224", "M124 40 L142 224"],
    hangerY: 22,
  },
  blazer: {
    outline:
      "M72 20 L100 50 L128 20 L172 38 L194 116 L164 124 L158 98 L158 228 L42 228 L42 98 L36 124 L6 116 L28 38 Z",
    seams: [
      "M72 20 L92 70 L100 50",
      "M128 20 L108 70 L100 50",
      "M100 70 L100 228",
      "M92 70 L58 118 L100 150",
      "M108 70 L142 118 L100 150",
      "M54 180 L84 180",
      "M116 180 L146 180",
    ],
    hangerY: 20,
  },
  jacket: {
    outline:
      "M64 24 L100 40 L136 24 L174 46 L194 134 L164 140 L158 110 L158 194 L42 194 L42 110 L36 140 L6 134 L26 46 Z",
    seams: [
      "M64 24 L86 58 L100 40",
      "M136 24 L114 58 L100 40",
      "M100 40 L100 194",
      "M42 110 L42 140",
      "M158 110 L158 140",
      "M62 150 L86 150",
      "M114 150 L138 150",
    ],
    hangerY: 24,
  },
  coat: {
    outline:
      "M70 20 L100 48 L130 20 L172 40 L192 128 L164 136 L158 108 L166 232 L34 232 L42 108 L36 136 L8 128 L28 40 Z",
    seams: [
      "M70 20 L90 66 L100 48",
      "M130 20 L110 66 L100 48",
      "M100 66 L100 232",
      "M90 66 L56 120 L100 152",
      "M110 66 L144 120 L100 152",
      "M44 170 L82 170",
      "M118 170 L156 170",
    ],
    hangerY: 20,
  },
};
