/**
 * Dados institucionais da Reveste. Campos null ainda não foram informados pelo
 * dono do negócio: todo texto que os usa precisa funcionar sem eles.
 */
export type Company = {
  tradeName: string;
  legalName: string | null;
  cnpj: string | null;
  address: string | null;
  contactEmail: string | null;
  privacyEmail: string | null;
  supportHours: string;
};

export const company: Company = {
  tradeName: "Reveste",
  legalName: null,
  cnpj: null,
  address: null,
  contactEmail: null,
  privacyEmail: null,
  supportHours: "segunda a sexta, das 9h às 18h",
};
