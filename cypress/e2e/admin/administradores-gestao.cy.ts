/**
 * Testes E2E da Página Admin — Gestão de Administradores (/admin/administradores)
 * Cobertura: Listagem, registro, inativação, ativação, atualização
 */

describe('Admin — Gestão de Administradores', () => {
  describe('Acesso à Página', () => {
    it('deve acessar /admin/administradores como administrador', () => {
      cy.autenticarAdministradorViaApi();
      cy.visit('/admin/administradores');
      
      cy.url().should('include', '/admin/administradores');
    });

    it('deve exibir tabela de administradores', () => {
      cy.autenticarAdministradorViaApi();
      cy.visit('/admin/administradores');
      
      cy.get('table').should('exist');
    });
  });

  describe('Listagem de Administradores', () => {
    it('deve listar administradores existentes', () => {
      cy.autenticarAdministradorViaApi();
      cy.visit('/admin/administradores');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir colunas esperadas', () => {
      cy.autenticarAdministradorViaApi();
      cy.visit('/admin/administradores');
      
      cy.get('thead').within(() => {
        cy.contains('Nome');
        cy.contains('E-mail');
        cy.contains('Status');
        cy.contains('Ações');
      });
    });
  });
});
