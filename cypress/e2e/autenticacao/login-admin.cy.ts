describe('Autenticação — Login Administrador', () => {

  it('deve logar como administrador e acessar o painel administrativo', () => {
    const { email, senha } = Cypress.env('admin') || { email: '', senha: '' };
    
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(email);
    cy.get('[data-cy="login-password-input"]').type(senha);
    cy.get('[data-cy="login-submit-button"]').click();
    
    cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
    cy.visit('/admin');
    cy.url().should('include', '/admin');
    cy.get('h1, h2', { timeout: 10000 }).should('be.visible');
  });

  it('deve impedir que cliente acesse áreas administrativas', () => {
    const { email, senha } = Cypress.env('cliente') || { email: '', senha: '' };
    
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(email);
    cy.get('[data-cy="login-password-input"]').type(senha);
    cy.get('[data-cy="login-submit-button"]').click();
    
    cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
    
    cy.visit('/admin', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin', { timeout: 10000 });
  });
});
