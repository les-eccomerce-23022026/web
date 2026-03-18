describe('Administrador - Autenticação', () => {

  it('deve logar como administrador e acessar o painel administrativo', () => {
    cy.fixture('auth/login_admin_sucesso').then((json) => {
      cy.intercept('POST', '**/auth/login', json).as('loginAdmin');
      cy.login(json.dados.user.email, 'password123');
      cy.wait('@loginAdmin');
      cy.url().should('include', '/admin');
      cy.contains('h2', 'Painel Administrativo').should('be.visible');
    });
  });

  it('deve impedir que cliente acesse áreas administrativas', () => {
    cy.fixture('auth/login_cliente_sucesso').then((json) => {
      cy.intercept('POST', '**/auth/login', json).as('loginRequest');
      cy.login(json.dados.user.email, 'password123');
      cy.wait('@loginRequest');
      
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });
  });
});
