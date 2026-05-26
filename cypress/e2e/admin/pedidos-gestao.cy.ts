/**
 * Testes E2E da Página Admin — Gestão de Pedidos (/admin/pedidos)
 * Cobertura: Listagem, filtros, despacho, entrega, mudança de status
 */

describe('Admin — Gestão de Pedidos', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/pedidos como administrador', () => {
      cy.visit('/admin/pedidos');
      
      cy.url().should('include', '/admin/pedidos');
    });

    it('deve exibir tabela de pedidos', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('table').should('exist');
    });
  });

  describe('Listagem de Pedidos', () => {
    it('deve listar pedidos existentes', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir colunas esperadas', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('thead').within(() => {
        cy.contains('Pedido');
        cy.contains('Cliente');
        cy.contains('Valor');
        cy.contains('Status');
        cy.contains('Data');
      });
    });
  });

  describe('Filtros e Busca', () => {
    it('deve permitir filtrar por status', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('select').contains('Todos').select('Pendente');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve permitir buscar por UUID do pedido', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('input[placeholder*="Buscar"]').type('123e4567-e89b');
      cy.get('button').contains('Buscar').click();

      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Despacho de Pedido', () => {
    it('deve permitir despachar pedido pendente', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Pendente').should('exist');
        cy.contains('Despachar').click();
      });

      cy.contains('Pedido despachado com sucesso').should('exist');
    });
  });

  describe('Confirmação de Entrega', () => {
    it('deve permitir confirmar entrega de pedido despachado', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Despachado').should('exist');
        cy.contains('Confirmar Entrega').click();
      });

      cy.contains('Entrega confirmada com sucesso').should('exist');
    });
  });

  describe('Visualização de Detalhes', () => {
    it('deve permitir visualizar detalhes do pedido', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Detalhes').click();
      });

      cy.url().should('include', '/admin/pedidos/');
    });
  });
});
