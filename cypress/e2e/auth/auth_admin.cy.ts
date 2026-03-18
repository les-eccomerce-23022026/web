describe('Auth - Fluxo de Administrador', () => {

  beforeEach(() => {
    // Intercepta todas as chamadas para a API e adiciona o header do banco de testes
    cy.intercept('**', (req) => {
      const apiUrl = Cypress.env('apiUrl');
      if (req.url.includes(apiUrl)) {
        req.headers['x-use-test-db'] = 'true';
      }
    });
  });

  it('deve logar como administrador e acessar o painel administrativo', () => {
    // Usando fixture para mock de sucesso no login admin se necessário, 
    // ou removendo intercept se quiser testar contra API real (seguindo padrão da spec anterior)
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
      
      // Tentativa de acesso direto
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });
  });
});
