/**
 * Testes E2E da Página Admin — Listagem de Livros (/admin/livros)
 * Cobertura: Listagem, filtros, paginação, ações (inativar/ativar)
 */

describe('Admin — Listagem de Livros', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/livros como administrador', () => {
      cy.visit('/admin/livros');
      
      cy.url().should('include', '/admin/livros');
    });

    it('deve exibir tabela de livros', () => {
      cy.visit('/admin/livros');
      
      cy.get('table').should('exist');
    });
  });

  describe('Listagem de Livros', () => {
    it('deve listar livros existentes', () => {
      cy.visit('/admin/livros');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir colunas esperadas', () => {
      cy.visit('/admin/livros');
      
      cy.get('thead').within(() => {
        cy.contains('Título');
        cy.contains('Autor');
        cy.contains('Preço');
        cy.contains('Estoque');
        cy.contains('Status');
      });
    });
  });

  describe('Ações em Livros', () => {
    it('deve permitir inativar livro', () => {
      cy.visit('/admin/livros');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Inativar').click();
      });

      cy.get('.modal, dialog').should('exist');
      cy.get('input[name="motivo"]').type('Teste de inativação');
      cy.contains('Confirmar').click();

      cy.contains('Livro inativado com sucesso').should('exist');
    });

    it('deve permitir ativar livro inativo', () => {
      cy.visit('/admin/livros');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Ativar').click();
      });

      cy.get('.modal, dialog').should('exist');
      cy.get('input[name="motivo"]').type('Teste de ativação');
      cy.contains('Confirmar').click();

      cy.contains('Livro ativado com sucesso').should('exist');
    });
  });

  describe('Filtros e Busca', () => {
    it('deve permitir buscar por título', () => {
      cy.visit('/admin/livros');
      
      cy.get('input[placeholder*="Buscar"]').type('Dom Casmurro');
      cy.get('button').contains('Buscar').click();

      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve permitir filtrar por status', () => {
      cy.visit('/admin/livros');
      
      cy.get('select').contains('Todos').select('Ativos');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Navegação para Detalhes', () => {
    it('deve permitir visualizar detalhes do livro', () => {
      cy.visit('/admin/livros');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Detalhes').click();
      });

      cy.url().should('include', '/admin/livros/');
    });
  });
});
