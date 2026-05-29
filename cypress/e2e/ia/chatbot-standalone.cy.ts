// Standalone Cypress test spec bypassing support files
Cypress.Commands.add('getDataCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

describe('Assistente IA — Fluxo de Recomendação via Chatbot (CDU010)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');
    cy.visit('/', { failOnStatusCode: false });
  });

  it('deve renderizar a interface do assistente com campo de entrada e botão de envio', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-painel').should('be.visible');
    cy.getDataCy('chat-entrada-mensagem')
      .should('be.visible')
      .and('have.attr', 'placeholder');
    cy.getDataCy('chat-botao-enviar')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('deve enviar uma mensagem ao chatbot e exibir a resposta do assistente (RF0104)', () => {
    const pergunta = 'Quero livros de ficção científica épica com mundos complexos';

    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type(pergunta);
    cy.getDataCy('chat-botao-enviar').click();

    cy.getDataCy('chat-mensagem-usuario')
      .should('be.visible')
      .and('contain.text', pergunta);

    cy.wait('@chatIA');

    cy.getDataCy('chat-mensagem-assistente')
      .should('be.visible')
      .and('contain.text', 'ficção científica');
  });
});
