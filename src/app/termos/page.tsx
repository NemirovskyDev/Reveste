import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/help/LegalDocumentView";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Termos de uso e aluguel",
  description:
    "Regras de cadastro, preços, entrega, devolução, atraso, dano, compra da peça e cancelamento do aluguel de roupas por assinatura da Reveste.",
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return <LegalDocumentView document={TERMS} />;
}
