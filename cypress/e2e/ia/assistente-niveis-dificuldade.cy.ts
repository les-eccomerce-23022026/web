/**
 * Assistente de Livros — cenários por nível de dificuldade da pergunta.
 * Usa API real (POST /ia/chat) com cliente autenticado.
 */

const PERGUNTAS = {
  facil: 'livros de terror',
  medio: 'Quero ficção científica épica com mundos complexos e viagem no tempo',
  dificil:
    'Busco um livro de mistério policial ambientado no século XIX, com narrativa em primeira pessoa e final surpreendente — algo no estilo de Agatha Christie, mas mais sombrio',
  ultraDificil:
    'Preciso de recomendações para um clube de leitura que mistura filosofia existencialista, ficção distópica e não-ficção sobre neurociência: o grupo já leu Camus, Orwell e Sagan; queremos algo desafiador, em português ou com tradução reconhecida, preferencialmente menos de 400 páginas e publicado após 1990',
} as const;

function abrirChatEEnviar(pergunta: string) {
  cy.getDataCy('chat-flutuante-botao').should('be.visible').click();
  cy.getDataCy('chat-painel').should('be.visible');
  cy.getDataCy('chat-entrada-mensagem').type(pergunta, { delay: 0 });
  cy.getDataCy('chat-botao-enviar').click();
}

function validarRespostaAssistente() {
  cy.getDataCy('chat-mensagem-usuario', { timeout: 15000 }).should('be.visible');
  cy.getDataCy('chat-mensagem-assistente', { timeout: 90000 }).should('be.visible');
  cy.getDataCy('chat-erro').should('not.exist');
  cy.getDataCy('ia-servico-indisponivel').should('not.exist');
}

describe('Assistente IA — Níveis de dificuldade (API real)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude').as('saudeIA');
    cy.intercept('POST', '**/ia/chat').as('chatIA');
    cy.visit('/', { failOnStatusCode: false });
    cy.wait('@saudeIA', { timeout: 30000 });
  });

  it('[Fácil] pergunta curta e direta retorna resposta com produtos ou mensagem adequada', () => {
    abrirChatEEnviar(PERGUNTAS.facil);
    cy.wait('@chatIA', { timeout: 90000 }).its('response.statusCode').should('eq', 200);
    validarRespostaAssistente();
    cy.get('body').then(($body) => {
      const temProdutos = $body.find('[data-cy="ia-produto-card"]').length > 0;
      const temSemProdutos = $body.find('[data-cy="ia-sem-produtos"]').length > 0;
      expect(temProdutos || temSemProdutos, 'resposta com produtos ou aviso de vazio').to.be.true;
    });
  });

  it('[Médio] pergunta com gênero e critérios retorna recomendação estruturada', () => {
    abrirChatEEnviar(PERGUNTAS.medio);
    cy.wait('@chatIA', { timeout: 90000 }).its('response.statusCode').should('eq', 200);
    validarRespostaAssistente();
    cy.getDataCy('ia-produto-card').should('have.length.at.least', 1);
    cy.getDataCy('ia-produto-titulo').first().should('not.be.empty');
    cy.getDataCy('ia-produto-motivo').first().should('not.be.empty');
  });

  it('[Difícil] pergunta longa com múltiplos critérios mantém histórico no segundo turno', () => {
    abrirChatEEnviar(PERGUNTAS.dificil);
    cy.wait('@chatIA', { timeout: 90000 });
    validarRespostaAssistente();

    cy.getDataCy('chat-entrada-mensagem').type('Pode sugerir algo mais curto, com menos de 300 páginas?', {
      delay: 0,
    });
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA', { timeout: 90000 }).then((interception) => {
      expect(interception.request.body).to.have.property('historico');
      expect(interception.request.body.historico).to.be.an('array').and.have.length.at.least(2);
    });
    cy.getDataCy('chat-mensagem-assistente').should('have.length.at.least', 2);
  });

  it('[Ultra difícil] pergunta ambígua e restritiva não quebra a UI e retorna resposta', () => {
    abrirChatEEnviar(PERGUNTAS.ultraDificil);
    cy.wait('@chatIA', { timeout: 120000 }).its('response.statusCode').should('eq', 200);
    validarRespostaAssistente();
    cy.getDataCy('chat-entrada-mensagem').should('not.be.disabled');
    cy.getDataCy('chat-botao-enviar').should('exist');
  });
});
