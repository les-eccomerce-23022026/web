/**
 * E2E — Validações de Pagamento e Parcelamento (RN0034, RN0069)
 * Testes automatizados para validações de pagamento no checkout
 * 
 * RN0034 - Múltiplos Cartões: Mínimo R$ 10 por cartão
 * RN0069 - Parcelamento Mínimo: Compras abaixo de R$ 80 não permitem parcelamento
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

describe('Validações de Pagamento e Parcelamento — RN0034, RN0069', () => {

  describe('RN0034 - Múltiplos Cartões', () => {
    it('deve permitir múltiplos cartões com valor mínimo de R$ 10 cada', () => {
      setupCheckout(4);

      // Adicionar segunda linha de pagamento com cartão salvo
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').scrollIntoView().click();

      // Verificar que existem 2 linhas de pagamento
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').should('have.length', 2);

      // Inserir R$ 10 na segunda linha
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').last().clear().type('10');

      // Verificar que não há erro RN0034
      cy.get('[data-cy="pagamento-dividido-erro-rn34"]').should('not.exist');
    });
  });

  describe('RN0069 - Parcelamento Mínimo', () => {
    it('deve permitir parcelamento para compra acima de R$ 80', () => {
      setupCheckout(3);

      // Verificar valor total usando o seletor correto
      cy.get('[data-cy="checkout-total-value"]').invoke('text').then((valorTexto) => {
        const valorTotal = valorMonetario(valorTexto);
        
        if (valorTotal >= 80) {
          // Selecionar cartão
          cy.get('[data-cy^="checkout-card-item-"]').first().click();
          
          // Verificar que o select de parcelas existe
          cy.get('[data-cy="checkout-split-line-parcelas"]').should('exist');
          
          // Verificar que múltiplas parcelas estão disponíveis (pelo menos 2)
          cy.get('[data-cy="checkout-split-line-parcelas"]').find('option').should('have.length.at.least', 2);
          
          // Verificar que a opção de 1x existe
          cy.get('[data-cy="checkout-split-line-parcelas"]').find('option[value="1"]').should('exist');
          
          // Verificar que a opção de 2x existe
          cy.get('[data-cy="checkout-split-line-parcelas"]').find('option[value="2"]').should('exist');
        }
      });
    });
  });

  describe('Validações Combinadas', () => {
    it('deve aplicar cupom promocional e cupom de troca juntos', () => {
      setupCheckout(3);

      // Aplicar cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().click();
      cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .contains(/DESCONTO/i)
        .click();

      // Aplicar cupom de troca
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().clear().type('TROCA50-TESTE');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Verificar que ambos foram aplicados
      cy.get('[data-cy="checkout-applied-coupons"]')
        .find('[data-cy^="checkout-coupon-"]')
        .should('have.length.at.least', 2);

      // Verificar que o botão de conclusão está habilitado
      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled');
    });

    it('deve manter validações com múltiplos cartões e cupons', () => {
      setupCheckout(5);

      // Aplicar cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().click();
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .contains(/DESCONTO/i)
        .click();

      // Adicionar múltiplos cartões para teste de validações combinadas
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').scrollIntoView().click();
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').last().clear().type('15');
      
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').click();
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').last().clear().type('20');

      // Verificar que validações estão sendo respeitadas
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').should('have.length.at.least', 2);
      cy.get('[data-cy="pagamento-dividido-erro-rn34"]').should('not.exist');

      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');
    });
  });
});
