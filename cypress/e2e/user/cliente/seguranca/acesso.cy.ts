describe('Cliente - Segurança e Acesso (Integração Real)', () => {
  let testUser: { nome: string; cpf: string; email: string; senha: string };

  before(() => {
    // 1. Configurar admin
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/admin/bootstrap`,
      headers: { 'x-use-test-db': 'true' }
    });

    // 2. Cria um novo usuário dinâmico para os testes de cliente
    cy.getNewUser().then((user) => {
      testUser = user;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: { ...testUser, confirmacaoSenha: testUser.senha }
      });
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('deve garantir que o ícone de administração NÃO seja visível para um cliente comum', () => {
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(testUser.email);
    cy.get('[data-cy="login-password-input"]').type(testUser.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url().should('not.include', '/minha-conta', { timeout: 15000 });
    cy.get('[data-cy="header-admin-link"]').should('not.exist');
  });

  it('deve garantir que o ícone de administração SEJA visível para um administrador', () => {
    const admin = Cypress.env('admin');
    
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(admin.email);
    cy.get('[data-cy="login-password-input"]').type(admin.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url().should('include', '/admin', { timeout: 15000 });

    cy.visit('/');

    cy.get('[data-cy="header-admin-link"]').should('be.visible');

    cy.get('[data-cy="header-admin-link"]').click();
    cy.url().should('include', '/admin');
  });

  it('deve bloquear acesso direto via URL para rotas administrativas se for cliente', () => {
    cy.loginWithSession(testUser.email, testUser.senha, 'session-seg');

    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');
  });
});
