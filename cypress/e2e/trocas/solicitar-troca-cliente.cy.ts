/**
 * CDU004 — Solicitar troca/devolução (E2E com telas de pedidos e troca)
 */

import {
  autenticarClienteDadosTesteUi,
  solicitarTrocaClienteUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Solicitar Troca de Produto (CDU004, RF0041)', () => {
  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
  });

  it('deve solicitar troca na tela /pedidos/:uuid/troca para pedido ENTREGUE', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.wrap(dados.vendaUuid).as('vendaEntregueUi');
      cy.despacharPedidoViaApi(dados.vendaUuid);
      cy.confirmarEntregaViaApi(dados.vendaUuid);
    });

    cy.get<string>('@vendaEntregueUi').then((vendaUuid) => {
      solicitarTrocaClienteUi(vendaUuid, 'Produto não atendeu expectativas');

      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get(`[data-cy="pedido-${vendaUuid}"]`)
        .should('be.visible')
        .invoke('text')
        .should('match', /troca/i);
    });
  });

  it('deve bloquear troca quando pedido não está ENTREGUE (RN0063)', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      autenticarClienteDadosTesteUi();
      cy.visit(`/pedidos/${dados.vendaUuid}/troca`);
      cy.get('[data-cy="troca-carregando"]', { timeout: 5000 }).should('not.exist');
      cy.get('[data-cy="troca-erro"]', { timeout: 15000 })
        .should('be.visible')
        .and('contain', 'Entregue');
    });
  });

  it('deve exibir erro de prazo expirado (RN0043 / cenário 7)', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid);
      cy.confirmarEntregaViaApi(dados.vendaUuid);

      autenticarClienteDadosTesteUi();
      cy.task<boolean>('bddRetrocederDataEntrega', { vendaUuid: dados.vendaUuid }).then(function (ok) {
        if (!ok) {
          this.skip();
        }
        cy.visit(`/pedidos/${dados.vendaUuid}/troca`);
        cy.get('[data-cy^="troca-item-checkbox-"]', { timeout: 15000 }).first().check({ force: true });
        cy.get('[data-cy="troca-motivo-input"]').type('Teste prazo expirado UI');
        cy.get('[data-cy="btn-solicitar-troca"]').click();
        cy.get('[data-cy="troca-erro"]', { timeout: 15000 }).should('contain', '7 dias');
      });
    });
  });
});
