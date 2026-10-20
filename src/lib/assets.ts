/** Caminho de um arquivo de `public/` com o prefixo do site (no GitHub Pages ele fica em /Reveste). */
export function assetUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path.startsWith("/") ? path : `/${path}`}`;
}
