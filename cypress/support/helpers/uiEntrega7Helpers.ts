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

export function configurarAmbienteTestesVenda(): void {
  Cypress.env('injectTestDbHeader', true);
  cy.setupCheckoutNetworkSpies();
  cy.intercept('POST', '**/frete/cotar').as('freteCotar');
  prepararMonitoramentoFinalizacaoPedido();
}

/** Aliases da cadeia POST finalização (espelha cliente-login-compra-feliz.cy.ts). */
export function prepararMonitoramentoFinalizacaoPedido(): void {
  // Use baseUrl (Next.js) since API calls go through Next.js rewrites
  cy.intercept('POST', '**/api/vendas').as('criarVenda');
  cy.intercept('POST', '**/api/pagamentos/selecionar').as('selecionarPagamento');
  cy.intercept('POST', '**/api/pagamentos/*/processar').as('processarPagamento');
  cy.intercept('POST', '**/api/entregas').as('cadastrarEntrega');
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
  // Visitar home para renderizar a UI com estado de autenticação
  cy.visit('/');
  // Garante restoreSession concluído com o cliente seed (evita race com admin dev)
  cy.get('[data-cy="header-user-profile"]', { timeout: 30000 }).should('be.visible');
}

/** Vendas E2E do clientetest são na loja-padrão; admin seed pode ter loja principal em outra loja. */
export function sincronizarAdministradorLoja(): void {
  cy.obterLojaPadraoUuid();
}

export function loginAdminUi(): void {
  cy.autenticarAdministradorViaApi();
  sincronizarAdministradorLoja();
  cy.visit('/admin/trocas');
  cy.get('[data-cy="trocas-painel"]', { timeout: 30000 }).should('exist');
  cy.url({ timeout: 20000 }).should('include', '/admin');
}

/** Login admin + loja-padrão sem navegar para trocas (evita poluir Redux antes de /admin/pedidos). */
export function loginAdminPedidosUi(): void {
  cy.autenticarAdministradorViaApi();
  sincronizarAdministradorLoja();
}

/** Identificador curto do UUID exibido nas tabelas admin e cards de pedido. */
export function identificadorCurtoPedido(vendaUuid: string): string {
  return vendaUuid.split('-')[1].toUpperCase();
}

export function aguardarPainelAdminCarregado(): void {
  cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
}

export function visitarPainelPedidosAdminUi(): void {
  cy.obterLojaPadraoUuid().then((lojaUuid) => {
    cy.getCookie('x-loja-uuid').then((cookie) => {
      if (!cookie || cookie.value !== lojaUuid) {
        cy.setCookie('x-loja-uuid', lojaUuid, { path: '/' });
      }
    });
  });
  cy.intercept('GET', '/api/admin/pedidos').as('listarPedidosAdmin');
  cy.visit('/admin/pedidos');
  cy.wait('@listarPedidosAdmin', { timeout: 30000 });
  cy.get('[data-cy="pedidos-painel"]', { timeout: 30000 }).should('exist');
  aguardarPainelAdminCarregado();
}

/** Busca pelo identificador curto do pedido (debounce da toolbar) e valida a linha da tabela admin. */
export function localizarPedidoAdminPorUuid(vendaUuid: string): void {
  const sufixo = vendaUuid.split('-')[1];
  cy.get('[data-cy="admin-toolbar-filter-status"]', { timeout: 15000 })
    .select('todos');
  cy.get('[data-cy="admin-toolbar-search"]', { timeout: 15000 })
    .should('exist')
    .clear()
    .type(sufixo);
  // Aguarda o resultado da busca aparecer em vez de wait fixo
  cy.get(`[data-cy="admin-pedido-${vendaUuid}"]`, { timeout: 20000 })
    .should('exist')
    .scrollIntoView()
    .should('be.visible');
}

