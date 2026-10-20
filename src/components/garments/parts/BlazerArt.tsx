import { Button, Hi, Seam, Shade, mx, type PartProps } from "./shared";

/** Gola/forro visível por trás do decote em V. */
export function BlazerBehind({ p }: PartProps) {
  return <path d="M74 20 Q100 8 126 20 L100 52 Z" fill={p.lining} stroke={p.edge} strokeWidth={0.8} />;
}

// Lapela esquerda (entalhada). A direita é o espelho em torno de x = 100.
const LAPEL = [[72, 20], [84, 23], [100, 126], [68, 96], [72, 66], [50, 58], [60, 40]] as const;

const poly = (pts: readonly (readonly [number, number])[], mirror: boolean) =>
  `M${pts.map(([x, y]) => `${mirror ? mx(x) : x} ${y}`).join(" L")} Z`;

const LAPEL_STROKE = { strokeWidth: 1, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" } as const;

export function BlazerFront({ p }: PartProps) {
  return (
    <>
      {/* mangas, axilas e dobras */}
      <Shade d="M28 38 L6 116 L36 124 L42 98 L50 34 Z" p={p} opacity={0.1} />
      <Shade d="M172 38 L194 116 L164 124 L158 98 L150 34 Z" p={p} opacity={0.1} />
      <Shade d="M42 98 Q52 110 50 140 L42 140 Z" p={p} opacity={0.12} />
      <Shade d="M158 98 Q148 110 150 140 L158 140 Z" p={p} opacity={0.12} />
      <Shade d="M56 130 Q66 180 54 226 L74 226 Q80 180 70 128 Z" p={p} opacity={0.07} />
      <Hi d="M130 130 Q140 180 134 226 L148 226 Q150 180 140 128 Z" p={p} opacity={0.12} />
      {/* V do forro entre as lapelas */}
      <path d="M78 18 L122 18 L100 126 Z" fill={p.lining} />
      <Shade d="M78 18 L122 18 L100 126 Z" p={p} opacity={0.08} />
      {/* fecho */}
      <Seam d="M100 126 L100 228" p={p} opacity={0.6} />
      {/* lapelas com sombra projetada */}
      <path d={poly(LAPEL, false)} fill={p.shade} opacity={0.22} transform="translate(0.8 2.6)" />
      <path d={poly(LAPEL, true)} fill={p.shade} opacity={0.22} transform="translate(-0.8 2.6)" />
      <path d={poly(LAPEL, false)} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...LAPEL_STROKE} />
      <path d={poly(LAPEL, true)} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...LAPEL_STROKE} />
      <Hi d={poly(LAPEL, false)} p={p} opacity={0.26} />
      <Hi d={poly(LAPEL, true)} p={p} opacity={0.14} />
      <Seam d="M84 23 L72 66 L68 96" p={p} opacity={0.45} />
      <Seam d="M116 23 L128 66 L132 96" p={p} opacity={0.45} />
      <Button cx={100} cy={150} p={p} r={3} />
      <Button cx={100} cy={184} p={p} r={3} />
      {/* bolsos: abas na cintura, lenço no peito */}
      <path d="M50 174 L88 176 L88 187 L50 185 Z" fill={p.shade} opacity={0.14} />
      <Seam d="M50 174 L88 176 L88 187 L50 185 Z" p={p} />
      <path d="M112 176 L150 174 L150 185 L112 187 Z" fill={p.shade} opacity={0.14} />
      <Seam d="M112 176 L150 174 L150 185 L112 187 Z" p={p} />
      <Seam d="M116 112 L142 110" p={p} />
      <Hi d="M116 111 L142 109 L142 112 L116 114 Z" p={p} opacity={0.25} />
      {/* cavas e punhos com botões */}
      <Seam d="M50 34 Q44 70 42 98" p={p} />
      <Seam d="M150 34 Q156 70 158 98" p={p} />
      <Seam d="M8.7 106 L38.7 114" p={p} />
      <Seam d="M191.3 106 L161.3 114" p={p} />
      {[13.5, 22, 30.5].map((x, i) => (
        <g key={x}>
          <Button cx={x} cy={112.4 + i * 1.8} p={p} r={1.7} />
          <Button cx={mx(x)} cy={112.4 + i * 1.8} p={p} r={1.7} />
        </g>
      ))}
      <Seam d="M42 222 Q100 228 158 222" p={p} opacity={0.5} />
    </>
  );
}
