/**
 * Helpers Robustos para Seleção Dinâmica de Elementos
 * 
 * Este arquivo fornece funções auxiliares para seleção dinâmica de elementos
 * no checkout, reduzindo problemas de timing e flaky tests.
 */

/**
 * Headers para requests autenticados com banco de testes
 */
export function apiHeadersTestDb(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

/**
 * Interface para cartão do cliente
 */
interface CartaoCliente {
  ultimosDigitosCartao: string;
  bandeira: string;
  uuid: string;
}

/**
 * Interface para resposta de pagamento info
 */
interface PagamentoInfoResponse {
  enderecosCliente: unknown[];
  cartoesCliente: CartaoCliente[];
}

/**
 * Obtém cartões do cliente via API para seleção dinâmica no checkout
 */
export function obterCartoesCliente() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  return cy.request<PagamentoInfoResponse>({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers: apiHeadersTestDb(),
  }).its('body.cartoesCliente');
}

/**
 * Seleciona o primeiro cartão disponível do cliente no checkout
 * Usa scrollIntoView e force:true para garantir que o clique funcione
 */
export function selecionarPrimeiroCartaoCheckout() {
  obterCartoesCliente()
    .should('be.an', 'array')
    .should('have.length.at.least', 1)
    .then((cartoes) => {
      const primeiro = cartoes[0];
      cy.get(`[data-cy="checkout-card-item-${primeiro.ultimosDigitosCartao}"]`)
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
    });
}

/**
 * Seleciona um cartão específico por últimos dígitos
 */
export function selecionarCartaoPorUltimosDigitos(ultimosDigitos: string) {
  cy.get(`[data-cy="checkout-card-item-${ultimosDigitos}"]`)
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
}

/**
 * Clica em um elemento com retry e scrollIntoView
 * Reduz flaky tests devido a problemas de timing
 */
export function clicarElementoSeguro(seletor: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 10000;
  
  cy.get(seletor, { timeout })
    .should('exist')
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });
}

/**
 * Aguarda um elemento estar visível e clicável
 */
export function aguardarElementoClicavel(seletor: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 10000;
  
  cy.get(seletor, { timeout })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled');
}

/**
 * Preenche um campo de input com retry
 */
export function preencherCampoSeguro(seletor: string, valor: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 10000;
  
  cy.get(seletor, { timeout })
    .should('exist')
    .should('be.visible')
    .scrollIntoView()
    .clear()
    .type(valor);
}

/**
 * Valida se o texto do restante contém "OK"
 * Considera o novo formato: "Total após cupoms: R$ X · Soma das linhas: R$ Y · OK"
 */
export function validarRestanteOk() {
  cy.get('[data-cy="checkout-split-restante"]')
    .should('contain', 'OK');
}

/**
 * Valida se o texto do restante indica ajuste
 * Considera o novo formato: "Total após cupoms: R$ X · Soma das linhas: R$ Y · Ajuste de R$ Z"
 */
export function validarRestanteAjuste() {
  cy.get('[data-cy="checkout-split-restante"]')
    .should('contain', 'Ajuste');
}

/**
 * Obtém o valor total do carrinho via API
 */
export function obterTotalCarrinhoApi() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/carrinho`,
    headers: apiHeadersTestDb(),
  }).its('body.resumo.total');
}

/**
 * Cria um usuário novo via API para testes
 */
export function criarUsuarioTeste() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const timestamp = Date.now();
  const email = `testuser${timestamp}@email.com`;
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/clientes/registro`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...apiHeadersTestDb(),
    },
    body: {
      nome: `Test User ${timestamp}`,
      cpf: '111.111.111-11',
      email,
      senha: '@asdfJKLÇ123',
      confirmacaoSenha: '@asdfJKLÇ123',
      genero: 'Prefiro não informar',
      dataNascimento: '1990-01-01',
      telefone: { tipo: 'Celular', ddd: '11', numero: '999999999' },
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    return { email, senha: '@asdfJKLÇ123' };
  });
}
