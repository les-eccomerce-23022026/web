/**
 * CDU005 — Pagamento aprovado (E2E: checkout + status em Meus Pedidos)
 */

import {
  configurarAmbienteEntrega7Ui,
  autenticarClienteDadosTesteUi,
  realizarCompraCompletaNaUi,
  sufixoPedidoNaTabela,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Pagamentos — Aprovação da Venda (CDU005)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    autenticarClienteDadosTesteUi();
  });

  it('deve exibir pedido aprovado em Meus Pedidos após finalizar checkout', () => {
    realizarCompraCompletaNaUi();

    cy.url().then((url) => {
      autenticarClienteDadosTesteUi();
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
