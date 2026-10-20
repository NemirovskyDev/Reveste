import { Button, Hi, Seam, Shade, fanStrips, type PartProps } from "./shared";

// Plissado em leque: 12 pregas do cós (y 40) até além da barra (a barra recorta).
const STRIPS = fanStrips({ top: [54, 146, 40], bottom: [10, 190, 234], count: 12 });

export function SkirtFront({ p }: PartProps) {
  return (
    <>
      {STRIPS.map((s, i) =>
        i % 2 === 0 ? <Shade key={s.band} d={s.band} p={p} opacity={0.12} /> : <Hi key={s.band} d={s.band} p={p} opacity={0.12} />,
      )}
      {STRIPS.slice(1).map((s) => (
        <Seam key={s.line} d={s.line} p={p} opacity={0.3} />
      ))}
      {/* cós e botão */}
      <Hi d="M50 22 L150 22 L150 40 L50 40 Z" p={p} opacity={0.18} />
      <Seam d="M54 40 L146 40" p={p} />
      <Seam d="M54 22 L146 22" p={p} opacity={0.5} />
      <Button cx={100} cy={31} p={p} r={3} />
      <Seam d="M30 217 Q100 227 170 217" p={p} opacity={0.5} dash="3 2.5" />
    </>
  );
}
