/**
 * Testes E2E da Tela de Pagamento (/pagamento)
 * Cobertura: Cenários felizes, falha e validação
 */

describe('Pagamentos — Tela de Pagamento', () => {
  beforeEach(() => {
    cy.autenticarClienteDadosTeste();
    cy.garantirEnderecoViaApi();
    cy.prepararCarrinhoSincronizado();
  });

  describe('Acesso à Página', () => {
    it('deve redirecionar para /pagamento ao selecionar PIX no checkout', () => {
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
      
      // Selecionar PIX como forma de pagamento
      cy.get('[data-cy="checkout-pix-payment"]').click();
      
      // Finalizar compra
      cy.get('[data-cy="checkout-finish-button"]').click();
      
      // Verificar redirecionamento para /pagamento-pix
      cy.url().should('include', '/pagamento-pix');
    });

    it('deve acessar /pagamento diretamente (redireciona para PagamentoPix)', () => {
      cy.visit('/pagamento');
      
      // A página /pagamento redireciona para PagamentoPix
      cy.url().should('include', '/pagamento-pix');
    });
  });

  describe('Exibição de Opções de Pagamento', () => {
    it('deve exibir cartões salvos do cliente', () => {
      cy.visit('/checkout');
      
      cy.get('[data-cy="checkout-saved-cards"]').should('exist');
      cy.get('[data-cy^="checkout-card-item-"]').should('have.length.at.least', 1);
    });

    it('deve exibir opção de pagamento com PIX', () => {
      cy.visit('/checkout');
      
      cy.get('[data-cy="checkout-pix-payment"]').should('exist');
      cy.get('[data-cy="checkout-pix-payment"]').should('contain', 'PIX');
    });

    it('deve exibir opção de adicionar novo cartão', () => {
      cy.visit('/checkout');
      
      cy.get('[data-cy="checkout-add-card-button"]').should('exist');
    });
  });

  describe('Validações de Pagamento', () => {
    it('deve manter botão desabilitado sem forma de pagamento selecionada', () => {
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
      
      // Não selecionar forma de pagamento
      cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
    });

    it('deve habilitar botão ao selecionar cartão salvo', () => {
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
      
      // Selecionar primeiro cartão
      cy.get('[data-cy^="checkout-card-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      
      // Botão deve estar habilitado
      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled');
    });

    it('deve habilitar botão ao selecionar PIX', () => {
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
      
      // Selecionar PIX
      cy.get('[data-cy="checkout-pix-payment"]').click();
      
      // Botão deve estar habilitado
      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled');
    });
  });

  describe('Processamento de Pagamento com Cartão', () => {
    it('deve processar pagamento com cartão salvo e redirecionar para pedido-confirmado', () => {
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
      
      // Selecionar primeiro cartão
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

    it('deve exibir erro com cartão inválido', () => {
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
      
      // Adicionar novo cartão com número inválido (falha Luhn)
      cy.get('[data-cy="checkout-add-card-button"]').click();
      cy.get('[data-cy="checkout-card-number-input"]').type('4111111111111112');
      cy.get('[data-cy="checkout-card-name-input"]').type('JOAO DA SILVA');
      cy.get('[data-cy="checkout-card-expiry-input"]').type('12/30');
      cy.get('[data-cy="checkout-card-cvv-input"]').type('123');
      cy.get('[data-cy="checkout-card-submit-button"]').click();
      
      // Verificar erro de validação
      cy.get('[data-cy="checkout-card-errors"]').should('exist').should('contain', 'inválido');
    });
  });

  describe('Cupons de Desconto', () => {
    it('deve aplicar cupom e atualizar total', () => {
      cy.visit('/checkout');
      
      // Aplicar cupom
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();
      
      // Verificar que cupom foi aplicado
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]').should('exist');
    });

    it('deve mostrar erro com cupom inválido', () => {
      cy.visit('/checkout');
      
      // Tentar aplicar cupom inválido
      cy.get('[data-cy="checkout-coupon-input"]').type('CUPOM_INVALIDO');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();
      
      // Verificar erro
      cy.get('[data-cy="checkout-coupon-error"]').should('exist');
    });
  });

  describe('Pagamento Parcial', () => {
    it('deve exibir opção de pagamento parcial', () => {
      cy.visit('/checkout');
      
      cy.get('[data-cy="checkout-partial-payment"]').should('exist');
      cy.get('[data-cy="checkout-split-payment"]').should('exist');
    });

    it('deve adicionar linha de pagamento parcial', () => {
      cy.visit('/checkout');
      
      cy.get('[data-cy="checkout-split-add-saved-card"]').click();
      cy.get('[data-cy="checkout-split-line-1"]').should('exist');
    });

    it('deve validar que soma das linhas cobre o total', () => {
      cy.visit('/checkout');
      
      // Configurar split com valor que não fecha
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('9999');
      cy.get('[data-cy="checkout-split-restante"]').should('match', /Ajuste/);
    });
  });
});
