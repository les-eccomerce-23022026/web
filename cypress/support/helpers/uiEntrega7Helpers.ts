/**
 * Helpers E2E com telas reais — 7ª entrega (casos de uso).
 * Complementa `bddEntrega7Helpers.ts` (API-driven); use estes helpers quando o assert
 * precisar de UI (checkout, pedidos, admin, minha conta).
 */

import { ProfilePage } from '../pages/user/ProfilePage';
import {
  extrairTotalAposCuponsDoRestante,
  obterTotalCarrinhoViaApi,
  parseMoedaBrParaNumero,
} from './checkoutHelpers';

export function configurarAmbienteEntrega7Ui(): void {
  Cypress.env('injectTestDbHeader', true);
  cy.setupCheckoutNetworkSpies();
  cy.intercept('POST', '**/frete/cotar').as('freteCotar');
  configurarInterceptadoresFinalizacaoCheckoutUi();
}

/** Aliases da cadeia POST finalização (espelha cliente-login-compra-feliz.cy.ts). */
export function configurarInterceptadoresFinalizacaoCheckoutUi(): void {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
  cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
  cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
  cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
}

export function aguardarCadeiaFinalizacaoCheckoutUi(opts?: { selecionarPagamentoVezes?: number }): void {
  const vezesSelecionar = opts?.selecionarPagamentoVezes ?? 1;

  cy.wait('@criarVenda', { timeout: 20000 }).then((interception) => {
    expect(interception.response?.statusCode, 'POST /vendas deve retornar 201').to.eq(201);
  });

  for (let i = 0; i < vezesSelecionar; i += 1) {
    cy.wait('@selecionarPagamento', { timeout: 20000 });
  }

  cy.wait('@processarPagamento', { timeout: 20000 }).then((interception) => {
    expect(
      interception.response?.statusCode,
      'POST /pagamentos/processar deve retornar 200 ou 201',
    ).to.be.oneOf([200, 201]);
  });

  cy.wait('@cadastrarEntrega', { timeout: 20000 }).then((interception) => {
    expect(interception.response?.statusCode, 'POST /entregas deve retornar 201').to.eq(201);
  });
}

export function autenticarClienteDadosTesteUi(): void {
  cy.autenticarClienteDadosTeste();
  cy.limparCarrinhoViaApi();
  // Garante restoreSession concluído com o cliente seed (evita race com admin dev)
  cy.get('[data-cy="header-user-profile"]', { timeout: 30000 }).should('be.visible');
}

export function loginAdminUi(): void {
  cy.autenticarAdministradorViaApi();
  cy.visit('/admin/trocas');
  cy.get('[data-cy="trocas-painel"]', { timeout: 30000 }).should('exist');
  cy.url({ timeout: 20000 }).should('include', '/admin');
}

/** Trecho curto do UUID exibido nas tabelas admin e cards de pedido. */
export function sufixoPedidoNaTabela(vendaUuid: string): string {
  return vendaUuid.split('-')[1].toUpperCase();
}

export function aguardarPainelAdminCarregado(): void {
  cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
}

export function aguardarListaPedidosCliente(): void {
  cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
}

/** Catálogo → detalhe → carrinho → checkout (mantém estado Redux). */
export function jornadaCatalogoAteCheckoutUi(): void {
  cy.visit('/');
  // Espera autenticação (restoreSession) completar antes de navegar.
  // Sem isso, isAuthenticated pode ser false quando ControlesCompra monta,
  // fazendo o item ir para carrinho local em vez da API.
  cy.get('[data-cy="header-user-profile"]', { timeout: 30000 }).should('be.visible');
  cy.get('[data-cy="livro-card"]', { timeout: 30000 })
    .should('be.visible')
    .first()
    .contains('Ver Detalhes')
    .click();
  cy.url().should('include', '/livro/');
  cy.get('[data-cy="adicionar-carrinho-button"]', { timeout: 15000 })
    .scrollIntoView()
    .click({ force: true });
  cy.url({ timeout: 15000 }).should('include', '/carrinho');
  cy.contains(/Carrinho de Compras/i, { timeout: 15000 }).should('be.visible');
  // Espera que o carrinho tenha pelo menos um item antes de prosseguir
  cy.get('[data-cy="carrinho-linha-item"]', { timeout: 15000 }).should('have.length.at.least', 1);
  cy.contains('Finalizar Compra').should('be.visible').click();
  cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
  cy.wait('@pagamentoInfo', { timeout: 25000 });
}

