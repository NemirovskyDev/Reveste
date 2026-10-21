import type { MetadataRoute } from "next";
import { CATALOG } from "@/data/catalog";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  { path: "", priority: 1 },
  { path: "/catalogo", priority: 0.9 },
  { path: "/assinatura", priority: 0.9 },
  { path: "/doar", priority: 0.6 },
  { path: "/guia-de-medidas", priority: 0.6 },
  { path: "/marcas", priority: 0.6 },
  { path: "/ajuda", priority: 0.6 },
  { path: "/termos", priority: 0.2 },
  { path: "/privacidade", priority: 0.2 },
] as const;

// Fixada no momento em que o sitemap é gerado (build): uma data que muda a cada visita enfraquece o sinal para os buscadores.
const lastModified = new Date();

// Só entram páginas públicas e indexáveis; sacola, pagamento, pedidos e conta ficam de fora.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({ url: `${SITE_URL}${path || "/"}`, lastModified, priority })),
    ...CATALOG.map((piece) => ({ url: `${SITE_URL}/peca/${piece.id}`, lastModified, priority: 0.7 })),
  ];
}

export const dynamic = "force-static";
