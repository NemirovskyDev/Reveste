export const SITE_NAME = "Reveste";

/**
 * Endereço público do site: base do canonical, do sitemap e dos dados estruturados. Em produção a variável é
 * obrigatória, porque cair para localhost publicaria endereços errados para os buscadores.
 */
export const SITE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error("Defina NEXT_PUBLIC_SITE_URL com o endereço público do site, por exemplo https://reveste.com.br");
  }
  return (url ?? "http://localhost:3000").replace(/\/+$/, "");
})();

export const MAIN_NAV = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/assinatura", label: "Assinatura" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/doar", label: "Doar roupas" },
  { href: "/marcas", label: "Para marcas" },
  { href: "/ajuda", label: "Ajuda" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Loja",
    links: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/assinatura", label: "Monte seu plano" },
      { href: "/sacola", label: "Sacola" },
      { href: "/conta", label: "Minha conta" },
      { href: "/doar", label: "Doar roupas" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { href: "/ajuda", label: "Perguntas frequentes" },
      { href: "/guia-de-medidas", label: "Guia de medidas" },
      { href: "/ajuda#regras", label: "Atraso, dano e compra" },
      { href: "/marcas", label: "Para marcas" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos de uso e aluguel" },
      { href: "/privacidade", label: "Política de privacidade" },
    ],
  },
] as const;

/** Só aceita caminhos internos como destino de redirecionamento (evita redirecionar para outro site). */
export function safeNextPath(value: string | null | undefined, fallback = "/conta"): string {
  // Uma única "/" no início e nenhum caractere de controle nem "\": o navegador descarta tab e quebra de linha,
  // então "/\t/site.com" viraria "//site.com" e levaria para fora.
  if (!value || !/^\/(?![/\\])[^\u0000-\u001f\u007f\\]*$/.test(value)) return fallback;
  return value;
}
