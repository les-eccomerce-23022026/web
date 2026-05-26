/**
 * CDU006 — Admin aceitar/negar troca (E2E com tela /admin/trocas)
 */

import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  loginAdminUi,
  autenticarClienteDadosTesteUi,
  rejeitarTrocaAdminUi,
  solicitarTrocaClienteUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Autorizar ou Rejeitar Solicitação (CDU006, RF0042)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
  });

  it('deve autorizar troca na tela administrativa', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid);
      cy.confirmarEntregaViaApi(dados.vendaUuid);
      cy.wrap(dados.vendaUuid).as('vendaTrocaUi');
    });

    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaTrocaUi').then((vendaUuid) => {
      solicitarTrocaClienteUi(vendaUuid, 'Defeito visível');
    });

    loginAdminUi();
    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaTrocaUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
    });
  });

  it('deve rejeitar troca com motivo na tela administrativa', () => {
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid);
      cy.confirmarEntregaViaApi(dados.vendaUuid);
      cy.wrap(dados.vendaUuid).as('vendaRejeicaoUi');
    });

    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaRejeicaoUi').then((vendaUuid) => {
      solicitarTrocaClienteUi(vendaUuid, 'Troca para rejeição UI');
    });

    loginAdminUi();
    autenticarClienteDadosTesteUi();
    cy.get<string>('@vendaRejeicaoUi').then((vendaUuid) => {
      rejeitarTrocaAdminUi(vendaUuid, 'Motivo de rejeição registrado pelo admin');
    });
  });
});
