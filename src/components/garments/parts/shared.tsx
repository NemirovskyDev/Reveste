import type { Palette } from "./palette";

export type PartProps = { p: Palette };

type SeamProps = { d: string; p: Palette; opacity?: number; dash?: string; width?: number };

/** Costura fina. `non-scaling-stroke` mantém ~1px em qualquer tamanho da ilustração. */
export function Seam({ d, p, opacity = 0.75, dash, width = 1 }: SeamProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={p.seam}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

/** Sombra suave (dobras, sombra sob colarinho). */
export function Shade({ d, p, opacity = 0.14 }: { d: string; p: Palette; opacity?: number }) {
  return <path d={d} fill={p.shade} opacity={opacity} />;
}

/** Realce suave (dobras claras, faces de gola e lapela). */
export function Hi({ d, p, opacity = 0.2 }: { d: string; p: Palette; opacity?: number }) {
  return <path d={d} fill={p.hi} opacity={opacity} />;
}

export function Button({ cx, cy, p, r = 2.5 }: { cx: number; cy: number; p: Palette; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy + 0.6} r={r} fill={p.shade} opacity={0.25} />
      <circle cx={cx} cy={cy} r={r} fill={p.button} stroke={p.edge} strokeWidth={0.8} />
      <circle cx={cx - r * 0.3} cy={cy} r={r * 0.17} fill={p.edge} />
      <circle cx={cx + r * 0.3} cy={cy} r={r * 0.17} fill={p.edge} />
    </g>
  );
}

/** Espelha um x no eixo central (x = 100) da peça. */
export const mx = (x: number): number => 200 - x;

type Fan = { top: [number, number, number]; bottom: [number, number, number]; count: number };

/**
 * Faixas alternadas que abrem em leque da cintura até a barra (pregas da saia,
 * godê do vestido). Devolve só as faixas "pares"; as costuras ficam por conta de quem chama.
 */
export function fanStrips({ top, bottom, count }: Fan): { band: string; line: string }[] {
  const [tx0, tx1, ty] = top;
  const [bx0, bx1, by] = bottom;
  const out: { band: string; line: string }[] = [];
  for (let i = 0; i < count; i++) {
    const a = i / count;
    const b = (i + 1) / count;
    const x = (x0: number, x1: number, t: number) => (x0 + (x1 - x0) * t).toFixed(1);
    out.push({
      band: `M${x(tx0, tx1, a)} ${ty} L${x(tx0, tx1, b)} ${ty} L${x(bx0, bx1, b)} ${by} L${x(bx0, bx1, a)} ${by} Z`,
      line: `M${x(tx0, tx1, a)} ${ty} L${x(bx0, bx1, a)} ${by}`,
    });
  }
  return out;
}
