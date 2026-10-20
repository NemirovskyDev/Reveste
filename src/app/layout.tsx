import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { MOTION_INIT_SCRIPT } from "@/lib/motion";
import { SITE_URL } from "@/lib/site";
import { StoreHydrator } from "@/store/StoreHydrator";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Reveste | Aluguel de roupas de marca por assinatura",
    template: "%s | Reveste",
  },
  description:
    "Escolha 4 peças por mês de marcas como C&A, Renner e Zara, use e devolva. Dê nova vida ao estoque que não vendeu.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Reveste",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf8fc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script abaixo pode pôr data-motion no <html> antes do React hidratar.
    <html lang="pt-BR" className={`${bricolage.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="fixed left-4 top-4 z-50 -translate-y-24 rounded-control bg-ink px-4 py-3 font-bold text-canvas focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <StoreHydrator />
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
