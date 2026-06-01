/**
 * CDU006 — Admin aceitar/negar troca (E2E com tela /admin/trocas)
 */

import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  loginAdminUi,
  rejeitarTrocaAdminUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Autorizar ou Rejeitar Solicitação (CDU006, RF0042)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
  });

  it('deve autorizar troca na tela administrativa', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.confirmarEntregaViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.autenticarClienteDadosTeste();
      cy.solicitarTrocaViaApi(dados.vendaUuid, dados.itemVendaUuid, 'Defeito visível');
      cy.wrap(dados.vendaUuid).as('vendaTrocaUi');
    });

    loginAdminUi();
    cy.get<string>('@vendaTrocaUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
    });
  });

  it('deve rejeitar troca com motivo na tela administrativa', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.confirmarEntregaViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.autenticarClienteDadosTeste();
      cy.solicitarTrocaViaApi(dados.vendaUuid, dados.itemVendaUuid, 'Troca para rejeição UI');
      cy.wrap(dados.vendaUuid).as('vendaRejeicaoUi');
    });

    loginAdminUi();
    cy.get<string>('@vendaRejeicaoUi').then((vendaUuid) => {
      rejeitarTrocaAdminUi(vendaUuid, 'Motivo de rejeição registrado pelo admin');
    });
  });
});
