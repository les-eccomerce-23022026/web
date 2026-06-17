/**
 * E2E — Validações de Cupons (RN0033, RN0035, RN0036)
 * Testes automatizados para validações de cupons no checkout
 * 
 * RN0033 - Cupom Promocional Único: Apenas 1 cupom promocional por compra
 * RN0035 - Cupons Prioritários: Cupons reais do banco de dados
 * RN0036 - Cupom de Troca Excedente: Múltiplos cupons de troca permitidos
 */
import {
  loginClienteUi,
  adicionarLivrosAoCarrinho,
  irParaCheckoutComEnderecoEFrete,
} from '../../support/fluxo-venda.helpers';

/** Converte "R$ 1.234,56" → 1234.56. */
function valorMonetario(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
  return Number.parseFloat(limpo);
}

/**
 * Setup completo: login → aguarda sessão carregar → limpa carrinho → adiciona livros → vai para checkout.
 * O intercept de /api/auth/me garante que o Redux já processou a sessão antes de navegar
 * para o carrinho, evitando o problema de sessionLoading:true que oculta o botão finalizar.
 */
function setupCheckout(qtdLivros = 2) {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.intercept('GET', '/api/auth/me').as('authMe');
  loginClienteUi();
  cy.wait('@authMe');
  
  // Limpar carrinho via API para evitar contaminação entre testes
  cy.request('DELETE', '/api/carrinho');
  
  adicionarLivrosAoCarrinho(qtdLivros);
  irParaCheckoutComEnderecoEFrete();
}

describe('Validações de Cupons — RN0033, RN0035, RN0036', () => {

  describe('RN0033 - Cupom Promocional Único', () => {
    beforeEach(() => { setupCheckout(2); });

    it('deve impedir aplicação de segundo cupom promocional', () => {
      // Aplicar primeiro cupom promocional
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').click();
      cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
      
      // Selecionar primeiro cupom promocional (DESCONTO10 ou similar)
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .contains(/DESCONTO/i)
        .click();

      // Verificar que cupom foi aplicado
      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');
      cy.get('[data-cy="checkout-applied-coupons"]').should('contain', 'DESCONTO');

      // Tentar aplicar segundo cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]').clear().type('DESCONTO20');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Verificar mensagem de erro
      cy.get('[data-cy="checkout-coupon-error"]')
        .should('be.visible')
        .and('contain', 'Apenas um cupom promocional');
    });

    it('deve permitir múltiplos cupons de troca junto com promocional', () => {
      // Aplicar cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().click();
      cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .contains(/DESCONTO/i)
        .click();

      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');

      // Aplicar cupom de troca
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().clear().type('TROCA50-TESTE');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Verificar que ambos foram aplicados
      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');
      cy.get('[data-cy="checkout-applied-coupons"]').find('[data-cy^="checkout-coupon-"]').should('have.length.at.least', 2);
    });
  });

  describe('RN0035 - Cupons Prioritários', () => {
    beforeEach(() => { setupCheckout(2); });

    it('deve listar cupons reais do banco de dados', () => {
      // Verificar que sugestões de cupons estão disponíveis
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').click();
      
      // Aguardar sugestões carregarem
      cy.get('[data-cy="checkout-coupon-suggestions"]', { timeout: 10000 }).should('be.visible');

      // Verificar que cupons conhecidos do banco estão presentes
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .should('have.length.at.least', 1);
    });

    it('deve aplicar cupom promocional do banco corretamente', () => {
      // Aplicar cupom promocional conhecido do banco
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().click();
      cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
      
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .contains('DESCONTO10')
        .click();

      // Verificar que cupom foi aplicado com desconto correto
      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');
      cy.get('[data-cy="checkout-applied-coupons"]').should('contain', 'DESCONTO10');
      
      // Verificar que o desconto foi aplicado no total
      cy.get('[data-cy="checkout-subtotal"]').invoke('text').then((subtotal) => {
        cy.get('[data-cy="checkout-total-value"]').invoke('text').then((total) => {
          const valorSubtotal = valorMonetario(subtotal);
          const valorTotal = valorMonetario(total);
          expect(valorTotal).to.be.lessThan(valorSubtotal);
        });
      });
    });
  });

  describe('RN0036 - Cupom de Troca Excedente', () => {
    beforeEach(() => { setupCheckout(2); });

    it('deve rejeitar cupom de troca inválido ou inexistente', () => {
      // Tentar aplicar cupom inexistente
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().type('CUPOM-TROCA-INEXISTENTE');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Verificar mensagem de erro
      cy.get('[data-cy="checkout-coupon-error"]')
        .should('be.visible')
        .and('contain', 'inválido');
    });
  });
});
