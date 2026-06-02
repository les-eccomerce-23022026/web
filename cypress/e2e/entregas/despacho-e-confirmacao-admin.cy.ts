/**
 * Testes E2E do Fluxo Admin - Despacho e Entrega
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 */

import {
  aguardarPainelAdminCarregado,
  linhaPedidoAdmin,
  localizarPedidoAdminPorUuid,
  sufixoPedidoNaTabela,
  visitarPainelPedidosAdminUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Entregas — Despacho e Confirmação de Entrega (Admin)', () => {
  let vendaUuid: string;

  beforeEach(() => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });
    cy.autenticarAdministradorViaApi();
    cy.obterLojaPadraoUuid();
  });

  describe('Listagem de Pedidos', () => {
    it('deve exibir lista de pedidos no painel admin', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);
      cy.contains(sufixoPedidoNaTabela(vendaUuid)).should('be.visible');
    });

    it('deve filtrar pedidos por busca', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);
      linhaPedidoAdmin(vendaUuid).should('have.length', 1);
    });

    it('deve filtrar pedidos por status', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      cy.get('[data-cy="admin-toolbar-filter-status"]')
        .should('exist')
        .select('Em Processamento', { force: true });

      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Processamento');
    });
  });

  describe('Despacho de Pedido (RF0038) - E2E UI Real', () => {
    it('deve despachar pedido APROVADA para EM TRÂNSITO', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Processamento');

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-despachar-${vendaUuid}"]`)
        .click({ force: true });

      // Wait for status update instead of checking feedback banner text
      cy.wait(500);

      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Trânsito');
    });

    it('deve exibir botão de despachar para pedidos aprovados', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-despachar-${vendaUuid}"]`)
        .should('exist');
    });

    it('deve impedir despacho de pedido já em trânsito', () => {
      cy.despacharPedidoViaApi(vendaUuid, { restaurarSessao: false });
      cy.reload(); // Force Redux refresh after API call

      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-despachar-${vendaUuid}"]`)
        .should('not.exist');

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`)
        .should('exist');
    });

    it('deve impedir confirmação de entrega de pedido não em trânsito', () => {
      // This test checks that an order in Em Processamento status
      // doesn't have the confirm delivery button
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`)
        .should('not.exist');

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-despachar-${vendaUuid}"]`)
        .should('exist');
    });
  });

  describe('Confirmação de Entrega (RF0039) - E2E UI Real', () => {
    beforeEach(() => {
      cy.despacharPedidoViaApi(vendaUuid, { restaurarSessao: false });
      cy.reload(); // Force Redux refresh after API call
    });

    it('deve confirmar entrega EM TRÂNSITO para ENTREGUE', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Trânsito');

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`)
        .click({ force: true });

      // Wait for status update instead of checking feedback banner text
      cy.wait(500);

      cy.get('[data-cy="admin-toolbar-filter-status"]').select('Entregue', { force: true });
      cy.wait(400);
      localizarPedidoAdminPorUuid(vendaUuid);
      linhaPedidoAdmin(vendaUuid)
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });

    it('deve exibir botão de confirmar entrega para pedidos em trânsito', () => {
      visitarPainelPedidosAdminUi();
      localizarPedidoAdminPorUuid(vendaUuid);

      linhaPedidoAdmin(vendaUuid)
        .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`)
        .should('exist');
    });
  });
});
