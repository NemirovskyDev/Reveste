import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { CATALOG, findPiece } from "@/data/catalog";
import { GARMENT_SHAPES } from "@/data/garments";
import { formatMoney } from "@/lib/format";
import { pieceBrandName } from "@/lib/piece";
import { rentalCents } from "@/lib/pricing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Peça para alugar na Reveste";

export function generateStaticParams() {
  return CATALOG.map((piece) => ({ id: piece.id }));
}

// Imagem de compartilhamento da peça: o contorno na cor real da peça, a marca, o nome e o preço do aluguel.
export default async function PieceImage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const piece = findPiece(id);
  if (!piece) notFound();
  const shape = GARMENT_SHAPES[piece.type];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: piece.tier === "premium" ? "#fad9c1" : "#d9ccf0",
          padding: 72,
          color: "#3b3a42",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Reveste</div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{pieceBrandName(piece)}</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>{piece.name}</div>
          {/* Um único filho de texto: o gerador de imagem exige display:flex quando há mais de um. */}
          <div style={{ fontSize: 40 }}>{`Alugue por ${formatMoney(rentalCents(piece, 7))} em 7 dias`}</div>
        </div>
        <div
          style={{
            display: "flex",
            width: 400,
            height: 480,
            alignItems: "center",
            justifyContent: "center",
            background: "#fbf8fc",
            border: "6px solid #3b3a42",
            borderRadius: 32,
          }}
        >
          <svg width="320" height="384" viewBox="0 0 200 240">
            <path d={shape.outline} fill={piece.color} stroke="#3b3a42" strokeWidth="3" strokeLinejoin="round" />
            {shape.seams.map((d) => (
              <path key={d} d={d} fill="none" stroke="#3b3a42" strokeWidth="1.5" strokeOpacity="0.45" />
            ))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}

export const dynamic = "force-static";
