import { Button, Hi, Seam, Shade, mx, type PartProps } from "./shared";

export function CoatBehind({ p }: PartProps) {
  return <path d="M70 20 Q100 4 130 20 L100 50 Z" fill={p.lining} stroke={p.edge} strokeWidth={0.8} />;
}

// Lapela esquerda; a direita é o espelho em torno de x = 100.
const LAPEL = [[70, 20], [84, 24], [100, 104], [66, 86], [70, 62], [46, 56], [58, 40]] as const;
const FACE = { strokeWidth: 1, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" } as const;

const poly = (pts: readonly (readonly [number, number])[], mirror: boolean) =>
  `M${pts.map(([x, y]) => `${mirror ? mx(x) : x} ${y}`).join(" L")} Z`;

// Altura (y) de cada par de botões do trespasse.
const BUTTON_ROWS = [118, 160, 190, 216];

export function CoatFront({ p }: PartProps) {
  return (
    <>
      <Shade d="M28 40 L8 128 L36 136 L42 108 L48 36 Z" p={p} opacity={0.1} />
      <Shade d="M172 40 L192 128 L164 136 L158 108 L152 36 Z" p={p} opacity={0.1} />
      <Shade d="M42 108 Q52 120 50 146 L42 146 Z" p={p} opacity={0.12} />
      <Shade d="M158 108 Q148 120 150 146 L158 146 Z" p={p} opacity={0.12} />
      <Shade d="M50 140 Q56 190 40 230 L66 230 Q74 190 70 140 Z" p={p} opacity={0.08} />
      <Hi d="M132 140 Q138 190 140 230 L156 230 Q152 190 146 140 Z" p={p} opacity={0.12} />
      {/* V do forro e transpasse (um lado sobrepõe o outro) */}
      <path d="M80 18 L120 18 L100 104 Z" fill={p.lining} />
      <Shade d="M80 18 L120 18 L100 104 Z" p={p} opacity={0.08} />
      <Seam d="M100 104 L100 232" p={p} opacity={0.5} />
      <path d="M100 104 L134 116 L130 232 L100 232 Z" fill={p.shade} opacity={0.06} />
      <Seam d="M134 116 L130 232" p={p} opacity={0.75} />
      {/* lapelas */}
      <path d={poly(LAPEL, false)} fill={p.shade} opacity={0.22} transform="translate(0.8 2.6)" />
      <path d={poly(LAPEL, true)} fill={p.shade} opacity={0.22} transform="translate(-0.8 2.6)" />
      <path d={poly(LAPEL, false)} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...FACE} />
      <path d={poly(LAPEL, true)} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...FACE} />
      <Hi d={poly(LAPEL, false)} p={p} opacity={0.26} />
      <Hi d={poly(LAPEL, true)} p={p} opacity={0.14} />
      <Seam d="M84 24 L70 62 L66 86" p={p} opacity={0.45} />
      <Seam d="M116 24 L130 62 L134 86" p={p} opacity={0.45} />
      {/* ombreiras com botão */}
      <path d="M55 26 L32 38 L36 46 L59 34 Z" fill={p.base} stroke={p.seam} strokeOpacity={0.85} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d="M145 26 L168 38 L164 46 L141 34 Z" fill={p.base} stroke={p.seam} strokeOpacity={0.85} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <Button cx={54} cy={31} p={p} r={1.8} />
      <Button cx={146} cy={31} p={p} r={1.8} />
      {/* botões duplos */}
      {BUTTON_ROWS.map((y) => (
        <g key={y}>
          <Button cx={88} cy={y} p={p} r={3} />
          <Button cx={112} cy={y} p={p} r={3} />
        </g>
      ))}
      {/* cinto com fivela */}
      <path d="M39 126 L161 126 L161 140 L39 140 Z" fill={p.shade} opacity={0.26} />
      <path d="M39 126 L161 126 L161 131 L39 131 Z" fill={p.hi} opacity={0.2} />
      <Seam d="M39 126 L161 126" p={p} />
      <Seam d="M39 140 L161 140" p={p} />
      <Seam d="M42 129 L161 129" p={p} opacity={0.4} dash="2.5 2" />
      <rect x={90} y={123} width={20} height={20} rx={3} fill="none" stroke={p.button} strokeWidth={2.4} />
      <rect x={90} y={123} width={20} height={20} rx={3} fill="none" stroke={p.edge} strokeWidth={0.6} opacity={0.6} />
      <path d="M96 133 L112 133" stroke={p.button} strokeWidth={2} strokeLinecap="round" />
      {/* bolsos enviesados e cavas */}
      <Seam d="M48 168 L80 186" p={p} />
      <Seam d="M152 168 L120 186" p={p} />
      <Shade d="M48 168 L80 186 L80 192 L48 174 Z" p={p} opacity={0.1} />
      <Shade d="M152 168 L120 186 L120 192 L152 174 Z" p={p} opacity={0.1} />
      <Seam d="M48 36 Q44 74 42 108" p={p} />
      <Seam d="M152 36 Q156 74 158 108" p={p} />
      {/* tiras dos punhos */}
      <Shade d="M11 114 L39 122 L36 136 L8 128 Z" p={p} opacity={0.15} />
      <Shade d="M189 114 L161 122 L164 136 L192 128 Z" p={p} opacity={0.15} />
      <Seam d="M11 114 L39 122" p={p} />
      <Seam d="M189 114 L161 122" p={p} />
      <Button cx={24} cy={123} p={p} r={1.8} />
      <Button cx={mx(24)} cy={123} p={p} r={1.8} />
      <Seam d="M40 226 Q100 232 160 226" p={p} opacity={0.5} />
    </>
  );
}
