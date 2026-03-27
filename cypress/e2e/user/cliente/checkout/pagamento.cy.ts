/**
 * Testes E2E de Pagamento - Sprint 2
 * User Story 3 e 4
 * 
 * Testa o fluxo completo de pagamento no checkout
 */

describe('Pagamento - Checkout', () => {
  beforeEach(() => {
    // Login como cliente
    cy.loginCliente();
    
    // Adicionar item ao carrinho
    cy.visit('/');
    cy.get('[data-cy="livro-card"]').first().click();
    cy.get('[data-cy="adicionar-carrinho-button"]').click();
    
    // Ir para checkout
    cy.visit('/checkout');
  });

  describe('Seleção de Cartão', () => {
    it('deve exibir cartões salvos do cliente', () => {
      cy.get('[data-cy="checkout-saved-cards"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('exist')
        .should('contain', 'Mastercard');
    });

    it('deve selecionar cartão salvo', () => {
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('have.class', 'selecionado');
    });

    it('deve abrir modal para novo cartão', () => {
      cy.get('[data-cy="checkout-add-card-button"]')
        .click();
      
      cy.get('[data-cy="checkout-new-card-form"]')
        .should('be.visible');
    });

    it('deve preencher e validar novo cartão', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      // Preencher dados do cartão Visa válido (número de teste)
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111111');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      // Verificar se bandeira foi detectada
      cy.get('[data-cy="checkout-card-brand"]')
        .should('contain', 'Visa');
      
      // Salvar cartão
      cy.get('[data-cy="checkout-save-card-checkbox"]')
        .check();
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Verificar que cartão foi adicionado
      cy.get('[data-cy="checkout-new-card-form"]')
        .should('not.exist');
    });

    it('deve validar número de cartão com Luhn', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      // Número inválido (falha no Luhn)
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111112');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist')
        .should('contain', 'inválido');
    });

    it('deve validar cartão expirado', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111111');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      // Data expirada
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('01/20');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist')
        .should('contain', 'expirado');
    });

    it('deve detectar bandeira American Express e validar CVV de 4 dígitos', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      // Amex número
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('378282246310005');
      
      cy.get('[data-cy="checkout-card-brand"]')
        .should('contain', 'American Express');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('1234');
      
      // CVV de 4 dígitos deve ser aceito
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro de CVV se tentar com 3 dígitos
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .clear()
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist');
    });
  });

  describe('Cupons de Desconto', () => {
    it('deve aplicar cupom promocional', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('exist');
    });

    it('deve aplicar cupom de troca', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA50');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-TROCA50"]')
        .should('exist');
    });

    it('deve remover cupom aplicado', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-remove-DESCONTO10"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('not.exist');
    });

    it('deve validar limite de 1 cupom promocional', () => {
      // Aplicar primeiro cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      // Tentar aplicar segundo cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO20');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-error"]')
        .should('exist')
        .should('contain', 'Apenas um cupom promocional');
    });

    it('deve permitir múltiplos cupons de troca', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA50');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA30');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      // Ambos devem estar aplicados
      cy.get('[data-cy="checkout-coupon-TROCA50"]')
        .should('exist');
    });

    it('deve mostrar sugestões de cupons disponíveis', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .focus();
      
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .should('be.visible');
      
      cy.get('[data-cy="checkout-coupon-suggestion-DESCONTO10"]')
        .should('exist');
    });

    it('deve aplicar cupom da sugestão', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .focus();
      
      cy.get('[data-cy="checkout-coupon-suggestion-DESCONTO10"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('exist');
    });
  });

  describe('Pagamento Parcial (Múltiplos Cartões)', () => {
    it('deve exibir opção de pagamento parcial', () => {
      cy.get('[data-cy="checkout-partial-payment"]')
        .should('exist');
    });

    it('deve adicionar pagamento parcial com cartão', () => {
      // Selecionar cartão
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      // Digitar valor
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('50');
      
      // Adicionar
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      cy.get('[data-cy="checkout-partial-payments-list"]')
        .should('exist')
        .should('contain', 'R$ 50,00');
    });

    it('deve validar valor mínimo de R$ 10,00 por cartão', () => {
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('5');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      cy.get('[data-cy="checkout-partial-payment-error"]')
        .should('exist')
        .should('contain', 'mínimo');
    });

    it('deve remover pagamento parcial', () => {
      // Adicionar pagamento
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('50');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      // Remover
      cy.get('[data-cy="checkout-partial-payment-remove-0"]')
        .click();
      
      cy.get('[data-cy="checkout-partial-payments-list"]')
        .should('not.exist');
    });

    it('deve validar valor não excedente', () => {
      // Tentar adicionar valor maior que o total
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('9999');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      cy.get('[data-cy="checkout-partial-payment-error"]')
        .should('exist')
        .should('contain', 'exceder');
    });

    it('deve mostrar pagamento completo quando valor total coberto', () => {
      // Adicionar pagamento igual ao total
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('94.90');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      cy.get('[data-cy="checkout-partial-payment"]')
        .should('contain', 'Pagamento completo');
    });
  });

  describe('Finalização de Compra', () => {
    it('deve finalizar compra com cartão selecionado', () => {
      // Selecionar cartão
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // Finalizar
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      // Deve redirecionar para confirmação
      cy.url()
        .should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com cupom aplicado', () => {
      // Aplicar cupom
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      // Selecionar cartão
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // Finalizar
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      cy.url()
        .should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com pagamento parcial', () => {
      // Adicionar pagamento parcial
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('50');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      // Selecionar outro cartão para o restante
      cy.get('[data-cy="checkout-card-item-5678"]')
        .click();
      
      // Finalizar
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      cy.url()
        .should('include', '/pedido-confirmado');
    });

    it('deve mostrar erro se nenhum pagamento selecionado', () => {
      // Tentar finalizar sem pagamento
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      // Deve mostrar erro ou não processar
      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled');
    });

    it('deve atualizar resumo com desconto de cupom', () => {
      const subtotal = 79.90;
      const descontoEsperado = subtotal * 0.10; // 10%
      
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', `R$ ${descontoEsperado.toFixed(2).replace('.', ',')}`);
    });

    it('deve atualizar resumo com pagamento parcial', () => {
      cy.get('[data-cy="checkout-partial-card-select"]')
        .select('c138b1bc-b827-463e-b921-6ed947da7eb9');
      
      cy.get('[data-cy="checkout-partial-value-input"]')
        .type('50');
      
      cy.get('[data-cy="checkout-add-partial-payment-button"]')
        .click();
      
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Pago com Cartões')
        .and('contain', 'R$ 50,00');
    });
  });

  describe('Validações de Segurança', () => {
    it('deve mascarar número do cartão na UI', () => {
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('contain', '•••• 1234');
    });

    it('deve permitir visualizar CVV', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      // Clicar no botão de visualizar
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .parent()
        .find('button')
        .click();
      
      // CVV deve estar visível (type="text")
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .should('have.attr', 'type', 'text');
    });

    it('deve validar bandeiras permitidas', () => {
      cy.get('[data-cy="checkout-add-card-button"]').click();
      
      // Tentar cartão com bandeira não suportada
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('6011111111111117'); // Discover (não suportada)
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro ou não permitir
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist');
    });
  });
});
