describe('Cliente - Segurança e Acesso (Integração Real)', () => {
  const adminCredentials = {
    user: 'admin@livraria.com.br',
    pass: 'admin@asdfJKLÇ123'
  };

  const clientCredentials = {
    user: 'joao.novo.1773839652737.59@email.com',
    pass: 'user@asdfJKLÇ123'
  };

  

  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.visit('/');
  });

  it('deve garantir que o ícone de administração NÃO seja visível para um cliente comum', () => {
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(clientCredentials.user);
    cy.get('[data-cy="login-password-input"]').type(clientCredentials.pass);
    cy.wait(1000);
    cy.get('[data-cy="login-submit-button"]').click();

    // Redirecionamento bem-sucedido (User vai para a Home)
    cy.url().should('not.include', '/minha-conta');
    cy.wait(2000); 

    // Verificação no Header
    cy.get('[data-cy="header-admin-link"]').should('not.exist');
    cy.wait(2000); 
  });

  it('deve garantir que o ícone de administração SEJA visível para um administrador', () => {
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(adminCredentials.user);
    cy.get('[data-cy="login-password-input"]').type(adminCredentials.pass);
    cy.wait(1000);
    cy.get('[data-cy="login-submit-button"]').click();

    // Redirecionamento bem-sucedido (Admin vai para /admin)
    cy.url().should('include', '/admin');
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
    // Login real como cliente
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(clientCredentials.user);
    cy.get('[data-cy="login-password-input"]').type(clientCredentials.pass);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.url().should('not.include', '/minha-conta');
    cy.wait(1000);

    // Tenta acessar uma rota proibida
    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');
    cy.wait(2000); 
  });
});
