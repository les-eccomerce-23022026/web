/**
 * CDU005 — Pagamento aprovado (E2E: checkout + status em Meus Pedidos)
 */

import {
  configurarAmbienteTestesVenda,
  autenticarClienteDadosTesteUi,
  realizarCompraCompletaNaUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Pagamentos — Aprovação da Venda (CDU005)', () => {
  beforeEach(() => {
    configurarAmbienteTestesVenda();
    autenticarClienteDadosTesteUi();
  });

  it('deve exibir pedido aprovado em Meus Pedidos após finalizar checkout', () => {
    realizarCompraCompletaNaUi();

    cy.url().then((url) => {
      const pedidoUuid = new URL(url).searchParams.get('pedido');
      expect(pedidoUuid).to.be.a('string');

      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get(`[data-cy="pedido-${pedidoUuid}"]`, { timeout: 15000 })
        .should('be.visible')
        .find('[data-cy="pedido-status"]')
        .invoke('text')
        .should('match', /aprovad|processamento|tr[aâ]nsito|preparando|entregue/i);
    });
  });
});
