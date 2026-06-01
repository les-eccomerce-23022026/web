/**
 * Assistente de Livros — perguntas naturais simulando intenção real de compra/busca.
 * API real (POST /ia/chat), cliente autenticado.
 */

const CENARIOS = [
  {
    id: 'presente',
    intencao: 'Presente com orçamento e perfil',
    pergunta:
      'Quero comprar um presente de aniversário para minha mãe de 68 anos: ela adora romances históricos, mas não gosta de finais tristes. Tem algo até R$ 60 que dê para entregar essa semana?',
  },
  {
    id: 'comparativo',
    intencao: 'Dúvida entre sagas para começar',
    pergunta:
      'Estou em dúvida entre começar O Senhor dos Anéis ou Game of Thrones — nunca li fantasia épica e só tenho umas 2 horas por semana. Qual vocês indicam para não desistir no meio?',
  },
  {
    id: 'continuidade-leitura',
    intencao: 'Próximo livro após leitura recente',
    pergunta:
      'Acabei de ler 1984 e adorei a crítica social, mas achei denso demais. Quero algo parecido porém mais leve para ler no metrô, de preferência com capítulos curtos.',
  },
  {
    id: 'infantojuvenil',
    intencao: 'Indicação para adolescente',
    pergunta:
      'Meu filho de 12 anos terminou Percy Jackson e quer outra série de aventura com mitologia ou magia. O que vocês têm no catálogo que seja adequado para a idade dele?',
  },
  {
    id: 'dupla-intencao',
    intencao: 'Dois perfis de leitura na mesma compra',
    pergunta:
      'Preciso levar dois livros no fim de semana: um suspense para ler à noite (nada muito explícito) e um de desenvolvimento pessoal curto para ouvir depois em audiobook. O que combina com isso?',
  },
  {
    id: 'restricao-fisica',
    intencao: 'Limite de páginas e estante',
    pergunta:
      'Minha estante está lotada, então prefiro títulos com menos de 250 páginas. Me indica um mistério envolvente que prenda já no primeiro capítulo?',
  },
  {
    id: 'ocasiao',
    intencao: 'Viagem / praia',
    pergunta:
      'Vou viajar para a praia e quero uma leitura divertida, com humor leve, que não seja série longa — algo para terminar em uma semana de sol.',
  },
  {
    id: 'catalogo-especifico',
    intencao: 'Busca específica (teste anti-invenção)',
    pergunta:
      'Vocês têm algum livro de ficção científica hard sci-fi sobre colonização de Marte escrito por autor brasileiro e publicado depois de 2015?',
  },
] as const;

describe('Assistente IA — Perguntas naturais (intenção de compra)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude').as('saudeIA');
    cy.visit('/', { failOnStatusCode: false });
    cy.wait('@saudeIA', { timeout: 30000 });
    cy.getDataCy('chat-flutuante-botao').should('be.visible').click();
    // chat-sidebar = PainelLateral (drawer); confirma abertura do painel lateral
    cy.getDataCy('chat-sidebar').should('be.visible');
  });

  CENARIOS.forEach((cenario) => {
    it(`[${cenario.id}] ${cenario.intencao}`, () => {
      cy.intercept('POST', '**/ia/chat').as('chatIA');

      cy.getDataCy('chat-entrada-mensagem').clear().type(cenario.pergunta, { delay: 0 });
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatIA', { timeout: 120000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        expect(interception.request.body.mensagem).to.eq(cenario.pergunta);
      });

      cy.getDataCy('chat-mensagem-usuario').should('contain.text', cenario.pergunta.slice(0, 40));
      cy.getDataCy('chat-mensagem-assistente', { timeout: 90000 }).should('be.visible');
      cy.getDataCy('chat-erro').should('not.exist');

      cy.get('body').then(($body) => {
        const temCard = $body.find('[data-cy="ia-produto-card"]').length > 0;
        const temVazio = $body.find('[data-cy="ia-sem-produtos"]').length > 0;
        expect(temCard || temVazio).to.be.true;
      });

      cy.getDataCy('chat-botao-limpar').click();
    });
  });
});
