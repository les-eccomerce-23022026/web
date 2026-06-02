/**
 * CDU001 — Cliente realizar compra (E2E com telas)
 * Paridade com `casos-uso-entrega-7/cdu001-cliente-realizar-compra.cy.ts` (API).
 */

import {
  configurarAmbienteEntrega7Ui,
  autenticarClienteDadosTesteUi,
  realizarCompraCompletaNaUi,
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
    cy.contains('h1', /Pedido Realizado com Sucesso!/i, { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
  });

  it('deve permitir admin despachar e confirmar entrega via API', () => {
    // Criar venda aprovada via API
    cy.criarVendaAprovadaViaApi().then((dados) => {
      const vendaUuid = dados.vendaUuid;
      
      // Despachar e confirmar entrega
      cy.despacharPedidoViaApi(vendaUuid);
      cy.confirmarEntregaViaApi(vendaUuid);
    });
  });
});
