import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/sacola", "/checkout", "/pedido", "/conta", "/entrar", "/criar-conta"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

export const dynamic = "force-static";
