import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone da tela de início do iPhone: o cabide da marca sobre o rosa.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4c9d1",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none" stroke="#3b3a42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 9a3 3 0 1 0-3-3" />
          <path d="M16 9v3.5L3.5 22.5a2 2 0 0 0 1.2 3.5h22.6a2 2 0 0 0 1.2-3.5L16 12.5" />
        </svg>
      </div>
    ),
    size,
  );
}

export const dynamic = "force-static";
