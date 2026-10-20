import { Button, Hi, Seam, Shade, type PartProps } from "./shared";

const LOOPS = [60, 82, 118, 140];

export function TrousersFront({ p }: PartProps) {
  return (
    <>
      {/* caimento: faixa clara no centro de cada perna e sombra junto ao gancho */}
      <Hi d="M62 90 L84 90 L76 224 L58 224 Z" p={p} opacity={0.12} />
      <Hi d="M138 90 L116 90 L124 224 L142 224 Z" p={p} opacity={0.12} />
      <Shade d="M84 90 L100 88 L90 226 L78 226 Z" p={p} opacity={0.1} />
      <Shade d="M116 90 L100 88 L110 226 L122 226 Z" p={p} opacity={0.1} />
      <path d="M86 60 Q100 92 114 60 L100 88 Z" fill={p.shade} opacity={0.2} />
      {/* cós */}
      <Hi d="M49 18 L151 18 L151 36 L49 36 Z" p={p} opacity={0.16} />
      <Seam d="M50 36 L150 36" p={p} />
      {LOOPS.map((x) => (
        <g key={x}>
          <rect x={x - 2.2} y={15} width={4.4} height={19} rx={1.2} fill={p.base} stroke={p.seam} strokeOpacity={0.8} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <rect x={x - 2.2} y={15} width={4.4} height={19} rx={1.2} fill={p.hi} opacity={0.2} />
        </g>
      ))}
      <Button cx={104} cy={27} p={p} r={3} />
      {/* braguilha em J */}
      <Seam d="M100 36 L100 88" p={p} opacity={0.5} />
      <Seam d="M106 36 L106 70 Q106 80 99 82" p={p} />
      {/* bolsos enviesados e pregas */}
      <Seam d="M52 38 Q73 44 70 90" p={p} />
      <Seam d="M148 38 Q127 44 130 90" p={p} />
      <Shade d="M52 38 Q73 44 70 90 L74 90 Q78 46 55 38 Z" p={p} opacity={0.12} />
      <Shade d="M148 38 Q127 44 130 90 L126 90 Q122 46 145 38 Z" p={p} opacity={0.12} />
      <Seam d="M84 38 L86 64" p={p} opacity={0.5} />
      <Seam d="M116 38 L114 64" p={p} opacity={0.5} />
      {/* vinco central de cada perna */}
      <Seam d="M74 96 L66 224" p={p} opacity={0.55} />
      <Seam d="M126 96 L134 224" p={p} opacity={0.55} />
      {/* barras */}
      <Shade d="M43 214 L91 214 L90.4 226 L42 226 Z" p={p} opacity={0.14} />
      <Shade d="M109 214 L157 214 L158 226 L109.6 226 Z" p={p} opacity={0.14} />
      <Seam d="M43 214 L91 214" p={p} opacity={0.6} />
      <Seam d="M109 214 L157 214" p={p} opacity={0.6} />
    </>
  );
}
