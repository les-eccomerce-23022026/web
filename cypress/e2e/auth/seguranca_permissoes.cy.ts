describe('Auth - Controle de Acesso e Autorização', () => {
  const loginCliente = Cypress.env('cliente');
  const loginAdmin = Cypress.env('admin');

  context('Visibilidade de Componentes (RBAC)', () => {
    it('deve exibir o link de administração apenas para usuários com perfil admin', () => {
      // Cliente não vê o link
      cy.loginProgramatico('cliente');
      cy.visit('/');
      cy.getDataCy('header-admin-link').should('not.exist');
      
      cy.getDataCy('header-logout-button').click();

      // Admin vê o link
      cy.loginProgramatico('admin');
      cy.visit('/');
      cy.getDataCy('header-admin-link').should('be.visible').and('have.attr', 'href', '/admin');
    });
  });

  context('Proteção de Rotas (Navigation Guards)', () => {
    it('deve impedir o acesso direto a rotas administrativas por usuários não autenticados', () => {
      cy.visit('/admin/livros', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve impedir o acesso a rotas administrativas por usuários sem privilégios', () => {
      cy.loginProgramatico('cliente');
      cy.visit('/admin/livros', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve permitir o acesso a rotas administrativas por usuários administradores', () => {
      cy.loginProgramatico('admin');
      cy.visit('/admin/administradores');
      cy.url().should('include', '/admin/administradores');
    });
  });

  context('Persistência de Sessão', () => {
    it('deve manter o usuário autenticado após o recarregamento da página (F5)', () => {
      cy.loginProgramatico('admin');
      cy.visit('/admin/administradores'); 
      
      cy.reload();

      cy.url().should('include', '/admin/administradores');
      cy.get('h1, h2, canvas').should('exist');
    });
  });
});
