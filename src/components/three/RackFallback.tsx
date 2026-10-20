import { useId } from "react";
import { GARMENT_SHAPES, GARMENT_VIEWBOX } from "@/data/garments";
import { darken, lighten } from "@/lib/color";
import type { RackItem } from "./types";

const VIEW_W = 640;
const VIEW_H = 340;
const RAIL_Y = 66;
const POST_LEFT = 104;
const POST_RIGHT = 536;
const FLOOR_Y = 300;
const METAL = "#cfc8e6";

/**
 * Arara estática (vista frontal) para quem não roda a cena WebGL: movimento reduzido,
 * aparelho fraco ou sem WebGL2. Usa os mesmos contornos e cores da cena 3D.
 * Puramente decorativa, por isso fora da árvore de acessibilidade.
 */
export function RackFallback({ items, className }: { items: readonly RackItem[]; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const count = items.length;
  const span = POST_RIGHT - POST_LEFT + 60;
  const slot = count > 0 ? span / count : span;
  // Peças levemente sobrepostas, como numa arara cheia; encolhem se houver muitas.
  const scale = Math.min(0.8, (slot * 1.35) / GARMENT_VIEWBOX.width);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0" stopColor="#4b3f63" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4b3f63" stopOpacity="0" />
        </radialGradient>
        {items.map((item, i) => (
          <linearGradient key={i} id={`${uid}-g${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={lighten(item.color, 0.14)} />
            <stop offset="0.5" stopColor={item.color} />
            <stop offset="1" stopColor={darken(item.color, 0.16)} />
          </linearGradient>
        ))}
      </defs>

      <ellipse cx={VIEW_W / 2} cy={FLOOR_Y + 22} rx="270" ry="14" fill={`url(#${uid}-shadow)`} />

      {/* Estrutura */}
      <g stroke={METAL} strokeLinecap="round" fill="none">
        <path d={`M${POST_LEFT} ${RAIL_Y} V${FLOOR_Y}`} strokeWidth="7" />
        <path d={`M${POST_RIGHT} ${RAIL_Y} V${FLOOR_Y}`} strokeWidth="7" />
        <path d={`M${POST_LEFT - 34} ${FLOOR_Y} H${POST_RIGHT + 34}`} strokeWidth="8" />
        <path d={`M${POST_LEFT - 52} ${RAIL_Y} H${POST_RIGHT + 52}`} strokeWidth="8" />
      </g>
      <g fill="#2f2c38">
        {[POST_LEFT - 34, POST_RIGHT + 34].map((x) => (
          <circle key={x} cx={x} cy={FLOOR_Y + 9} r="9" />
        ))}
      </g>

      {/* Peças penduradas */}
      {items.map((item, i) => {
        const shape = GARMENT_SHAPES[item.type];
        const cx = POST_LEFT - 30 + slot * (i + 0.5);
        const drop = (i % 2) * 8;
        // No espaço da peça: o trilho fica 34 unidades acima do ponto do gancho.
        const railLocal = shape.hangerY - 34;
        const tx = cx - 100 * scale;
        const ty = RAIL_Y - railLocal * scale + drop;
        const tilt = ((i % 3) - 1) * 1.2;
        return (
          <g key={i} transform={`translate(${tx} ${ty}) rotate(${tilt} 100 ${railLocal}) scale(${scale})`}>
            {/* Cabide */}
            <g fill="none" stroke="#e9d6b6" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="100" cy={railLocal} r="5" stroke={darken("#e9d6b6", 0.12)} strokeWidth="2" />
              <path d={`M100 ${railLocal + 5} V${shape.hangerY - 4}`} strokeWidth="2.6" />
              <path d={`M100 ${shape.hangerY - 4} L18 ${shape.hangerY + 22} H182 L100 ${shape.hangerY - 4}`} />
            </g>
            <path d={shape.outline} fill={`url(#${uid}-g${i})`} stroke={darken(item.color, 0.3)} strokeOpacity="0.5" strokeWidth="1.2" strokeLinejoin="round" />
            <g fill="none" stroke={darken(item.color, 0.3)} strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              {shape.seams.map((seam) => (
                <path key={seam} d={seam} />
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
