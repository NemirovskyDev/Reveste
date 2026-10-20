/**
 * RASCUNHO para revisão jurídica antes da publicação definitiva. Os textos
 * abaixo não substituem a análise de um advogado (CDC, LGPD, Marco Civil).
 * Dados da empresa vêm de company.ts; quando ausentes, as frases que os
 * citam são omitidas ou apontam para o formulário de /ajuda.
 */
import { company as defaultCompany, type Company } from "./company";

export type LegalSection = { id: string; title: string; paragraphs: readonly string[] };
export type LegalDocument = { title: string; updatedAt: string; sections: readonly LegalSection[] };

const UPDATED_AT = "2026-10-19";

const compact = (items: readonly (string | false | null)[]): string[] =>
  items.filter((item): item is string => typeof item === "string" && item.length > 0);

export function buildLegal(c: Company): { TERMS: LegalDocument; PRIVACY: LegalDocument } {
  const who = c.legalName ? `${c.legalName}, que atua sob a marca ${c.tradeName}` : c.tradeName;
  const identification = compact([
    `Estes termos regem o uso do site e dos serviços de aluguel de ${c.tradeName}, oferecidos por ${who}.`,
    c.cnpj && `CNPJ: ${c.cnpj}.`,
    c.address && `Endereço: ${c.address}.`,
  ]);
  const contactTerms = c.contactEmail
    ? `Para falar com a ${c.tradeName}, escreva para ${c.contactEmail} ou use o formulário da página de ajuda. Atendemos ${c.supportHours}.`
    : `Para falar com a ${c.tradeName}, use o formulário da página de ajuda. Atendemos ${c.supportHours}.`;
  const privacyContact = c.privacyEmail
    ? `Para exercer seus direitos ou tirar dúvidas sobre dados pessoais, escreva para ${c.privacyEmail}, o canal do encarregado de proteção de dados. Você também pode usar o formulário da página de ajuda.`
    : "Para exercer seus direitos ou tirar dúvidas sobre dados pessoais, use o formulário da página de ajuda e indique que o assunto é privacidade. Responderemos dentro dos prazos da lei.";

  const TERMS: LegalDocument = {
    title: "Termos de uso e aluguel",
    updatedAt: UPDATED_AT,
    sections: [
      { id: "quem-somos", title: "Quem somos", paragraphs: identification },
      {
        id: "servico",
        title: "O serviço",
        paragraphs: [
          `A ${c.tradeName} aluga peças de marca que não foram vendidas. Você pode alugar peças avulsas por 7, 14 ou 30 dias, ou assinar um plano mensal de 4 peças com renovação.`,
          "As peças pertencem à Reveste ou às marcas parceiras. Você recebe o direito de usar a peça durante o prazo contratado, sem transferência de propriedade, salvo se comprar a peça.",
        ],
      },
      {
        id: "cadastro",
        title: "Cadastro e uso do site",
        paragraphs: [
          "Para alugar, você precisa ter 18 anos ou mais e informar dados verdadeiros e atualizados. Você é responsável pelas informações que fornece.",
          "Não use o site para fins ilegais, para tentar acessar áreas restritas ou para prejudicar o funcionamento do serviço.",
        ],
      },
      {
        id: "precos",
        title: "Preços e pagamento",
        paragraphs: [
          "O aluguel custa 15%, 25% ou 40% do valor da peça para 7, 14 ou 30 dias. No plano, cada peça tem o aluguel de 30 dias com 5% de desconto na linha Essencial e 10% na Premium.",
          "Aceitamos Pix e cartão. Mostramos o valor total antes de você confirmar o pedido. O plano é cobrado a cada renovação de 30 dias.",
        ],
      },
      {
        id: "entrega-devolucao",
        title: "Entrega, uso e devolução",
        paragraphs: [
          "O prazo de aluguel começa na entrega. Devolva a peça sem objetos pessoais, na embalagem recebida, dentro do prazo, sem lavar nem fazer ajustes.",
          "Cuide da peça como cuidaria de uma peça sua. Não faça alterações, reparos ou tingimento.",
        ],
      },
      {
        id: "atraso-dano-perda",
        title: "Atraso, dano e perda",
        paragraphs: [
          "Em caso de atraso, cobramos por dia a diária do aluguel de 30 dias da peça, acrescida de 50%.",
          "Desgaste normal de uso não gera cobrança. Dano leve gera cobrança de 15% do valor da peça. Dano grave gera cobrança do valor da peça menos o aluguel líquido já pago por ela.",
          "Em caso de perda ou peça não devolvida, cobramos o valor integral da peça.",
        ],
      },
      {
        id: "compra",
        title: "Compra da peça",
        paragraphs: [
          "Você pode comprar a peça que alugou. O preço é 70% do valor da peça menos o aluguel líquido já pago, e nunca fica abaixo de zero.",
        ],
      },
      {
        id: "cancelamento",
        title: "Cancelamento e arrependimento",
        paragraphs: [
          "Você pode cancelar o plano antes da data de renovação para evitar a próxima cobrança. As peças em uso seguem com você até o fim do período pago.",
          "Nas compras feitas pelo site, você tem o direito de arrependimento em até 7 dias após o recebimento, nos termos do Código de Defesa do Consumidor. Para exercê-lo, fale com a gente e devolva a peça sem uso.",
        ],
      },
      {
        id: "responsabilidade",
        title: "Responsabilidade",
        paragraphs: [
          "Fazemos o possível para manter o site disponível e as informações corretas, mas o serviço pode ter interrupções ou erros pontuais. Corrigimos o que for identificado.",
          "A Reveste não se responsabiliza por uso da peça em desacordo com estes termos nem por falhas causadas por terceiros fora do nosso controle.",
        ],
      },
      {
        id: "alteracoes",
        title: "Alterações destes termos",
        paragraphs: [
          "Podemos atualizar estes termos. A data de atualização aparece no topo da página, e mudanças relevantes valem para pedidos feitos depois dela.",
        ],
      },
      {
        id: "foro",
        title: "Contato e foro",
        paragraphs: [
          contactTerms,
          "Estes termos seguem a lei brasileira. Fica eleito o foro do domicílio do consumidor para resolver conflitos.",
        ],
      },
    ],
  };

  const PRIVACY: LegalDocument = {
    title: "Política de privacidade",
    updatedAt: UPDATED_AT,
    sections: [
      {
        id: "controlador",
        title: "Quem cuida dos seus dados",
        paragraphs: compact([
          `A ${c.tradeName} é a controladora dos dados pessoais tratados neste site, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).`,
          c.legalName && `Razão social: ${c.legalName}.`,
          c.cnpj && `CNPJ: ${c.cnpj}.`,
          c.address && `Endereço: ${c.address}.`,
        ]),
      },
      {
        id: "dados-coletados",
        title: "Quais dados coletamos",
        paragraphs: [
          "Coletamos os dados que você informa: nome, e-mail, telefone, endereço de entrega, medidas e preferências de tamanho, e as peças que você escolhe.",
          "Ao fazer um pagamento, o meio de pagamento processa os dados do cartão ou do Pix. Não guardamos o número completo do seu cartão.",
          "Coletamos também dados técnicos de navegação, como tipo de dispositivo, navegador e páginas visitadas.",
        ],
      },
      {
        id: "finalidades",
        title: "Para que usamos seus dados",
        paragraphs: [
          "Usamos seus dados para processar pedidos e planos, entregar e receber as peças, cobrar, atender você e cumprir obrigações legais.",
          "Também usamos dados de navegação para manter o site seguro, entender o que funciona e melhorar a experiência.",
        ],
      },
      {
        id: "bases-legais",
        title: "Bases legais",
        paragraphs: [
          "Tratamos dados para executar o contrato de aluguel ou compra, cumprir obrigações legais e regulatórias, atender interesses legítimos (como segurança e prevenção a fraudes) e, quando necessário, com o seu consentimento.",
        ],
      },
      {
        id: "compartilhamento",
        title: "Com quem compartilhamos",
        paragraphs: [
          "Compartilhamos dados apenas quando necessário: com transportadoras para a entrega e a devolução, com meios de pagamento para a cobrança e com prestadores de tecnologia que operam o site.",
          "Esses parceiros só podem usar os dados para a finalidade contratada. Não vendemos seus dados.",
          "Também podemos compartilhar dados quando a lei ou uma autoridade exigir.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies e armazenamento local",
        paragraphs: [
          "O site usa o armazenamento do seu navegador para lembrar preferências e itens que você selecionou, como as peças do seu plano. Esses dados ficam no seu dispositivo.",
          "Você pode limpar esses dados nas configurações do navegador. Algumas funções, como lembrar sua seleção, deixam de funcionar depois disso.",
        ],
      },
      {
        id: "direitos",
        title: "Seus direitos",
        paragraphs: [
          "Você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento e revogação do consentimento.",
          privacyContact,
        ],
      },
      {
        id: "retencao",
        title: "Por quanto tempo guardamos",
        paragraphs: [
          "Guardamos os dados pelo tempo necessário para cumprir as finalidades acima e as obrigações legais, como as fiscais e as de defesa em processos. Depois disso, eliminamos ou anonimizamos os dados.",
        ],
      },
      {
        id: "seguranca",
        title: "Segurança",
        paragraphs: [
          "Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso indevido, perda e alteração. Nenhum sistema é totalmente invulnerável, e avisamos você e a autoridade competente se houver incidente relevante.",
        ],
      },
      {
        id: "alteracoes",
        title: "Alterações desta política",
        paragraphs: ["Podemos atualizar esta política. A data de atualização aparece no topo da página."],
      },
    ],
  };

  return { TERMS, PRIVACY };
}

export const { TERMS, PRIVACY } = buildLegal(defaultCompany);
