/**
 * CDU007 — Admin despacha entrega (E2E com tela /admin/pedidos)
 */

import {
  configurarAmbienteEntrega7Ui,
  despacharPedidoAdminUi,
  loginAdminUi,
  sufixoPedidoNaTabela,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Entregas — Despachar Pedido Aprovado (CDU007, RF0038)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.wrap(dados.vendaUuid).as('vendaUuid');
    });
    loginAdminUi();
  });

  it('deve exibir painel de pedidos e despachar venda APROVADA', () => {
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
    cy.visit('/admin/pedidos');
    cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
    cy.get('[data-cy="pedidos-painel"]').should('exist');
    cy.contains(sufixoPedidoNaTabela(vendaUuid)).should('be.visible');

    despacharPedidoAdminUi(vendaUuid);

    cy.contains(sufixoPedidoNaTabela(vendaUuid))
      .parents('tr')
      .find('[data-cy="status-badge"]')
      .should('contain', 'Trânsito');
    });
  });
});