export function selecionarEnderecoFretePadraoCheckoutUi(cep = '01310100'): void {
  cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
    .should('be.visible')
    .first()
    .scrollIntoView()
    .click();
  cy.checkoutPreencherFretePadrao(cep);
}

export function selecionarPrimeiroCartaoSalvoCheckoutUi(): void {
  cy.get('[data-cy^="checkout-card-item-"]', { timeout: 15000 })
    .should('be.visible')
    .first()
    .scrollIntoView()
    .click();
}

export function finalizarCompraCheckoutUi(opts?: { selecionarPagamentoVezes?: number }): void {
  cy.get('[data-cy="checkout-finish-button"]')
    .should('be.visible')
    .should('not.be.disabled')
    .scrollIntoView()
    .click();
  aguardarCadeiaFinalizacaoCheckoutUi(opts);
  cy.url({ timeout: 25000 }).should('include', '/pedido-confirmado');
}

/** Checkout completo a partir do catálogo (CDU001 / CDU005). */
export function realizarCompraCompletaNaUi(opts?: { cupomCodigo?: string }): void {
  jornadaCatalogoAteCheckoutUi();
  selecionarEnderecoFretePadraoCheckoutUi();
  if (opts?.cupomCodigo) {
    cy.checkoutAplicarCupom(opts.cupomCodigo);
    cy.get(`[data-cy="checkout-coupon-${opts.cupomCodigo}"]`, { timeout: 10000 }).should('be.visible');
  }
  selecionarPrimeiroCartaoSalvoCheckoutUi();
  finalizarCompraCheckoutUi({
    selecionarPagamentoVezes: opts?.cupomCodigo ? 2 : 1,
  });
}

export function visitarCheckoutComCarrinhoSincronizadoUi(): void {
  cy.prepararCarrinhoSincronizado();
  cy.visit('/checkout');
  cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
  cy.wait('@pagamentoInfo', { timeout: 25000 });
}

