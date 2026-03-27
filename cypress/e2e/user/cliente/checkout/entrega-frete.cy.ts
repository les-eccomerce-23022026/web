/**
 * Testes E2E de Entrega/Frete - Sprint 3
 * User Story 5 e 6
 * 
 * Testa o fluxo completo de cálculo de frete e seleção de entrega
 */

describe('Entrega/Frete - Checkout', () => {
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

  describe('Cálculo de Frete', () => {
    it('deve exibir campo de CEP para cálculo', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .should('exist');
    });

    it('deve formatar CEP automaticamente', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000000')
        .should('have.value', '01000-000');
    });

    it('deve calcular frete ao clicar em calcular', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });

    it('deve mostrar erro para CEP inválido', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('12345');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it('deve calcular frete ao pressionar Enter', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000{enter}');
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });

    it('deve mostrar opções PAC, SEDEX e Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('exist');
    });

    it('deve mostrar frete grátis para Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('contain', 'Grátis');
    });
  });

  describe('Seleção de Frete', () => {
    beforeEach(() => {
      // Calcular frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
    });

    it('deve selecionar opção de frete PAC', () => {
      cy.get('[data-cy="checkout-freight-radio-PAC"]')
        .check();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('have.class', 'selecionado');
    });

    it('deve selecionar opção de frete SEDEX', () => {
      cy.get('[data-cy="checkout-freight-radio-SEDEX"]')
        .check();
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('have.class', 'selecionado');
    });

    it('deve selecionar opção Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-radio-RETIRA_EM_LOJA"]')
        .check();
      
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('have.class', 'selecionado');
    });

    it('deve atualizar resumo com valor do frete', () => {
      cy.get('[data-cy="checkout-freight-radio-SEDEX"]')
        .check();
      
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Frete')
        .and('contain', 'R$ 30,00');
    });

    it('deve atualizar total com frete', () => {
      const subtotal = 79.90;
      const freteSedex = 30.00;
      const totalEsperado = subtotal + freteSedex;
      
      cy.get('[data-cy="checkout-freight-radio-SEDEX"]')
        .check();
      
      cy.get('[data-cy="checkout-total-value"]')
        .should('contain', `R$ ${totalEsperado.toFixed(2).replace('.', ',')}`);
    });

    it('deve permitir trocar seleção de frete', () => {
      // Selecionar PAC
      cy.get('[data-cy="checkout-freight-radio-PAC"]')
        .check();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('have.class', 'selecionado');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('not.have.class', 'selecionado');
      
      // Trocar para SEDEX
      cy.get('[data-cy="checkout-freight-radio-SEDEX"]')
        .check();
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('have.class', 'selecionado');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('not.have.class', 'selecionado');
    });
  });

  describe('Endereço de Entrega', () => {
    it('deve exibir endereços disponíveis do cliente', () => {
      cy.get('[data-cy="checkout-addresses"]')
        .should('exist');
    });

    it('deve selecionar endereço de entrega', () => {
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .click();
      
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .should('have.class', 'selecionado');
    });

    it('deve mostrar confirmação de endereço selecionado', () => {
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .click();
      
      cy.get('[data-cy="checkout-addresses"]')
        .parent()
        .should('contain', 'Endereço selecionado para entrega');
    });

    it('deve habilitar botão de finalizar apenas com endereço selecionado', () => {
      // Sem endereço, botão deve estar desabilitado
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
      
      // Selecionar endereço
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .click();
      
      // Selecionar frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-radio-PAC"]')
        .check();
      
      // Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // Botão deve estar habilitado
      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled');
    });
  });

  describe('Fluxo Completo de Entrega', () => {
    it('deve completar fluxo de entrega e frete', () => {
      // 1. Selecionar endereço
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .click();
      
      // 2. Calcular frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
      
      // 3. Selecionar frete
      cy.get('[data-cy="checkout-freight-radio-SEDEX"]')
        .check();
      
      // 4. Verificar resumo atualizado
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Frete')
        .and('contain', 'R$ 30,00');
      
      // 5. Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // 6. Verificar mensagem de confirmação
      cy.get('[data-cy="checkout-addresses"]')
        .parent()
        .should('contain', 'Endereço selecionado para entrega');
      
      cy.get('[data-cy="checkout-freight-options"]')
        .parent()
        .should('contain', 'Frete SEDEX selecionado');
      
      // 7. Finalizar compra
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      // 8. Redirecionar para confirmação
      cy.url()
        .should('include', '/pedido-confirmado');
    });

    it('deve mostrar erro se tentar finalizar sem endereço', () => {
      // Calcular e selecionar frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-radio-PAC"]')
        .check();
      
      // Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // Botão deve estar desabilitado sem endereço
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
    });

    it('deve mostrar erro se tentar finalizar sem frete', () => {
      // Selecionar endereço
      cy.get('[data-cy="checkout-address-item-endereco-uuid-1"]')
        .click();
      
      // Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      // Botão deve estar desabilitado sem frete
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
    });
  });

  describe('Validações de Segurança', () => {
    it('deve validar formato do CEP', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('abcde-fgh');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it('deve validar CEP com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('1234567'); // 7 dígitos
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it('deve permitir CEP válido com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000000'); // 8 dígitos sem traço
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });
  });

  describe('Informações de Frete', () => {
    it('deve mostrar prazo de entrega para cada opção', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('contain', '5-7 dias');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('contain', '1-2 dias');
    });

    it('deve mostrar informações adicionais de frete', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      // Verificar informações adicionais
      cy.get('[data-cy="checkout-freight-options"]')
        .parent()
        .should('contain', 'CEP de Origem');
    });
  });
});
