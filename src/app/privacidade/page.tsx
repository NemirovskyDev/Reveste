import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/help/LegalDocumentView";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como a Reveste coleta, usa e protege seus dados pessoais, com base na LGPD, e como exercer seus direitos de titular.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return <LegalDocumentView document={PRIVACY} />;
}
