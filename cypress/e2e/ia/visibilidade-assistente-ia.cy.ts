/**
 * Visibilidade do assistente de IA conforme autenticação.
 * Visitante não logado não deve ver o botão flutuante.
 */

describe('Assistente IA — Visibilidade por autenticação', () => {
  it('não deve exibir o botão flutuante para visitante não autenticado', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('not.exist');
  });

  it('deve exibir o botão flutuante para cliente autenticado', () => {
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.loginProgramatico('cliente');
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('be.visible');
  });

  it('não deve exibir o botão flutuante para administrador logado', () => {
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.loginProgramatico('admin');
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('not.exist');
  });
});
