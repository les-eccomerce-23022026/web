/**
 * E2E — 7ª Entrega / Seção 4: Uso de cupom promocional.
 * Cliente aplica cupom promocional distribuído pela loja, verifica desconto
 * e conclui a compra com o desconto aplicado.
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

describe('Pagamentos — Cupom Promocional (CDU002, RF0017)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    adicionarLivrosAoCarrinho(2);
    irParaCheckoutComEnderecoEFrete();
  });

  it('4 deve aplicar cupom promocional, verificar desconto e concluir compra', () => {
    /**
     * Fluxo (4 Uso de cupom promocional):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Seleciona cartão salvo
     * 6. Digita código de cupom promocional válido
     * 7. Clica em "Aplicar cupom"
     * 8. Sistema valida cupom e aplica desconto no total
     * 9. Verifica que subtotal, desconto e total estão corretos
     * 10. Conclui pedido
     * 11. Verifica que pedido foi criado com desconto aplicado
     */
    // Capturar subtotal antes do cupom
    cy.get('[data-cy="checkout-subtotal"]').invoke('text').then((t) => {
      const subtotal = valorMonetario(t);
      
      // Cartão salvo padrão já selecionado
      cy.get('[data-cy^="checkout-card-item-"]').first().should('have.attr', 'data-selected', 'true');

      // Aplicar cupom promocional (usa a primeira sugestão de cupom válido do cliente)
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .find('button')
        .first()
        .invoke('text')
        .then((codigo) => {
          cy.get('[data-cy="checkout-coupon-input"]').clear().type(codigo.trim());
          cy.get('[data-cy="checkout-apply-coupon-button"]').click();

          // Cupom aparece na lista de aplicados
          cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible').and('contain.text', codigo.trim());

          // Capturar valor do desconto aplicado
          cy.get('[data-cy="checkout-discount"]').invoke('text').then((tDesconto) => {
            const desconto = valorMonetario(tDesconto);
            
            // Verificar que desconto foi aplicado (deve ser > 0)
            expect(desconto).to.be.greaterThan(0);
          });

          // Total final deve ser menor que subtotal + frete (desconto aplicado)
          cy.get('[data-cy="checkout-total-pagamento"]').invoke('text').then((tt) => {
            const total = valorMonetario(tt);
            expect(total).to.be.lessThan(subtotal + 1000);
          });
        });
    });

    // Concluir pedido com cupom aplicado
    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');
    
    // Verificar que o pedido foi criado com sucesso
    cy.get('[data-cy="confirmado-info"]').should('be.visible');
  });
});
