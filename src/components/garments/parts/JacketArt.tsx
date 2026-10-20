import { Button, Hi, Seam, Shade, mx, type PartProps } from "./shared";

export function JacketBehind({ p }: PartProps) {
  return <path d="M62 24 Q100 6 138 24 L100 44 Z" fill={p.back} stroke={p.edge} strokeWidth={0.8} />;
}

const COLLAR = "M62 22 L100 40 L86 60 L54 38 Z";
const RIBS = Array.from({ length: 13 }, (_, i) => 48 + i * 8.5);
const FACE = { strokeWidth: 1, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" } as const;
const FLIP = "translate(200 0) scale(-1 1)";

/** Bolsos de um lado da jaqueta; `side` -1 espelha em torno de x = 100. */
function Pockets({ p, side }: { p: PartProps["p"]; side: 1 | -1 }) {
  const x = (v: number) => (side === 1 ? v : mx(v));
  const flap = `M${x(52)} 82 L${x(90)} 82 L${x(90)} 98 L${x(71)} 105 L${x(52)} 98 Z`;
  return (
    <g>
      <path d={`M${x(54)} 86 L${x(88)} 86 L${x(88)} 118 L${x(54)} 118 Z`} fill={p.shade} opacity={0.08} />
      <Seam d={`M${x(54)} 84 L${x(88)} 84 L${x(88)} 118 L${x(54)} 118 Z`} p={p} dash="2.5 2" />
      <path d={flap} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...FACE} />
      <Hi d={flap} p={p} opacity={0.2} />
      <Button cx={x(71)} cy={96} p={p} r={2.2} />
      {/* bolso de mão enviesado */}
      <Seam d={`M${x(52)} 128 L${x(80)} 146`} p={p} dash="2.5 2" />
      <Shade d={`M${x(52)} 128 L${x(80)} 146 L${x(80)} 152 L${x(52)} 134 Z`} p={p} opacity={0.1} />
    </g>
  );
}

export function JacketFront({ p }: PartProps) {
  return (
    <>
      <Shade d="M26 46 L6 134 L36 140 L42 110 L48 40 Z" p={p} opacity={0.1} />
      <Shade d="M174 46 L194 134 L164 140 L158 110 L152 40 Z" p={p} opacity={0.1} />
      <Shade d="M42 110 Q52 122 50 150 L42 150 Z" p={p} opacity={0.12} />
      <Shade d="M158 110 Q148 122 150 150 L158 150 Z" p={p} opacity={0.12} />
      <Hi d="M122 120 Q132 150 128 172 L142 172 Q144 150 134 118 Z" p={p} opacity={0.12} />
      {/* costuras de cava e punho */}
      <Seam d="M48 38 Q44 78 42 110" p={p} dash="2.5 2" />
      <Seam d="M152 38 Q156 78 158 110" p={p} dash="2.5 2" />
      <Shade d="M8.6 122 L38.6 128 L36 140 L6 134 Z" p={p} opacity={0.14} />
      <Shade d="M191.4 122 L161.4 128 L164 140 L194 134 Z" p={p} opacity={0.14} />
      <Seam d="M8.6 122 L38.6 128" p={p} />
      <Seam d="M191.4 122 L161.4 128" p={p} />
      <Pockets p={p} side={1} />
      <Pockets p={p} side={-1} />
      {/* cós canelado */}
      <Shade d="M42 172 L158 172 L158 194 L42 194 Z" p={p} opacity={0.1} />
      {RIBS.map((x) => (
        <Seam key={x} d={`M${x} 174 L${x} 192`} p={p} opacity={0.22} />
      ))}
      <Seam d="M42 172 L158 172" p={p} />
      {/* zíper: dentes tracejados + puxador */}
      <path d="M100 42 L100 194" stroke={p.shade} strokeOpacity={0.35} strokeWidth={4} />
      <path d="M100 42 L100 194" stroke={p.button} strokeWidth={3} strokeDasharray="1.6 1.6" vectorEffect="non-scaling-stroke" />
      <rect x={97.2} y={44} width={5.6} height={11} rx={2.4} fill={p.button} stroke={p.edge} strokeWidth={0.8} />
      <circle cx={100} cy={50} r={1.2} fill={p.edge} opacity={0.6} />
      {/* gola */}
      <path d={COLLAR} fill={p.shade} opacity={0.2} transform="translate(0.5 2.5)" />
      <path d={COLLAR} transform={FLIP} fill={p.shade} opacity={0.2} />
      <path d={COLLAR} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...FACE} />
      <path d={COLLAR} transform={FLIP} fill={p.base} stroke={p.seam} strokeOpacity={0.85} {...FACE} />
      <Hi d={COLLAR} p={p} opacity={0.3} />
    </>
  );
}
