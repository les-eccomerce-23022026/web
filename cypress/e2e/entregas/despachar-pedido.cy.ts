/**
 * CDU007 — Admin despacha entrega (E2E com tela /admin/pedidos)
 * Fluxo com loja-padrão (clientetest + admintest alinhados ao seed E2E).
 */

import {
  configurarAmbienteEntrega7Ui,
  despacharPedidoAdminUi,
  loginAdminPedidosUi,
  autenticarClienteDadosTesteUi,
  linhaPedidoAdmin,
  localizarPedidoAdminPorUuid,
  visitarPainelPedidosAdminUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Entregas — Despachar Pedido Aprovado (CDU007, RF0038)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
  });

  it('deve exibir painel de pedidos e despachar venda APROVADA com login/logout correto', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.wrap(dados.vendaUuid).as('vendaUuid');
    });

    cy.logout();

    loginAdminPedidosUi();

    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      visitarPainelPedidosAdminUi();
      
      cy.get('tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy="status-badge"]').should('contain', 'Em Processamento');
        cy.get('[data-cy^="btn-despachar-"]').click({ force: true });
      });

      cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'despachado');
    });

    cy.logout();

    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get(`[data-cy="pedido-${vendaUuid}"]`)
        .should('be.visible')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'Trânsito');
    });
  });
});
