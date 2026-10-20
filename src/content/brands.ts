export type BrandBenefit = { id: string; title: string; text: string };
export type BrandStep = { id: string; title: string; text: string };

export const BRAND_PITCH = {
  title: "Dê uma segunda vida ao estoque parado",
  subtitle:
    "Coloque peças que não foram vendidas em circulação por meio do aluguel, sem custo de entrada e sem operação extra para a sua equipe.",
  benefits: [
    {
      id: "consignacao",
      title: "Consignação sem custo de entrada",
      text: "Você entrega o estoque em consignação. Não há taxa para começar.",
    },
    {
      id: "operacao",
      title: "Operação por nossa conta",
      text: "A Reveste cuida de higienização, entrega, devolução e atendimento às clientes.",
    },
    {
      id: "receita",
      title: "Parte de cada aluguel",
      text: "A marca recebe uma parte do valor de cada aluguel das suas peças.",
    },
    {
      id: "destino",
      title: "Destino para o fim de ciclo",
      text: "Peças que saem de circulação vão para outlet ou doação, conforme combinado com a marca.",
    },
  ] satisfies readonly BrandBenefit[],
  steps: [
    { id: "contato", title: "Conversa inicial", text: "Você envia o formulário e conta sobre o estoque parado." },
    { id: "selecao", title: "Seleção das peças", text: "Definimos juntos quais peças entram no catálogo." },
    { id: "acordo", title: "Acordo de consignação", text: "Combinamos as condições da parceria, incluindo a parte da marca em cada aluguel." },
    { id: "catalogo", title: "Peças no catálogo", text: "As peças recebem fotos, entram no site e passam a ser alugadas." },
  ] satisfies readonly BrandStep[],
} as const;

export type BrandFormField = {
  name: "brandName" | "contactName" | "email" | "phone" | "stockSize" | "message";
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
};

export const STOCK_SIZE_OPTIONS = [
  { value: "ate-100", label: "Até 100 peças" },
  { value: "100-500", label: "De 100 a 500 peças" },
  { value: "500-2000", label: "De 500 a 2.000 peças" },
  { value: "mais-2000", label: "Mais de 2.000 peças" },
] as const;

export const BRAND_FORM_FIELDS: readonly BrandFormField[] = [
  { name: "brandName", label: "Nome da marca", type: "text", required: true },
  { name: "contactName", label: "Nome do contato", type: "text", required: true },
  { name: "email", label: "E-mail", type: "email", required: true, placeholder: "voce@marca.com.br" },
  { name: "phone", label: "Telefone (opcional)", type: "tel", required: false, placeholder: "(11) 90000-0000" },
  {
    name: "stockSize",
    label: "Porte do estoque parado (opcional)",
    type: "select",
    required: false,
    options: STOCK_SIZE_OPTIONS,
  },
  {
    name: "message",
    label: "Mensagem",
    type: "textarea",
    required: true,
    placeholder: "Conte o que você tem em estoque e o que espera da parceria.",
  },
];
