/**
 * CDU008 — Admin confirma recebimento da troca (E2E com /admin/trocas)
 */

import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  confirmarRecebimentoTrocaAdminUi,
  loginAdminUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Confirmar Recebimento do Produto (CDU008, RF0044)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid);
      cy.confirmarEntregaViaApi(dados.vendaUuid);
      cy.solicitarTrocaViaApi(dados.vendaUuid, dados.itemVendaUuid, 'Devolução para cupom');
      cy.wrap(dados.vendaUuid).as('vendaRecebimentoUi');
    });
    loginAdminUi();
  });

  it('deve autorizar e confirmar recebimento do produto devolvido', () => {
    cy.get<string>('@vendaRecebimentoUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
      confirmarRecebimentoTrocaAdminUi(vendaUuid);
    });
  });
});
