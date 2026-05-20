/**
 * CDU002 — Pagamento com combinações (E2E com telas de checkout)
 */

import {
  configurarAmbienteEntrega7Ui,
  configurarSplitDoisCartoesUi,
  finalizarCompraCheckoutUi,
  loginClienteSeedUi,
  selecionarEnderecoFretePacCheckoutUi,
  selecionarPrimeiroCartaoSalvoCheckoutUi,
  visitarCheckoutComCarrinhoHidratadoUi,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU002 (UI) - Cliente Pagar com Combinações', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    loginClienteSeedUi();
  });

  it('deve aplicar cupom promocional na tela de checkout e finalizar compra', () => {
    visitarCheckoutComCarrinhoHidratadoUi();
    selecionarEnderecoFretePacCheckoutUi();
    cy.checkoutAplicarCupom('DESCONTO10');
    cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 }).should('be.visible');
    selecionarPrimeiroCartaoSalvoCheckoutUi();
    finalizarCompraCheckoutUi({ selecionarPagamentoVezes: 2 });
    cy.contains('h1', /Pedido Realizado com Sucesso/i).should('be.visible');
  });

  it('deve exibir erro RN0034 na UI quando linha do split fica abaixo de R$ 10,00', () => {
    visitarCheckoutComCarrinhoHidratadoUi();
    selecionarEnderecoFretePacCheckoutUi();
    cy.get('[data-cy="checkout-split-payment"]').should('exist');
    cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('5');
    cy.get('[data-cy="checkout-split-add-saved-card"]').click();
    cy.get('[data-cy="checkout-split-rn34-error"]')
      .should('exist')
      .and('contain', 'mínimo');
  });

  it('deve permitir split em dois cartões com restante OK na tela', () => {
    visitarCheckoutComCarrinhoHidratadoUi();
    selecionarEnderecoFretePacCheckoutUi();
    cy.get('[data-cy="checkout-split-payment"]').should('exist');

    cy.get('[data-cy="checkout-total-value"]', { timeout: 10000 })
      .first()
      .invoke('text')
      .then((textoTotal) => {
        const numeros = textoTotal.replace(/[^\d,]/g, '').replace(',', '.');
        const total = Number.parseFloat(numeros);
        expect(total, 'total do checkout deve ser numérico').to.be.a('number').and.not.be.NaN;
        const metade = Math.max(10, Math.floor(total / 2));
        const restante = Math.max(10, total - metade);
        configurarSplitDoisCartoesUi(metade, restante);
      });

    finalizarCompraCheckoutUi();
    cy.url().should('include', '/pedido-confirmado');
  });
});
