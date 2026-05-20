/**
 * CDU005 — Pagamento aprovado (E2E: checkout + status em Meus Pedidos)
 */

import {
  configurarAmbienteEntrega7Ui,
  loginClienteSeedUi,
  realizarCompraCompletaNaUi,
  sufixoPedidoNaTabela,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU005 (UI) - Pagamento Aprovado da Venda', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    loginClienteSeedUi();
  });

  it('deve exibir pedido aprovado em Meus Pedidos após finalizar checkout', () => {
    realizarCompraCompletaNaUi();

    cy.url().then((url) => {
      const pedidoUuid = new URL(url).searchParams.get('pedido');
      expect(pedidoUuid).to.be.a('string');

      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.contains(sufixoPedidoNaTabela(pedidoUuid!))
        .parents('[data-cy^="pedido-card-"]')
        .should('be.visible')
        .find('[data-cy="pedido-status"]')
        .should('match', /aprovad|processamento/i);
    });
  });
});
