/**
 * Helpers E2E com telas reais — 7ª entrega (casos de uso).
 * Complementa `bddEntrega7Helpers.ts` (API-driven); use estes helpers quando o assert
 * precisar de UI (checkout, pedidos, admin, minha conta).
 */

import { ProfilePage } from '../pages/user/ProfilePage';

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

export function loginClienteSeedUi(): void {
  cy.loginClienteSeed();
  cy.limparCarrinhoApi();
}

export function loginAdminUi(): void {
  cy.loginAdminApi();
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

export function selecionarEnderecoFretePacCheckoutUi(cep = '01310100'): void {
  cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
    .should('be.visible')
    .first()
    .scrollIntoView()
    .click();
  cy.checkoutPreencherFretePac(cep);
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
  selecionarEnderecoFretePacCheckoutUi();
  if (opts?.cupomCodigo) {
    cy.checkoutAplicarCupom(opts.cupomCodigo);
    cy.get(`[data-cy="checkout-coupon-${opts.cupomCodigo}"]`, { timeout: 10000 }).should('be.visible');
  }
  selecionarPrimeiroCartaoSalvoCheckoutUi();
  finalizarCompraCheckoutUi({
    selecionarPagamentoVezes: opts?.cupomCodigo ? 2 : 1,
  });
}

export function visitarCheckoutComCarrinhoHidratadoUi(): void {
  cy.prepararCarrinhoComUmLivroHidratado();
  cy.visit('/checkout');
  cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
  cy.wait('@pagamentoInfo', { timeout: 25000 });
}

export function despacharPedidoAdminUi(vendaUuid: string): void {
  const sufixo = sufixoPedidoNaTabela(vendaUuid);
  cy.visit('/admin/pedidos');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="pedidos-painel"]').should('exist');
  cy.contains(sufixo)
    .parents('tr')
    .find('[data-cy^="btn-despachar-"]')
    .should('be.visible')
    .click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'despachado');
}

export function confirmarEntregaAdminUi(vendaUuid: string): void {
  const sufixo = sufixoPedidoNaTabela(vendaUuid);
  cy.visit('/admin/pedidos');
  aguardarPainelAdminCarregado();
  cy.contains(sufixo)
    .parents('tr')
    .find('[data-cy^="btn-confirmar-entrega-"]')
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
  const sufixo = sufixoPedidoNaTabela(vendaUuid);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]').should('exist');
  cy.contains(sufixo)
    .parents('tr')
    .find('[data-cy^="btn-autorizar-troca-"]')
    .should('be.visible')
    .click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'autorizada');
}

export function rejeitarTrocaAdminUi(vendaUuid: string, motivoRejeicao: string): void {
  const sufixo = sufixoPedidoNaTabela(vendaUuid);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.contains(sufixo)
    .parents('tr')
    .find('[data-cy^="btn-rejeitar-troca-"]')
    .should('be.visible')
    .click();
  cy.get('[data-cy="troca-motivo-rejeicao"]', { timeout: 10000 }).should('be.visible').type(motivoRejeicao);
  cy.get('[data-cy="btn-confirmar-rejeicao"]').click();
  cy.get('[data-cy="feedback-banner"]').should('exist').should('contain', 'rejeit');
}

export function confirmarRecebimentoTrocaAdminUi(vendaUuid: string): void {
  const sufixo = sufixoPedidoNaTabela(vendaUuid);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.contains(sufixo)
    .parents('tr')
    .find('[data-cy^="btn-confirmar-recebimento-"]')
    .should('be.visible')
    .click();
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
  ProfilePage.navigateToTab('enderecos');
  ProfilePage.addAddressButton.scrollIntoView().should('be.visible').click();
  ProfilePage.fillAddress(dados);
  ProfilePage.saveAddressButton.scrollIntoView().click();
  cy.get('[data-cy="notification-toast"]', { timeout: 15000 })
    .should('be.visible')
    .and('have.attr', 'data-cy-notification-type', 'success');
}

export function cadastrarCartaoMinhaContaUi(dados: {
  numero: string;
  nome: string;
  bandeira: string;
  validade: string;
  cvv: string;
}): void {
  cy.visit('/minha-conta');
  ProfilePage.navigateToTab('cartoes');
  ProfilePage.addCardButton.scrollIntoView().should('be.visible').click();
  ProfilePage.fillCard(dados);
  ProfilePage.saveCardButton.scrollIntoView().click();
  cy.get('[data-cy="notification-toast"]', { timeout: 15000 })
    .should('be.visible')
    .and('have.attr', 'data-cy-notification-type', 'success')
    .and('contain', 'Cartão');
}

export function configurarSplitDoisCartoesUi(valorLinha1: number, valorLinha2: number): void {
  cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(valorLinha1));
  cy.get('[data-cy="checkout-split-add-saved-card"]').click();
  cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).should('exist');
  cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type(String(valorLinha2));
  cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*OK/);
}