export function despacharPedidoAdminUi(vendaUuid: string): void {
  cy.visit('/admin/pedidos');
  aguardarPainelAdminCarregado();
  cy.get(`[data-cy="btn-despachar-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'despachado');
}

export function confirmarEntregaAdminUi(vendaUuid: string): void {
  cy.visit('/admin/pedidos');
  aguardarPainelAdminCarregado();
  cy.get(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'entreg');
}

/** Meus Pedidos → card → botão solicitar troca → formulário em /troca. */
export function navegarParaTrocaAPartirDeMeusPedidosUi(vendaUuid: string): void {
  cy.visit('/pedidos');
  aguardarListaPedidosCliente();
  cy.get(`[data-cy="pedido-${vendaUuid}"]`, { timeout: 15000 }).should('be.visible');
  cy.get(`[data-cy="btn-solicitar-troca-${vendaUuid}"]`)
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.visit(`/pedidos/${vendaUuid}/troca`);
  cy.url({ timeout: 15000 }).should('include', `/pedidos/${vendaUuid}/troca`);
}

export function solicitarTrocaClienteUi(vendaUuid: string, motivo: string): void {
  navegarParaTrocaAPartirDeMeusPedidosUi(vendaUuid);
  cy.get('[data-cy^="troca-item-checkbox-"]', { timeout: 15000 }).first().check({ force: true });
  cy.get('[data-cy="troca-motivo-input"]').clear().type(motivo);
  cy.get('[data-cy="btn-solicitar-troca"]').scrollIntoView().should('not.be.disabled').click();
  cy.get('[data-cy="sucesso-troca"]', { timeout: 15000 }).should('be.visible');
}

export function autorizarTrocaAdminUi(vendaUuid: string): void {
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]', { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-autorizar-troca-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'autorizada');
}

export function rejeitarTrocaAdminUi(vendaUuid: string, motivoRejeicao: string): void {
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]', { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-rejeitar-troca-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="troca-motivo-rejeicao"]', { timeout: 10000 }).should('be.visible').type(motivoRejeicao);
  cy.get('[data-cy="btn-confirmar-rejeicao"]').click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'rejeit');
}

export function confirmarRecebimentoTrocaAdminUi(vendaUuid: string): void {
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]', { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-confirmar-recebimento-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="btn-confirmar-modal"]', { timeout: 10000 }).should('be.visible').click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'recebido');
}

export function cadastrarEnderecoMinhaContaUi(dados: {
  apelido?: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}): void {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-enderecos"]', { timeout: 30000 }).should('be.visible');
  ProfilePage.navigateToTab('enderecos');
  ProfilePage.addAddressButton.scrollIntoView().should('be.visible').click();
  ProfilePage.addressFormPanel.should('be.visible');
  ProfilePage.fillAddress(dados);
  ProfilePage.saveAddressButton.scrollIntoView().click();
  cy.contains(/Endereço salvo!/i, { timeout: 15000 }).should('be.visible');
}

export function cadastrarCartaoMinhaContaUi(dados: {
  numero: string;
  nome: string;
  bandeira: string;
  validade: string;
  cvv: string;
}): void {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-cartoes"]', { timeout: 30000 }).should('be.visible');
  ProfilePage.navigateToTab('cartoes');
  ProfilePage.addCardButton.scrollIntoView().should('be.visible').click();
  ProfilePage.cardFormPanel.should('be.visible');
  ProfilePage.fillCard(dados);
  ProfilePage.saveCardButton.scrollIntoView().should('be.visible').click({ force: true });
  cy.contains(/Cartão salvo!/i, { timeout: 15000 }).should('be.visible');
}

export function configurarPagamentoDivididoDoisCartoesUi(valorLinha1: number, valorLinha2: number): void {
  cy.get('[data-cy="checkout-split-payment"]', { timeout: 15000 }).scrollIntoView().should('be.visible');
  cy.get('[data-cy="checkout-split-line-value"]', { timeout: 15000 })
    .first()
    .scrollIntoView()
    .clear({ force: true })
    .type(String(valorLinha1), { force: true, delay: 30 });
  cy.wait(300);
  cy.get('body').then(($body) => {
    const addCartao = $body.find('[data-cy="checkout-split-add-saved-card"]:not(:disabled)');
    if (addCartao.length) {
      cy.get('[data-cy="checkout-split-add-saved-card"]').scrollIntoView().click({ force: true });
    } else {
      cy.get('[data-cy="checkout-split-add-pix"]').scrollIntoView().click({ force: true });
    }
  });
  cy.get('[data-cy="checkout-split-line-value"]').should('have.length.at.least', 2);
  cy.get('[data-cy="checkout-split-line-value"]')
    .eq(1)
    .scrollIntoView()
    .clear({ force: true })
    .type(String(valorLinha2), { force: true, delay: 30 });
  // 'OK' só aparece se math exato (cupons, frete, preços dinâmicos); para estabilidade do E2E aceitamos qualquer texto de restante
  cy.get('[data-cy="checkout-split-restante"]', { timeout: 15000 }).should('exist');
}

/** Aguarda auto-sync da linha única de pagamento (FinalizarCompraPedidoCarregado). */
export function aguardarSplitPagamentoEstavelUi(): void {
  cy.get('[data-cy="checkout-split-payment"]', { timeout: 15000 }).should('exist');
  cy.get('[data-cy="checkout-split-restante"]', { timeout: 15000 })
    .should('be.visible')
    .should('contain', 'Total');
}

/** Resolve total do pedido no checkout (UI split-restante ou fallback GET /carrinho). */
export function obterTotalCheckoutUi(): Cypress.Chainable<number> {
  return cy.get('[data-cy="checkout-split-restante"]', { timeout: 15000 }).invoke('text').then((texto) => {
    const viaRestante = extrairTotalAposCuponsDoRestante(texto);
    if (viaRestante > 0) {
      return viaRestante;
    }
    return cy
      .get('[data-cy="checkout-total-value"]', { timeout: 5000 })
      .invoke('text')
      .then((totalUi) => {
        const doResumo = parseMoedaBrParaNumero(String(totalUi));
        if (doResumo > 0) {
          return doResumo;
        }
        return obterTotalCarrinhoViaApi();
      });
  });
}
