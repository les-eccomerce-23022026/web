/**
 * CDU010 — Admin confirma ENTREGUE (E2E com /admin/pedidos)
 */

import {
  configurarAmbienteTestesVenda,
  confirmarEntregaAdminUi,
  despacharPedidoAdminUi,
  loginAdminPedidosUi,
  autenticarClienteDadosTesteUi,
  linhaPedidoAdmin,
  localizarPedidoAdminPorUuid,
  visitarPainelPedidosAdminUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Entregas — Confirmar Entrega Realizada (CDU010, RF0039)', () => {
  beforeEach(() => {
    configurarAmbienteTestesVenda();
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.wrap(dados.vendaUuid).as('vendaUuid');
    });
    loginAdminPedidosUi();
  });

  it('deve despachar e confirmar entrega exibindo status ENTREGUE no painel admin', () => {
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      despacharPedidoAdminUi(vendaUuid);
      confirmarEntregaAdminUi(vendaUuid);

      visitarPainelPedidosAdminUi();
      cy.get('[data-cy="admin-toolbar-filter-status"]').select('Entregue', { force: true });
      cy.wait(400);
      localizarPedidoAdminPorUuid(vendaUuid);
      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });
  });

  it('deve refletir status ENTREGUE em Meus Pedidos do cliente', () => {
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      despacharPedidoAdminUi(vendaUuid);
      confirmarEntregaAdminUi(vendaUuid);

      autenticarClienteDadosTesteUi();
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get(`[data-cy="pedido-${vendaUuid}"]`).should('contain', 'Entregue');
    });
  });
});
