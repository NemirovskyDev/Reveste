import { useId, type ComponentType } from "react";
import { GARMENT_SHAPES, GARMENT_VIEWBOX, type GarmentType } from "@/data/garments";
import { BlazerBehind, BlazerFront } from "./parts/BlazerArt";
import { CoatBehind, CoatFront } from "./parts/CoatArt";
import { DressFront } from "./parts/DressArt";
import { JacketBehind, JacketFront } from "./parts/JacketArt";
import { makePalette } from "./parts/palette";
import { ShirtBehind, ShirtFront } from "./parts/ShirtArt";
import { SkirtFront } from "./parts/SkirtArt";
import type { PartProps } from "./parts/shared";
import { TrousersFront } from "./parts/TrousersArt";

export type GarmentArtProps = {
  type: GarmentType;
  /** Cor principal da peça, em hex #rrggbb. */
  color: string;
  /** Com título a ilustração é uma imagem (`role="img"`); sem título é decorativa. */
  title?: string;
  /** Desenha um cabide acima da peça. */
  withHanger?: boolean;
  className?: string;
};

type Part = { behind?: ComponentType<PartProps>; front: ComponentType<PartProps>; floorY: number; hangerReach: number };

/** `floorY` é onde a peça toca o chão (sombra de contato); `hangerReach` é a meia-largura dos ombros do cabide. */
const PARTS: Record<GarmentType, Part> = {
  shirt: { behind: ShirtBehind, front: ShirtFront, floorY: 226, hangerReach: 74 },
  dress: { front: DressFront, floorY: 233, hangerReach: 44 },
  trousers: { front: TrousersFront, floorY: 226, hangerReach: 52 },
  skirt: { front: SkirtFront, floorY: 228, hangerReach: 46 },
  blazer: { behind: BlazerBehind, front: BlazerFront, floorY: 228, hangerReach: 74 },
  jacket: { behind: JacketBehind, front: JacketFront, floorY: 194, hangerReach: 72 },
  coat: { behind: CoatBehind, front: CoatFront, floorY: 232, hangerReach: 72 },
};

/** Espaço extra acima da peça para o cabide caber no viewBox. */
const HANGER_ROOM = 34;

const WOOD = "#c4a47c";
const WOOD_DARK = "#8f7350";
const METAL = "#9a98a4";

function Hanger({ y, reach }: { y: number; reach: number }) {
  const drop = reach * 0.22;
  const arms = `M100 ${y - 3} L${100 - reach} ${y - 3 + drop} M100 ${y - 3} L${100 + reach} ${y - 3 + drop}`;
  // Hastes seguem o ombro e ficam atrás da peça; só o pescoço e o gancho aparecem.
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={arms} stroke={WOOD_DARK} strokeWidth={5} />
      <path d={arms} stroke={WOOD} strokeWidth={3} />
      <path
        d={`M100 ${y - 3} L100 ${y - 11} C100 ${y - 15} 108 ${y - 17} 108 ${y - 25} C108 ${y - 32} 97 ${y - 33} 94 ${y - 27}`}
        stroke={METAL}
        strokeWidth={2.2}
      />
    </g>
  );
}

export function GarmentArt({ type, color, title, withHanger = false, className }: GarmentArtProps) {
  // useId devolve caracteres como ":" ou "«"; limpamos para o id servir em url(#...).
  const uid = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const shape = GARMENT_SHAPES[type];
  const p = makePalette(color);
  const { behind: Behind, front: Front, floorY, hangerReach } = PARTS[type];

  const { width, height } = GARMENT_VIEWBOX;
  const top = withHanger ? -HANGER_ROOM : 0;
  const titleId = `${uid}-title`;
  const a11y = title
    ? ({ role: "img", "aria-labelledby": titleId } as const)
    : ({ "aria-hidden": true, focusable: "false" } as const);

  return (
    <svg
      viewBox={`0 ${top} ${width} ${height - top}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`block h-auto w-full ${className ?? ""}`.trim()}
      {...a11y}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <defs>
        {/* luz vindo do alto à esquerda */}
        <linearGradient id={`${uid}-body`} gradientUnits="userSpaceOnUse" x1="30" y1="10" x2="170" y2="232">
          <stop offset="0" stopColor={p.hi} stopOpacity={0.35} />
          <stop offset="0.12" stopColor={p.base} />
          <stop offset="0.6" stopColor={p.base} />
          <stop offset="1" stopColor={p.shade} stopOpacity={0.28} />
        </linearGradient>
        {/* laterais mais escuras: arredonda o volume */}
        <linearGradient id={`${uid}-edge`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0" stopColor={p.shade} stopOpacity={0.5} />
          <stop offset="0.22" stopColor={p.shade} stopOpacity={0} />
          <stop offset="0.78" stopColor={p.shade} stopOpacity={0} />
          <stop offset="1" stopColor={p.shade} stopOpacity={0.5} />
        </linearGradient>
        <radialGradient id={`${uid}-sheen`} gradientUnits="userSpaceOnUse" cx="72" cy="64" r="120">
          <stop offset="0" stopColor="#ffffff" stopOpacity={p.isDark ? 0.16 : 0.32} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-floor`}>
          <stop offset="0" stopColor="#3b3a42" stopOpacity={0.28} />
          <stop offset="1" stopColor="#3b3a42" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={shape.outline} />
        </clipPath>
      </defs>

      {withHanger ? (
        <Hanger y={shape.hangerY} reach={hangerReach} />
      ) : (
        <ellipse cx={100} cy={floorY + 3} rx={78} ry={5} fill={`url(#${uid}-floor)`} />
      )}

      {Behind ? <Behind p={p} /> : null}

      <path d={shape.outline} fill={`url(#${uid}-body)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x={0} y={0} width={width} height={height} fill={`url(#${uid}-edge)`} />
        <Front p={p} />
        <rect x={0} y={0} width={width} height={height} fill={`url(#${uid}-sheen)`} />
      </g>
      <path
        d={shape.outline}
        fill="none"
        stroke={p.edge}
        strokeWidth={1.2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
