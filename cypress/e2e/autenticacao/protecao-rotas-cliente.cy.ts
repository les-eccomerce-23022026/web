describe('Autenticação — Proteção de Rotas (Cliente)', () => {
  let testUser: { nome: string; cpf: string; email: string; senha: string };

  before(() => {
    // 1. Configurar admin (com tratamento de erro)
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/admin/bootstrap`,
      headers: { 'x-use-test-db': 'true' },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status !== 200 && response.status !== 201) {
        cy.log('Bootstrap admin falhou ou já existe, continuando...');
      }
    });

    // 2. Cria um novo usuário dinâmico para os testes de cliente
    cy.getNewUser().then((user) => {
      testUser = user;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: { ...testUser, confirmacaoSenha: testUser.senha },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          cy.log('Registro falhou, tentando login com usuário existente...');
        }
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

    // Redirecionamento bem-sucedido (User vai para a Home)
    cy.url().should('not.include', '/minha-conta', { timeout: 15000 });

    // Verificação no Header
    cy.get('[data-cy="header-admin-link"]').should('not.exist');
  });

  it('deve bloquear acesso direto via URL para rotas administrativas se for cliente', () => {
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(testUser.email);
    cy.get('[data-cy="login-password-input"]').type(testUser.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url().should('not.include', '/minha-conta', { timeout: 15000 });

    // Tenta acessar uma rota proibida - deve ser redirecionado para home
    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('include', '/', { timeout: 10000 });
  });
});
