/**
 * CDU009 — Sistema gera cupom de troca (E2E: admin confirma recebimento + cupom no checkout)
 */

import { apiHeadersBancoTestes } from '../../support/helpers/checkoutHelpers';
import {
  autorizarTrocaAdminUi,
  configurarAmbienteEntrega7Ui,
  confirmarRecebimentoTrocaAdminUi,
  finalizarCompraCheckoutUi,
  loginAdminUi,
  autenticarClienteDadosTesteUi,
  selecionarEnderecoFretePadraoCheckoutUi,
  selecionarPrimeiroCartaoSalvoCheckoutUi,
  visitarCheckoutComCarrinhoSincronizadoUi,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Geração Automática de Cupom (CDU009, RF0046)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    cy.criarVendaAprovadaViaApi().then((dados) => {
      cy.despacharPedidoViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.confirmarEntregaViaApi(dados.vendaUuid, { restaurarSessao: false });
      cy.autenticarClienteDadosTeste();
      cy.solicitarTrocaViaApi(dados.vendaUuid, dados.itemVendaUuid, 'Gerar cupom');
      cy.wrap(dados.vendaUuid).as('vendaCupomUi');
    });
    loginAdminUi();
    cy.get<string>('@vendaCupomUi').then((vendaUuid) => {
      autorizarTrocaAdminUi(vendaUuid);
      confirmarRecebimentoTrocaAdminUi(vendaUuid);
    });

    cy.autenticarClienteDadosTeste();
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/clientes/perfil/cupons`,
      headers: apiHeadersBancoTestes(),
    }).then((res) => {
      const cupomTroca = (res.body as Array<{ tipo: string; codigo: string }>).find((c) => c.tipo === 'troca');
      expect(cupomTroca, 'cupom de troca após confirmar recebimento').to.exist;
      cy.wrap(cupomTroca!.codigo).as('cupomTrocaCodigoUi');
    });
  });

  it('deve permitir aplicar cupom de troca gerado na tela de checkout', () => {
    autenticarClienteDadosTesteUi();
    visitarCheckoutComCarrinhoSincronizadoUi();
    selecionarEnderecoFretePadraoCheckoutUi();
    cy.get<string>('@cupomTrocaCodigoUi').then((cupomCodigo) => {
      cy.checkoutAplicarCupom(cupomCodigo);
      cy.get(`[data-cy="checkout-coupon-${cupomCodigo}"]`, { timeout: 10000 }).should('be.visible');
    });
    selecionarPrimeiroCartaoSalvoCheckoutUi();
    finalizarCompraCheckoutUi();
    cy.url().should('include', '/pedido-confirmado');
  });
});