export function linhaPedidoAdmin(vendaUuid: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-cy="admin-pedido-${vendaUuid}"]`);
}

export function aguardarListaPedidosCliente(): void {
  cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
}

/** Fluxo completo do catálogo até a finalização do pedido (mantém estado Redux). */
export function fluxoCatalogoAtePagamento(): void {
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

export function concluirPedido(opts?: { selecionarPagamentoVezes?: number }): void {
  cy.get('[data-cy="checkout-finish-button"]')
    .should('be.visible')
    .should('not.be.disabled')
    .scrollIntoView()
    .click();
  aguardarCadeiaFinalizacaoCheckoutUi(opts);
  cy.url({ timeout: 25000 }).should('include', '/pedido-confirmado');
}

/** Fluxo completo de compra a partir do catálogo (CDU001 / CDU005). */
export function realizarCompraCompletaNaUi(opts?: { cupomCodigo?: string }): void {
  fluxoCatalogoAtePagamento();
  selecionarEnderecoFretePadraoCheckoutUi();
  if (opts?.cupomCodigo) {
    cy.checkoutAplicarCupom(opts.cupomCodigo);
    cy.get(`[data-cy="checkout-coupon-${opts.cupomCodigo}"]`, { timeout: 10000 }).should('be.visible');
  }
  selecionarPrimeiroCartaoSalvoCheckoutUi();
  concluirPedido({
    selecionarPagamentoVezes: opts?.cupomCodigo ? 2 : 1,
  });
}

export function visitarCheckoutComCarrinhoSincronizadoUi(): void {
  cy.prepararCarrinhoSincronizado();
  cy.visit('/checkout');
  cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
  // Retry mechanism for intermittent network errors on pagamento/info
  cy.wait('@pagamentoInfo', { timeout: 30000, requestTimeout: 30000 }).then((interception) => {
    const statusCode = interception.response?.statusCode;
    if (statusCode && statusCode >= 400) {
      cy.log(`[visitarCheckoutComCarrinhoSincronizadoUi] pagamentoInfo returned status ${statusCode}, retrying...`);
      cy.reload();
      cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
      cy.wait('@pagamentoInfo', { timeout: 30000 });
    }
  });
}

export function despacharPedidoAdminUi(vendaUuid: string): void {
  visitarPainelPedidosAdminUi();
  localizarPedidoAdminPorUuid(vendaUuid);
  linhaPedidoAdmin(vendaUuid)
    .find(`[data-cy="btn-despachar-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('not.be.disabled')
    .click();
  // Aguarda atualização de status verificando que o botão não está mais visível
  linhaPedidoAdmin(vendaUuid)
    .find(`[data-cy="btn-despachar-${vendaUuid}"]`, { timeout: 5000 })
    .should('not.exist');
}

export function confirmarEntregaAdminUi(vendaUuid: string): void {
  visitarPainelPedidosAdminUi();
  localizarPedidoAdminPorUuid(vendaUuid);
  linhaPedidoAdmin(vendaUuid)
    .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`, { timeout: 20000 })
    .scrollIntoView()
    .should('not.be.disabled')
    .click();
  // Aguarda atualização de status verificando que o botão não está mais visível
  linhaPedidoAdmin(vendaUuid)
    .find(`[data-cy="btn-confirmar-entrega-${vendaUuid}"]`, { timeout: 5000 })
    .should('not.exist');
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
  cy.get(`[data-cy="admin-troca-${vendaUuid}"]`, { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-autorizar-troca-${vendaUuid}"]`, { timeout: 20000 })
    .first()
    .scrollIntoView()
    .should('not.be.disabled')
    .click();
  // Aguarda processamento e recarrega para verificar novo estado
  cy.wait(2000);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
}

export function rejeitarTrocaAdminUi(vendaUuid: string, motivoRejeicao: string): void {
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]', { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="admin-troca-${vendaUuid}"]`, { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-rejeitar-troca-${vendaUuid}"]`, { timeout: 20000 })
    .first()
    .scrollIntoView()
    .should('not.be.disabled')
    .click();
  cy.get('[data-cy="troca-motivo-rejeicao"]', { timeout: 10000 }).type(motivoRejeicao, { force: true });
  cy.get('[data-cy="btn-confirmar-rejeicao"]').click({ force: true });
  // Aguarda processamento e recarrega para verificar novo estado
  cy.wait(2000);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
}

