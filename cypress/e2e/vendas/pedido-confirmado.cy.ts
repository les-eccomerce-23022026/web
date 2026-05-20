/**
 * Testes E2E da Página de Pedido Confirmado (/pedido-confirmado)
 * Cobertura: Cenários felizes e validação
 */

describe('Vendas — Pedido Confirmado', () => {
  beforeEach(() => {
    cy.autenticarClienteDadosTeste();
    cy.garantirEnderecoViaApi();
    cy.prepararCarrinhoSincronizado();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /pedido-confirmado após compra bem-sucedida', () => {
      cy.visit('/checkout');
      
      // Preencher entrega mínima
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Selecionar cartão
      cy.get('[data-cy^="checkout-card-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      // Finalizar compra
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      // Verificar redirecionamento
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve acessar /pedido-confirmado com parâmetro pedido', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-page"]').should('exist');
    });

    it('deve exibir mensagem de sucesso', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Pedido Realizado com Sucesso!').should('be.visible');
    });
  });

  describe('Exibição de Informações do Pedido', () => {
    it('deve exibir número do pedido', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Número do Pedido:').should('be.visible');
      cy.contains('test-uuid-123').should('be.visible');
    });

    it('deve exibir data do pedido', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Data:').should('be.visible');
    });

    it('deve exibir status do pedido', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Status Atual:').should('be.visible');
      cy.contains('EM PROCESSAMENTO').should('be.visible');
    });

    it('deve exibir badge de status', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-status-badge"]').should('exist');
      cy.get('[data-cy="confirmado-status-badge"]').should('contain', 'EM PROCESSAMENTO');
    });
  });

  describe('Mensagens de Confirmação', () => {
    it('deve exibir mensagem de pagamento processado', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Seu pagamento foi processado').should('be.visible');
    });

    it('deve exibir mensagem de pedido em andamento', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('seu pedido ja esta em andamento').should('be.visible');
    });

    it('deve exibir informações sobre atualizações', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Voce recebera atualizacoes').should('be.visible');
    });

    it('deve mencionar página Meus Pedidos', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.contains('Meus Pedidos').should('be.visible');
    });
  });

  describe('Botões de Ação', () => {
    it('deve exibir botão Voltar a Loja', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-btn-home"]').should('exist');
      cy.get('[data-cy="confirmado-btn-home"]').should('contain', 'Voltar a Loja');
    });

    it('deve exibir botão Ver Meus Pedidos', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('exist');
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('contain', 'Ver Meus Pedidos');
    });

    it('deve navegar para home ao clicar em Voltar a Loja', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-btn-home"]').click();
      
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('deve navegar para Meus Pedidos ao clicar', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-btn-pedidos"]').click();
      
      cy.url().should('include', '/pedidos');
    });
  });

  describe('Ícone de Sucesso', () => {
    it('deve exibir ícone de confirmação', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-icon"]').should('exist');
      cy.get('[data-cy="confirmado-icon"]').should('contain', '✅');
    });
  });

  describe('Layout e Estilo', () => {
    it('deve exibir card de confirmação', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-card"]').should('exist');
      cy.get('[data-cy="confirmado-card"]').should('be.visible');
    });

    it('deve ter estrutura de informações organizada', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-info"]').should('exist');
      cy.get('[data-cy="confirmado-info"]').should('be.visible');
    });

    it('deve ter área de ações', () => {
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-actions"]').should('exist');
      cy.get('[data-cy="confirmado-actions"]').should('be.visible');
    });
  });

  describe('Fluxo Completo de Compra', () => {
    it('deve exibir pedido-confirmado após compra completa', () => {
      cy.visit('/checkout');
      
      // Preencher entrega
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Selecionar cartão
      cy.get('[data-cy^="checkout-card-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      // Finalizar
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      // Verificar página de confirmação
      cy.url().should('include', '/pedido-confirmado');
      cy.contains('Pedido Realizado com Sucesso!').should('be.visible');
      
      // Verificar informações
      cy.contains('Número do Pedido:').should('be.visible');
      cy.contains('Status Atual:').should('be.visible');
      
      // Verificar botões
      cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('be.visible');
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-card"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('be.visible');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-card"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('be.visible');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/pedido-confirmado?pedido=test-uuid-123');
      
      cy.get('[data-cy="confirmado-card"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
      cy.get('[data-cy="confirmado-btn-pedidos"]').should('be.visible');
    });
  });
});
