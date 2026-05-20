/**
 * CDU010 — Admin confirma ENTREGUE (E2E com /admin/pedidos)
 */

import {
  configurarAmbienteEntrega7Ui,
  confirmarEntregaAdminUi,
  despacharPedidoAdminUi,
  loginAdminUi,
  loginClienteSeedUi,
  sufixoPedidoNaTabela,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU010 (UI) - Admin Confirma ENTREGUE', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaApi().then((dados) => {
      cy.wrap(dados.vendaUuid).as('vendaUuid');
    });
    loginAdminUi();
  });

  it('deve despachar e confirmar entrega exibindo status ENTREGUE no painel admin', () => {
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
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

  it('deve refletir status ENTREGUE em Meus Pedidos do cliente', () => {
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      despacharPedidoAdminUi(vendaUuid);
      confirmarEntregaAdminUi(vendaUuid);

      loginClienteSeedUi();
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get(`[data-cy="pedido-${vendaUuid}"]`).should('contain', 'Entregue');
    });
  });
});
