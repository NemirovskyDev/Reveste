import type { NextConfig } from "next";

// Publicado no GitHub Pages em https://nemirovskydev.github.io/Reveste/. Em desenvolvimento a raiz é "/".
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const basePath = isGitHubPages ? "/Reveste" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  // Um <img> comum não recebe o basePath sozinho: `assetUrl` (src/lib/assets.ts) lê este valor.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
