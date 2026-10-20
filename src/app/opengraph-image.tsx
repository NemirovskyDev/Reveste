import { ImageResponse } from "next/og";

export const alt = "Reveste: aluguel de roupas de marca por assinatura";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem de compartilhamento (WhatsApp, redes sociais): título grande sobre a paleta da marca.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbf8fc",
          padding: 72,
          color: "#3b3a42",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 52, fontWeight: 800 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f4c9d1", display: "flex" }} />
          Reveste
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 980 }}>
            A roupa que sobrou vira a roupa do seu mês.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["#d9ccf0", "#fad9c1", "#cfe8dc", "#f4c9d1"].map((color) => (
              <div key={color} style={{ width: 120, height: 20, borderRadius: 10, background: color, border: "3px solid #3b3a42" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

export const dynamic = "force-static";
