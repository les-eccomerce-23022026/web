/**
 * CDU006 — Admin aceitar/negar troca (E2E com tela /admin/trocas)
 */

import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  loginAdminUi,
  loginClienteSeedUi,
  rejeitarTrocaAdminUi,
  solicitarTrocaClienteUi,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU006 (UI) - Admin Aceitar/Negar Troca', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
  });

  it('deve autorizar troca na tela administrativa', () => {
    cy.criarVendaAprovadaApi().then((dados) => {
      cy.despacharPedidoApi(dados.vendaUuid);
      cy.confirmarEntregaApi(dados.vendaUuid);
      cy.wrap(dados.vendaUuid).as('vendaTrocaUi');
    });

    loginClienteSeedUi();
    cy.get<string>('@vendaTrocaUi').then((vendaUuid) => {
      solicitarTrocaClienteUi(vendaUuid, 'Defeito visível na UI');
    });

    loginAdminUi();
    cy.get<string>('@vendaTrocaUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
    });
  });

  it('deve rejeitar troca com motivo na tela administrativa', () => {
    cy.criarVendaAprovadaApi().then((dados) => {
      cy.despacharPedidoApi(dados.vendaUuid);
      cy.confirmarEntregaApi(dados.vendaUuid);
      cy.wrap(dados.vendaUuid).as('vendaRejeicaoUi');
    });

    loginClienteSeedUi();
    cy.get<string>('@vendaRejeicaoUi').then((vendaUuid) => {
      solicitarTrocaClienteUi(vendaUuid, 'Troca para rejeição UI');
    });

    loginAdminUi();
    cy.get<string>('@vendaRejeicaoUi').then((vendaUuid) => {
      rejeitarTrocaAdminUi(vendaUuid, 'Motivo de rejeição registrado pelo admin na UI');
    });
  });
});