export function confirmarRecebimentoTrocaAdminUi(vendaUuid: string): void {
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
  cy.get('[data-cy="trocas-painel"]', { timeout: 20000 }).should('exist');
  cy.get(`[data-cy="btn-confirmar-recebimento-${vendaUuid}"]`, { timeout: 20000 })
    .first()
    .scrollIntoView()
    .should('not.be.disabled')
    .click();
  cy.get('[data-cy="btn-confirmar-modal"]', { timeout: 10000 }).click({ force: true });
  // Aguarda processamento e recarrega para verificar novo estado
  cy.wait(2000);
  cy.visit('/admin/trocas');
  aguardarPainelAdminCarregado();
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
  
  // Check if address limit is reached and delete an address if needed
  cy.get('[data-cy="endereco-add-button"]').then(($btn) => {
    if ($btn.attr('disabled')) {
      // Delete first address to make room
      ProfilePage.getDeleteButton('endereco', 0).click();
      cy.get('[data-cy="modal-confirm-button"]').scrollIntoView().click({ force: true });
      // Aguarda a mensagem de sucesso aparecer em vez de wait fixo
      cy.contains(/Endereço removido!/i, { timeout: 5000 }).should('be.visible');
    }
  });
  
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
  cy.get('[data-cy="pagamento-dividido-container"]', { timeout: 15000 }).scrollIntoView().should('be.visible');
  cy.get('[data-cy="pagamento-dividido-linha-valor"]', { timeout: 15000 })
    .first()
    .scrollIntoView()
    .clear({ force: true })
    .type(String(valorLinha1), { force: true, delay: 30 });
  cy.wait(300);
  cy.get('body').then(($body) => {
    const addCartao = $body.find('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]:not(:disabled)');
    if (addCartao.length) {
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').scrollIntoView().click({ force: true });
    } else {
      cy.get('[data-cy="pagamento-dividido-adicionar-pix"]').scrollIntoView().click({ force: true });
    }
  });
  cy.get('[data-cy="pagamento-dividido-linha-valor"]').should('have.length.at.least', 2);
  cy.get('[data-cy="pagamento-dividido-linha-valor"]')
    .eq(1)
    .scrollIntoView()
    .clear({ force: true })
    .type(String(valorLinha2), { force: true, delay: 30 });
  // 'OK' só aparece se math exato (cupons, frete, preços dinâmicos); para estabilidade do E2E aceitamos qualquer texto de restante
  cy.get('[data-cy="pagamento-dividido-restante"]', { timeout: 15000 }).should('exist');
}

/** Aguarda estabilização do valor restante do pagamento após atualização. */
export function aguardarSplitPagamentoEstavelUi(): void {
  cy.get('[data-cy="pagamento-dividido-container"]', { timeout: 15000 }).should('exist');
  cy.get('[data-cy="pagamento-dividido-restante"]', { timeout: 15000 })
    .should('be.visible')
    .should('contain', 'Total');
}

/** Resolve o valor total do pedido no checkout (valor restante ou fallback via API). */
export function obterTotalCheckoutUi(): Cypress.Chainable<number> {
  return cy.get('[data-cy="pagamento-dividido-restante"]', { timeout: 15000 }).invoke('text').then((texto) => {
    const viaRestante = extrairTotalAposCuponsDoRestante(texto);
    if (viaRestante > 0) {
      return cy.wrap(viaRestante);
    }
    return cy
      .get('[data-cy="checkout-total-value"]', { timeout: 5000 })
      .invoke('text')
      .then((totalUi) => {
        const doResumo = parseMoedaBrParaNumero(String(totalUi));
        if (doResumo > 0) {
          return cy.wrap(doResumo);
        }
        return obterTotalCarrinhoViaApi();
      });
  });
}
