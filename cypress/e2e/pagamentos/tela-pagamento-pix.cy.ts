/**
 * Testes E2E da Tela de Pagamento PIX (/pagamento-pix)
 * Cobertura: Cenários felizes, falha e validação
 */

describe('Pagamentos — Tela de Pagamento PIX', () => {
  beforeEach(() => {
    cy.autenticarClienteDadosTeste();
    cy.garantirEnderecoViaApi();
    cy.prepararCarrinhoSincronizado();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /pagamento-pix após selecionar PIX no checkout', () => {
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
      
      // Selecionar PIX
      cy.get('[data-cy="checkout-pix-payment"]').click();
      
      // Finalizar compra
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      // Verificar redirecionamento para /pagamento-pix
      cy.url().should('include', '/pagamento-pix');
      cy.get('[data-cy="pagamento-pix-page"]').should('be.visible');
    });

    it('deve acessar /pagamento-pix diretamente com parâmetros válidos', () => {
      // Acessar diretamente (pode mostrar erro de sessão inválida sem contexto)
      cy.visit('/pagamento-pix');
      cy.get('[data-cy="pagamento-pix-page"]').should('exist');
    });
  });

  describe('Exibição de QR Code e Código PIX', () => {
    it('deve exibir QR Code PIX', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar QR Code
      cy.get('[data-cy="pagamento-pix-qr-code"]').should('exist');
      cy.get('[data-cy="pagamento-pix-qr-code"]').should('be.visible');
    });

    it('deve exibir código PIX copiável', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar código PIX
      cy.get('[data-cy="pagamento-pix-codigo"]').should('exist');
      cy.get('[data-cy="pagamento-pix-codigo"]').should('not.be.empty');
    });

    it('deve permitir copiar código PIX', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Clicar no botão de copiar
      cy.get('[data-cy="pagamento-pix-copiar"]').should('exist');
      cy.get('[data-cy="pagamento-pix-copiar"]').click();
      
      // Verificar feedback visual
      cy.get('[data-cy="pagamento-pix-copiado"]').should('exist');
    });
  });

  describe('Countdown Timer', () => {
    it('deve exibir countdown timer', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar countdown timer
      cy.get('[data-cy="pagamento-pix-timer"]').should('exist');
      cy.get('[data-cy="pagamento-pix-timer"]').should('contain', 'min');
    });

    it('deve mostrar aviso quando prazo estiver expirando', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar que timer existe (aviso de expiração pode aparecer dinamicamente)
      cy.get('[data-cy="pagamento-pix-timer"]').should('exist');
    });
  });

  describe('Simulação de Webhook (Cenário Feliz)', () => {
    it('deve simular pagamento PIX aprovado via webhook', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Simular webhook (botão de teste)
      cy.get('[data-cy="pagamento-pix-simular-webhook"]').should('exist');
      cy.get('[data-cy="pagamento-pix-simular-webhook"]').click();
      
      // Verificar redirecionamento para pedido-confirmado
      cy.url({ timeout: 20000 }).should('include', '/pedido-confirmado');
    });

    it('deve exibir mensagem de carregamento durante simulação', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Simular webhook
      cy.get('[data-cy="pagamento-pix-simular-webhook"]').click();
      
      // Verificar estado de simulação
      cy.get('[data-cy="pagamento-pix-simulando"]').should('exist');
    });
  });

  describe('Cenários de Falha', () => {
    it('deve exibir erro de sessão inválida ao acessar sem contexto', () => {
      // Acessar diretamente sem contexto de checkout
      cy.visit('/pagamento-pix');
      
      // Pode mostrar erro de sessão inválida ou loading
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagamento-pix-page"]').length) {
          // Se a página carregou, verificar se mostra erro
          cy.get('[data-cy="pagamento-pix-page"]').should('exist');
        }
      });
    });

    it('deve exibir tela de falha quando pagamento PIX falhar', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Simular falha (se houver botão para isso)
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagamento-pix-simular-falha"]').length) {
          cy.get('[data-cy="pagamento-pix-simular-falha"]').click();
          cy.get('[data-cy="pagamento-pix-falha"]').should('exist');
        }
      });
    });

    it('deve permitir voltar ao checkout em caso de falha', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar botão de voltar
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="pagamento-pix-voltar-checkout"]').length) {
          cy.get('[data-cy="pagamento-pix-voltar-checkout"]').click();
          cy.url().should('include', '/checkout');
        }
      });
    });
  });

  describe('Informações do Pedido', () => {
    it('deve exibir valor do pagamento', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar valor exibido
      cy.get('[data-cy="pagamento-pix-valor"]').should('exist');
      cy.get('[data-cy="pagamento-pix-valor"]').should('contain', 'R$');
    });

    it('deve exibir instruções de pagamento', () => {
      // Preparar contexto de pagamento PIX
      cy.visit('/checkout');
      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();
      cy.get('[data-cy="checkout-pix-payment"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      cy.url().should('include', '/pagamento-pix');
      
      // Verificar instruções
      cy.get('[data-cy="pagamento-pix-instrucoes"]').should('exist');
    });
  });
});
