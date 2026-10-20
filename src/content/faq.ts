export type FaqCategory = "assinatura" | "aluguel" | "devolucao" | "pagamento" | "marcas";

export type FaqItem = { id: string; category: FaqCategory; question: string; answer: string };

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  assinatura: "Assinatura",
  aluguel: "Aluguel",
  devolucao: "Entrega e devolução",
  pagamento: "Pagamento",
  marcas: "Marcas",
};

export const FAQ: readonly FaqItem[] = [
  {
    id: "como-funciona-plano",
    category: "assinatura",
    question: "Como funciona o plano de 4 peças?",
    answer:
      "Você escolhe 4 peças diferentes e fica com elas por 30 dias. O valor mensal é a soma do aluguel de 30 dias de cada peça, já com o desconto do plano.",
  },
  {
    id: "renovacao-mensal",
    category: "assinatura",
    question: "O plano renova sozinho todo mês?",
    answer:
      "Sim. A cada 30 dias o plano renova com as mesmas peças ou com a seleção que você montar antes da data de renovação. Você pode cancelar antes da renovação para evitar a cobrança.",
  },
  {
    id: "trocar-pecas",
    category: "assinatura",
    question: "Posso trocar as peças do plano?",
    answer:
      "Pode, na renovação mensal. Escolha as novas peças antes da data de renovação e devolva as anteriores no prazo combinado.",
  },
  {
    id: "descontos-plano",
    category: "assinatura",
    question: "Que desconto o plano dá?",
    answer:
      "O plano tem 5% de desconto nas peças Essencial e 10% nas peças Premium, calculados sobre o aluguel de 30 dias de cada peça.",
  },
  {
    id: "pecas-repetidas",
    category: "assinatura",
    question: "Posso repetir a mesma peça no plano?",
    answer: "Não. O plano reúne 4 peças distintas, cada uma com seu tamanho e seu desconto.",
  },
  {
    id: "cancelar-plano",
    category: "assinatura",
    question: "Como cancelo a assinatura?",
    answer:
      "Cancele antes da data de renovação para que o próximo ciclo não seja cobrado. As peças em uso continuam com você até o fim do período já pago, e a devolução segue o prazo normal.",
  },
  {
    id: "prazos-aluguel",
    category: "aluguel",
    question: "Quais são os prazos de aluguel avulso?",
    answer:
      "Você aluga cada peça por 7, 14 ou 30 dias. O aluguel custa 15%, 25% ou 40% do valor da peça, conforme o prazo.",
  },
  {
    id: "alugar-e-comprar",
    category: "aluguel",
    question: "Posso alugar e depois comprar a peça?",
    answer:
      "Pode. O preço de compra é 70% do valor da peça, menos o aluguel líquido que você já pagou por ela. O valor nunca fica abaixo de zero.",
  },
  {
    id: "comprar-avulso",
    category: "aluguel",
    question: "Posso comprar uma peça sem alugar antes?",
    answer:
      "Pode. Na página de cada peça há o botão Comprar, que vale para qualquer pessoa, com ou sem plano. O preço é 70% do valor da peça. Quem já alugou paga menos, porque o aluguel líquido pago é descontado.",
  },
  {
    id: "doar-roupas",
    category: "aluguel",
    question: "Posso doar roupas para a Reveste sem ser uma empresa?",
    answer:
      "Pode. Qualquer pessoa pode doar. A cada 3 peças doadas você ganha um desconto de 15% a 50%, conforme o tipo das peças, que vale para alugar ou comprar. O cadastro está na página Doar roupas e o valor final é confirmado depois que a equipe confere as peças.",
  },
  {
    id: "escolher-tamanho",
    category: "aluguel",
    question: "Como escolho o tamanho certo?",
    answer:
      "Cada peça mostra os tamanhos disponíveis e a descrição da modelagem. Compare com uma peça sua que serve bem e, na dúvida, pergunte pelo formulário de contato na página de ajuda.",
  },
  {
    id: "caimento",
    category: "aluguel",
    question: "E se a peça não cair bem?",
    answer:
      "Em um plano, você troca a peça na próxima renovação. No aluguel avulso, a peça segue até o fim do prazo contratado. Por isso vale conferir tamanho e modelagem antes de fechar.",
  },
  {
    id: "estado-das-pecas",
    category: "aluguel",
    question: "As peças são novas?",
    answer:
      "São peças de marca que não foram vendidas. Cada uma passa por conferência e higienização antes de chegar até você.",
  },
  {
    id: "higienizacao",
    category: "aluguel",
    question: "Como as peças são higienizadas?",
    answer:
      "Toda peça é conferida e limpa a cada devolução, conforme as instruções da etiqueta. Só volta ao catálogo depois dessa etapa.",
  },
  {
    id: "cuidados-uso",
    category: "aluguel",
    question: "Preciso lavar a peça antes de devolver?",
    answer:
      "Não. Devolva a peça como está, sem lavar nem passar. A higienização é por nossa conta.",
  },
  {
    id: "entrega",
    category: "devolucao",
    question: "Como recebo as peças?",
    answer:
      "Enviamos as peças ao endereço informado no pedido. O prazo de aluguel e o plano são contados a partir da entrega.",
  },
  {
    id: "como-devolver",
    category: "devolucao",
    question: "Como devolvo uma peça?",
    answer:
      "Coloque a peça na embalagem que recebeu e envie conforme as instruções que acompanham o pedido. Guarde o comprovante de envio.",
  },
  {
    id: "atraso",
    category: "devolucao",
    question: "O que acontece se eu atrasar a devolução?",
    answer:
      "Cobramos uma diária por dia de atraso. Ela equivale à diária do aluguel de 30 dias da peça, mais 50%.",
  },
  {
    id: "dano-leve",
    category: "devolucao",
    question: "E se a peça voltar com um dano leve?",
    answer:
      "Desgaste normal de uso não gera cobrança. Para dano leve, como uma mancha que não sai ou um pequeno rasgo reparável, cobramos 15% do valor da peça.",
  },
  {
    id: "dano-grave",
    category: "devolucao",
    question: "E se o dano for grave?",
    answer:
      "Quando a peça não pode mais ser alugada, cobramos o valor da peça menos o aluguel líquido que você já pagou por ela.",
  },
  {
    id: "perda",
    category: "devolucao",
    question: "E se eu perder a peça?",
    answer: "Em caso de perda ou de peça não devolvida, cobramos o valor integral da peça.",
  },
  {
    id: "formas-pagamento",
    category: "pagamento",
    question: "Quais formas de pagamento vocês aceitam?",
    answer: "Aceitamos Pix e cartão. Você escolhe a forma de pagamento ao finalizar o pedido.",
  },
  {
    id: "quando-cobra",
    category: "pagamento",
    question: "Quando a cobrança acontece?",
    answer:
      "No aluguel avulso, o pagamento acontece ao fechar o pedido. No plano, a cobrança se repete a cada renovação de 30 dias.",
  },
  {
    id: "taxas-extras",
    category: "pagamento",
    question: "Existem taxas além do aluguel?",
    answer:
      "Só em situações previstas: atraso, dano ou perda. Mostramos os valores antes de você fechar o pedido, e as regras ficam na página de regras do aluguel.",
  },
  {
    id: "como-marcas-participam",
    category: "marcas",
    question: "Como uma marca participa da Reveste?",
    answer:
      "A marca entrega o estoque parado em consignação, sem custo de entrada. A Reveste cuida de higienização, entrega, devolução e atendimento, e a marca recebe uma parte de cada aluguel.",
  },
  {
    id: "fim-de-circulacao",
    category: "marcas",
    question: "O que acontece com as peças que saem de circulação?",
    answer: "Peças que não voltam mais ao catálogo seguem para outlet ou doação, conforme combinado com a marca.",
  },
  {
    id: "contato-marcas",
    category: "marcas",
    question: "Sou de uma marca. Como falo com vocês?",
    answer: "Preencha o formulário da página para marcas com o porte do seu estoque parado. Retornamos pelo e-mail informado.",
  },
];
