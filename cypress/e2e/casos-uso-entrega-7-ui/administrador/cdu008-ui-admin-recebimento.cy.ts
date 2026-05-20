/**
 * CDU008 — Admin confirma recebimento da troca (E2E com /admin/trocas)
 */

import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  confirmarRecebimentoTrocaAdminUi,
  loginAdminUi,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU008 (UI) - Admin Confirma Recebimento', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaApi().then((dados) => {
      cy.despacharPedidoApi(dados.vendaUuid);
      cy.confirmarEntregaApi(dados.vendaUuid);
      cy.solicitarTrocaApi(dados.vendaUuid, dados.itemVendaUuid, 'Devolução para cupom');
      cy.wrap(dados.vendaUuid).as('vendaRecebimentoUi');
    });
    loginAdminUi();
  });

  it('deve autorizar e confirmar recebimento do produto devolvido na UI', () => {
    cy.get<string>('@vendaRecebimentoUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
      confirmarRecebimentoTrocaAdminUi(vendaUuid);
    });
  });
});
