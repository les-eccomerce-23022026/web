/**
 * CDU009 — Sistema gera cupom de troca (E2E: admin confirma recebimento + cupom no checkout)
 */

import { apiHeadersTestDb } from '../../../support/helpers/checkoutHelpers';
import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  confirmarRecebimentoTrocaAdminUi,
  finalizarCompraCheckoutUi,
  loginAdminUi,
  loginClienteSeedUi,
  selecionarEnderecoFretePacCheckoutUi,
  selecionarPrimeiroCartaoSalvoCheckoutUi,
  visitarCheckoutComCarrinhoHidratadoUi,
} from '../../../support/helpers/uiEntrega7Helpers';

describe('CDU009 (UI) - Sistema Gera Cupom de Troca', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaApi().then((dados) => {
      cy.despacharPedidoApi(dados.vendaUuid);
      cy.confirmarEntregaApi(dados.vendaUuid);
      cy.solicitarTrocaApi(dados.vendaUuid, dados.itemVendaUuid, 'Gerar cupom na UI');
      cy.wrap(dados.vendaUuid).as('vendaCupomUi');
    });
    loginAdminUi();
    cy.get<string>('@vendaCupomUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
      confirmarRecebimentoTrocaAdminUi(vendaUuid);
    });

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/clientes/perfil/cupons`,
      headers: apiHeadersTestDb(),
    }).then((res) => {
      const cupomTroca = (res.body as Array<{ tipo: string; codigo: string }>).find((c) => c.tipo === 'troca');
      expect(cupomTroca, 'cupom de troca após confirmar recebimento').to.exist;
      cy.wrap(cupomTroca!.codigo).as('cupomTrocaCodigoUi');
    });
  });

  it('deve permitir aplicar cupom de troca gerado na tela de checkout', () => {
    loginClienteSeedUi();
    visitarCheckoutComCarrinhoHidratadoUi();
    selecionarEnderecoFretePacCheckoutUi();
    cy.get<string>('@cupomTrocaCodigoUi').then((cupomCodigo) => {
      cy.checkoutAplicarCupom(cupomCodigo);
      cy.get(`[data-cy="checkout-coupon-${cupomCodigo}"]`, { timeout: 10000 }).should('be.visible');
    });
    selecionarPrimeiroCartaoSalvoCheckoutUi();
    finalizarCompraCheckoutUi();
    cy.url().should('include', '/pedido-confirmado');
  });
});
