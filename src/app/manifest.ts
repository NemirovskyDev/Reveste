import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reveste",
    short_name: "Reveste",
    description: "Aluguel de roupas de marca por assinatura.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8fc",
    theme_color: "#fbf8fc",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

export const dynamic = "force-static";
