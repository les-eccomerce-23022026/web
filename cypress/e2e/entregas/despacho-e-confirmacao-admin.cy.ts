/**
 * Testes E2E do Fluxo Admin - Despacho e Entrega
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 * 
 * Cobertura do fluxo administrativo de pedidos:
 * - Listar todos os pedidos (painel admin)
 * - Despachar pedido EM PROCESSAMENTO → EM TRÂNSITO
 * - Confirmar entrega EM TRÂNSITO → ENTREGUE
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

describe('Entregas — Despacho e Confirmação de Entrega (Admin)', () => {
  let vendaUuid: string;

  beforeEach(() => {
    // Setup mínimo via API: criar venda aprovada
    cy.criarVendaAprovadaViaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });

    // Login admin via API para estabelecer sessão
    cy.autenticarAdministradorViaApi();
  });

  describe('Listagem de Pedidos', () => {
    it('deve exibir lista de pedidos no painel admin', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="pedidos-painel"]').should('exist');
      
      // Verificar que o pedido criado aparece na lista
      cy.contains(vendaUuid.split('-')[1].toUpperCase()).should('be.visible');
    });

    it('deve filtrar pedidos por busca', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar campo de busca e filtrar
      cy.get('[data-cy="checkout-filtro-busca"]')
        .should('exist')
        .clear()
        .type(vendaUuid.split('-')[1]);
      
      // Verificar que apenas o pedido filtrado aparece
      cy.contains(vendaUuid.split('-')[1].toUpperCase()).should('be.visible');
    });

    it('deve filtrar pedidos por status', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.get('[data-cy="filtro-status-pedidos"]')
        .should('exist')
        .select('Em Processamento');
      
      // Verificar que status APROVADA aparece na tabela
      cy.contains('APROVADA').should('be.visible');
    });
  });

  describe('Despacho de Pedido (RF0038) - E2E UI Real', () => {
    it('deve despachar pedido APROVADA para EM TRÂNSITO', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar status inicial
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'APROVADA');
      
      // Clicar no botão de despachar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'despachado');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Trânsito');
    });

    it('deve exibir botão de despachar para pedidos aprovados', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar o pedido na tabela e verificar botão de despachar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('exist')
        .should('be.visible');
    });

    it('deve impedir despacho de pedido já em trânsito', () => {
      // Primeiro despachar via API para setup
      cy.despacharPedidoViaApi(vendaUuid);
      
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar que botão de despachar não aparece para pedido em trânsito
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('not.exist');
      
      // Verificar que botão de confirmar entrega aparece
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Confirmação de Entrega (RF0039) - E2E UI Real', () => {
    beforeEach(() => {
      // Setup: despachar pedido via API
      cy.despacharPedidoViaApi(vendaUuid);
    });

    it('deve confirmar entrega EM TRÂNSITO para ENTREGUE', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar status inicial
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Trânsito');
      
      // Clicar no botão de confirmar entrega
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'entregue');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });

    it('deve exibir botão de confirmar entrega para pedidos em trânsito', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar o pedido na tabela e verificar botão de confirmar entrega
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('exist')
        .should('be.visible');
    });

    it('deve impedir confirmação de entrega de pedido não em trânsito', () => {
      // Criar nova venda não despachada
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.visit('/admin/pedidos');
        
        cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
        
        // Verificar que botão de confirmar entrega não aparece para pedido aprovado
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-confirmar-entrega-"]')
          .should('not.exist');
        
        // Verificar que botão de despachar aparece
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('exist')
          .should('be.visible');
      });
    });
  });
});
