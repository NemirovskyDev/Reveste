import { Button, Hi, Seam, Shade, mx, type PartProps } from "./shared";

/** Gola montada atrás da peça: aparece dentro do decote em V. */
export function ShirtBehind({ p }: PartProps) {
  return <path d="M68 22 Q100 2 132 22 L100 40 Z" fill={p.back} stroke={p.edge} strokeWidth={0.8} />;
}

const BUTTON_Y = [66, 92, 118, 144, 170, 196];
const LEAF = "M68 21 L100 38 L85 54 L62 32 Z";
const LEAF_SHADOW = "M68 24.5 L100 41 L85 57 L62 35 Z";

export function ShirtFront({ p }: PartProps) {
  return (
    <>
      {/* mangas um pouco mais escuras que o corpo: dá profundidade sem contorno pesado */}
      <Shade d="M30 40 L8 94 L34 106 L42 86 L52 31 Z" p={p} opacity={0.1} />
      <Shade d="M170 40 L192 94 L166 106 L158 86 L148 31 Z" p={p} opacity={0.1} />
      {/* dobras longas do tecido */}
      <Shade d="M58 120 Q70 170 56 224 L76 224 Q86 170 78 118 Z" p={p} opacity={0.07} />
      <Hi d="M124 110 Q134 168 128 224 L144 224 Q146 170 134 108 Z" p={p} opacity={0.12} />
      {/* sombra sob as axilas */}
      <Shade d="M42 86 Q52 98 50 124 L42 124 Z" p={p} opacity={0.12} />
      <Shade d="M158 86 Q148 98 150 124 L158 124 Z" p={p} opacity={0.12} />
      {/* cavas e punhos */}
      <Seam d="M52 31 Q44 62 42 88" p={p} />
      <Seam d="M148 31 Q156 62 158 88" p={p} />
      <Shade d="M9 85 L35 97 L34 106 L8 94 Z" p={p} opacity={0.14} />
      <Shade d="M191 85 L165 97 L166 106 L192 94 Z" p={p} opacity={0.14} />
      <Seam d="M9 85 L35 97" p={p} />
      <Seam d="M191 85 L165 97" p={p} />
      {/* pala de botões */}
      <Hi d="M93.5 40 L106.5 40 L106.5 226 L93.5 226 Z" p={p} opacity={0.14} />
      <Seam d="M93.5 42 L93.5 226" p={p} />
      <Seam d="M106.5 42 L106.5 226" p={p} />
      {BUTTON_Y.map((y) => (
        <Button key={y} cx={100} cy={y} p={p} r={2.3} />
      ))}
      {/* bolso */}
      <Seam d="M114 100 L140 100 L140 124 L127 130 L114 124 Z" p={p} />
      <Seam d="M116 104 L138 104" p={p} opacity={0.4} dash="2 2" />
      {/* barra */}
      <Seam d="M42 217 Q100 223 158 217" p={p} opacity={0.6} />
      {/* gola: sombra projetada + duas faces espelhadas */}
      <path d={LEAF_SHADOW} fill={p.shade} opacity={0.2} />
      <path d={LEAF_SHADOW} transform={`translate(200 0) scale(-1 1)`} fill={p.shade} opacity={0.2} />
      <path d={LEAF} fill={p.base} stroke={p.seam} strokeOpacity={0.8} strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={LEAF} transform={`translate(${mx(0)} 0) scale(-1 1)`} fill={p.base} stroke={p.seam} strokeOpacity={0.8} strokeWidth={1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <Hi d={LEAF} p={p} opacity={0.3} />
      <g transform={`translate(${mx(0)} 0) scale(-1 1)`}>
        <Hi d={LEAF} p={p} opacity={0.16} />
      </g>
    </>
  );
}
