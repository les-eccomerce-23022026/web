/**
 * CDU001 — Cliente realizar compra (E2E com telas)
 * Paridade com `casos-uso-entrega-7/cdu001-cliente-realizar-compra.cy.ts` (API).
 */

import {
  configurarAmbienteEntrega7Ui,
  confirmarEntregaAdminUi,
  despacharPedidoAdminUi,
  loginAdminUi,
  autenticarClienteDadosTesteUi,
  realizarCompraCompletaNaUi,
  sufixoPedidoNaTabela,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Vendas — Realizar Compra Completa (CDU001)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    autenticarClienteDadosTesteUi();
  });

  it('deve concluir compra no checkout e exibir tela de pedido confirmado', () => {
    realizarCompraCompletaNaUi();
    cy.url({ timeout: 25000 }).should('include', '/pedido-confirmado');
    cy.url().should('match', /[?&]pedido=/);
    cy.contains('h1', /Pedido Realizado com Sucesso/i, { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
  });

  it('deve permitir admin despachar e confirmar entrega nas telas administrativas', () => {
    realizarCompraCompletaNaUi();
    cy.url().then((url) => {
      const pedido = new URL(url).searchParams.get('pedido');
      expect(pedido, 'UUID do pedido na URL de confirmação').to.be.a('string').and.not.be.empty;
      cy.wrap(pedido!).as('vendaUuidUi');
    });

    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaUuidUi').then((vendaUuid) => {
      despacharPedidoAdminUi(vendaUuid);
      confirmarEntregaAdminUi(vendaUuid);

      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.contains(sufixoPedidoNaTabela(vendaUuid))
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });
  });
});
