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
    cy.wait(1000);
    cy.get('[data-cy="login-submit-button"]').click();

    // Redirecionamento bem-sucedido (User vai para a Home)
    cy.url().should('not.include', '/minha-conta', { timeout: 15000 });
    cy.wait(2000);

    // Verificação no Header
    cy.get('[data-cy="header-admin-link"]').should('not.exist');
    cy.wait(2000);
  });

  it('deve garantir que o ícone de administração SEJA visível para um administrador', () => {
    const admin = Cypress.env('admin');
    
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(admin.email);
    cy.get('[data-cy="login-password-input"]').type(admin.senha);
    cy.wait(1000);
    cy.get('[data-cy="login-submit-button"]').click();

    // Redirecionamento bem-sucedido (Admin vai para /admin)
    cy.url().should('include', '/admin', { timeout: 15000 });
    cy.wait(2000);

    // Volta para a Home para ver o ícone administrativo no Header comum
    cy.visit('/');
    cy.wait(2000);

    // Verificação no Header padrão (BaseLayout)
    cy.get('[data-cy="header-admin-link"]').should('be.visible');
    cy.wait(2000);

    // Clica para voltar ao admin para garantir funcionalidade
    cy.get('[data-cy="header-admin-link"]').click();
    cy.url().should('include', '/admin');
    cy.wait(2000);
  });

  it('deve bloquear acesso direto via URL para rotas administrativas se for cliente', () => {
    // Login como cliente via sessão
    cy.session(`session-seg-${testUser.email}`, () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        headers: { 'x-use-test-db': 'true' },
        body: { email: testUser.email, senha: testUser.senha }
      }).then((response) => {
        const { token, user: userData } = response.body.dados;
        window.sessionStorage.setItem('les_auth_session', JSON.stringify({ token, user: userData }));
      });
    });

    // Tenta acessar uma rota proibida
    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');
    cy.wait(2000);
  });
});
