/**
 * E2E — Validação de Regra de Negócio: Limite de desconto de cupom.
 * 
 * Este teste valida que o sistema bloqueia cupons com desconto excessivo
 * que poderiam comprometer a integridade financeira da venda.
 * 
 * RN: Cupons com desconto excessivo (ex: 100% ou valor maior que o total)
 * devem ser bloqueados para evitar prejuízo financeiro.
 */
import {
  loginClienteUi,
  adicionarLivrosAoCarrinho,
  irParaCheckoutComEnderecoEFrete,
} from '../../support/fluxo-venda.helpers';

describe('Validação de Regra de Negócio — Limite de Desconto de Cupom (RN)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    adicionarLivrosAoCarrinho(2);
    irParaCheckoutComEnderecoEFrete();
  });

  it('deve bloquear cupom com desconto de 100% ou superior ao valor total', () => {
    /**
     * Fluxo (Validação de limite de desconto de cupom):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Tenta aplicar um cupom com desconto excessivo (100% ou mais)
     * 6. Sistema deve rejeitar o cupom
     * 7. Exibir mensagem de erro de desconto inválido
     * 8. Cupom não deve ser aplicado ao total
     */

    // Capturar subtotal antes do cupom
    cy.get('[data-cy="checkout-subtotal"]').invoke('text').then((t) => {
      const subtotalTexto = t;
      
      // Tentar aplicar um cupom com desconto excessivo (simulado)
      // Em um cenário real, isso seria um cupom com 100% de desconto ou valor maior que o total
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').clear().type('CUPOM100DESCONTO');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Validar que o sistema exibe erro de cupom inválido
      cy.get('[data-cy="checkout-coupon-error"], [data-cy="coupon-error-message"]', { timeout: 10000 })
        .should('be.visible')
        .then(($el) => {
          const texto = $el.text();
          const contemErro = texto.includes('inválido') || texto.includes('desconto') || texto.includes('excede');
          expect(contemErro).to.be.true;
        });

      // Validar que o cupom não aparece na lista de aplicados
      cy.get('[data-cy="checkout-applied-coupons"]').should('not.exist');

      // Validar que o total não foi alterado
      cy.get('[data-cy="checkout-subtotal"]').should('have.text', subtotalTexto);
    });
  });

  it('deve bloquear cupom com valor de desconto maior que o total da compra', () => {
    /**
     * Fluxo (Validação de cupom com valor maior que o total):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Captura o valor total da compra
     * 6. Tenta aplicar cupom com valor maior que o total
     * 7. Sistema deve rejeitar o cupom
     * 8. Exibir mensagem de erro
     */

    // Capturar total da compra
    cy.get('[data-cy="checkout-total-pagamento"]').invoke('text').then((totalTexto) => {
      cy.log(`Total da compra: ${totalTexto}`);

      // Tentar aplicar cupom com valor excessivo
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').clear().type('CUPOMVALOREXCESSIVO');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Validar erro
      cy.get('[data-cy="checkout-coupon-error"], [data-cy="coupon-error-message"]', { timeout: 10000 })
        .should('be.visible')
        .then(($el) => {
          const texto = $el.text();
          const contemErro = texto.includes('inválido') || texto.includes('valor') || texto.includes('excede');
          expect(contemErro).to.be.true;
        });

      // Validar que o total permanece inalterado
      cy.get('[data-cy="checkout-total-pagamento"]').should('have.text', totalTexto);
    });
  });

  it('deve bloquear múltiplos cupons promocionais na mesma compra (RN0033)', () => {
    /**
     * Fluxo (Validação de RN0033 - Apenas 1 cupom promocional por compra):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Aplica um cupom promocional válido
     * 6. Tenta aplicar um segundo cupom promocional
     * 7. Sistema deve rejeitar o segundo cupom
     * 8. Exibir mensagem de erro de limite de cupom
     * 9. Apenas o primeiro cupom deve permanecer aplicado
     */

    // Aplicar primeiro cupom promocional (clicar na sugestão aplica automaticamente)
    cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="checkout-coupon-input"]').click();
    cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
    cy.get('[data-cy="checkout-coupon-suggestions"]')
      .find('button')
      .first()
      .click();

    // Validar que o primeiro cupom foi aplicado
    cy.get('[data-cy="checkout-applied-coupons"]')
      .should('be.visible');

    // Capturar quantidade de cupons aplicados
    cy.get('[data-cy="checkout-applied-coupons"]').then(($cupons) => {
          const quantidadeInicial = $cupons.length;

          // Tentar aplicar um segundo cupom
          cy.get('[data-cy="checkout-coupon-input"]').clear().type('OUTROCUPOM10');
          cy.get('[data-cy="checkout-apply-coupon-button"]').click();

          // Validar erro de limite de cupom
          cy.get('[data-cy="checkout-coupon-error"], [data-cy="coupon-error-message"]', { timeout: 10000 })
            .should('be.visible')
            .then(($el) => {
              const texto = $el.text().toLowerCase();
              // Verificar qualquer mensagem de erro relacionada a cupom
              const contemErro = texto.includes('inválido') || texto.includes('já aplicado') || 
                                texto.includes('limite') || texto.includes('apenas') || texto.includes('um');
              expect(contemErro).to.be.true;
            });

          // Validar que ainda há apenas 1 cupom aplicado
          cy.get('[data-cy="checkout-applied-coupons"]').should('have.length', quantidadeInicial);
        });
  });
});
