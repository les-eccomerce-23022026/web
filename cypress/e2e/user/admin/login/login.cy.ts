describe('Administrador - Autenticação', () => {

  it('deve logar como administrador e acessar o painel administrativo', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    const email = 'cristiana@gmail.com';
    const senha = 'admin@asdfJKLÇ123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { email, senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.dados?.user?.role).to.eq('admin');
    });

    cy.login(email, senha);
    cy.url().should('include', '/admin');
    cy.contains('h2', 'Painel Administrativo').should('be.visible');
  });

  it('deve impedir que cliente acesse áreas administrativas', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    const email = 'cristiana@gmail.com';
    const senha = 'cliente@asdfJKLÇ123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { email, senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.dados?.user?.role).to.eq('cliente');
    });

    cy.login(email, senha);
    
    cy.visit('/admin', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');
  });
});
