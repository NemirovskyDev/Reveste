import { Hi, Seam, Shade, fanStrips, type PartProps } from "./shared";

// Pregas do godê: abrem da cintura (y 86) até além da barra (a barra recorta).
const STRIPS = fanStrips({ top: [60, 140, 86], bottom: [14, 186, 238], count: 9 });

export function DressFront({ p }: PartProps) {
  return (
    <>
      {STRIPS.map((s, i) =>
        i % 2 === 0 ? <Shade key={s.band} d={s.band} p={p} opacity={0.09} /> : <Hi key={s.band} d={s.band} p={p} opacity={0.09} />,
      )}
      {STRIPS.slice(1).map((s) => (
        <Seam key={s.line} d={s.line} p={p} opacity={0.18} />
      ))}
      {/* corpete: leve sombra lateral e pences (da cintura ao busto) */}
      <Shade d="M52 30 L60 80 L68 80 L62 30 Z" p={p} opacity={0.12} />
      <Shade d="M148 30 L140 80 L132 80 L138 30 Z" p={p} opacity={0.12} />
      <path d="M85 80 L88 54 L91 80 Z" fill={p.shade} opacity={0.18} />
      <path d="M115 80 L112 54 L109 80 Z" fill={p.shade} opacity={0.18} />
      {/* acabamento do decote e das cavas */}
      <path d="M78 18 Q100 44 122 18" fill="none" stroke={p.hi} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
      <Seam d="M80 22 Q100 47 120 22" p={p} opacity={0.55} />
      <Seam d="M52 30 L60 80" p={p} opacity={0.5} />
      <Seam d="M148 30 L140 80" p={p} opacity={0.5} />
      {/* cinto fino com fivela */}
      <path d="M58 78 L142 78 L141 89 L59 89 Z" fill={p.shade} opacity={0.24} />
      <path d="M58 78 L142 78 L141.6 82 L58.4 82 Z" fill={p.hi} opacity={0.2} />
      <Seam d="M58 78 L142 78" p={p} />
      <Seam d="M59 89 L141 89" p={p} />
      <rect x={93} y={76.5} width={14} height={14} rx={2.5} fill="none" stroke={p.button} strokeWidth={2} />
      <rect x={93} y={76.5} width={14} height={14} rx={2.5} fill="none" stroke={p.edge} strokeWidth={0.6} opacity={0.6} />
      {/* costura da barra */}
      <Seam d="M30 221 Q100 231 170 221" p={p} opacity={0.5} dash="3 2.5" />
    </>
  );
}
