/**
 * Testes E2E da Navegação Lateral do Painel Admin
 * Cobertura: Todos os links de navegação, estados ativos, redirecionamento
 */

describe('Admin — Navegação Lateral', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Links de Navegação', () => {
    it('deve exibir link para Dashboard', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Dashboard').should('exist');
    });

    it('deve exibir link para Livros', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Livros').should('exist');
    });

    it('deve exibir link para Pedidos', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Pedidos').should('exist');
    });

    it('deve exibir link para Clientes', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Clientes').should('exist');
    });

    it('deve exibir link para Estoque', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Estoque').should('exist');
    });

    it('deve exibir link para Administradores', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Administradores').should('exist');
    });

    it('deve exibir link para Trocas', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Trocas').should('exist');
    });
  });

  describe('Navegação para Páginas', () => {
    it('deve navegar para Dashboard ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Dashboard').click();
      
      cy.url().should('include', '/admin/dashboard');
    });

    it('deve navegar para Livros ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Livros').click();
      
      cy.url().should('include', '/admin/livros');
    });

    it('deve navegar para Pedidos ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Pedidos').click();
      
      cy.url().should('include', '/admin/pedidos');
    });

    it('deve navegar para Clientes ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Clientes').click();
      
      cy.url().should('include', '/admin/clientes');
    });

    it('deve navegar para Estoque ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Estoque').click();
      
      cy.url().should('include', '/admin/estoque');
    });

    it('deve navegar para Administradores ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Administradores').click();
      
      cy.url().should('include', '/admin/administradores');
    });

    it('deve navegar para Trocas ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Trocas').click();
      
      cy.url().should('include', '/admin/trocas');
    });
  });

  describe('Estado Ativo dos Links', () => {
    it('deve destacar Dashboard como ativo na página Dashboard', () => {
      cy.visit('/admin/dashboard');
      
      cy.get('nav').contains('Dashboard').should('have.class', 'ativo');
    });

    it('deve destacar Livros como ativo na página Livros', () => {
      cy.visit('/admin/livros');
      
      cy.get('nav').contains('Livros').should('have.class', 'ativo');
    });

    it('deve destacar Pedidos como ativo na página Pedidos', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('nav').contains('Pedidos').should('have.class', 'ativo');
    });

    it('deve destacar Estoque como ativo na página Estoque', () => {
      cy.visit('/admin/estoque');
      
      cy.get('nav').contains('Estoque').should('have.class', 'ativo');
    });
  });

  describe('Logout', () => {
    it('deve exibir link de logout', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Sair').should('exist');
    });

    it('deve fazer logout ao clicar no link', () => {
      cy.visit('/admin');
      
      cy.get('nav').contains('Sair').click();
      
      cy.url().should('not.include', '/admin');
    });
  });
});
