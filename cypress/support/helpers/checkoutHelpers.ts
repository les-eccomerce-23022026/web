/**
 * Helpers Robustos para Seleção Dinâmica de Elementos
 *
 * Este arquivo fornece funções auxiliares para seleção dinâmica de elementos
 * no checkout, reduzindo problemas de timing e flaky tests.
 */

import { getApiUrl } from '../commands/utils';

/** Slugs aceitos para loja padrão nos E2E (ordem de prioridade). */
export const SLUGS_LOJA_E2E = ['loja-padrao', 'livraria-teste', 'livraria-padrao'] as const;

const NOME_COOKIE_AUTH_PADRAO = 'les_token';
/** Espelha `authSessionStorage.ts` — sessão E2E no browser. */
export const SESSION_STORAGE_KEY_E2E = 'les_auth_session';

type RespostaLoginCypress = Cypress.Response<{
  token?: string;
  dados?: { token?: string; user?: unknown };
}>;

/**
 * Extrai JWT do corpo (NODE_ENV=test) ou do cookie HttpOnly (dev/E2E via proxy).
 */
export function extrairTokenJwtLoginResponse(res: RespostaLoginCypress): string | undefined {
  const bodyToken = res.body?.token ?? res.body?.dados?.token;
  if (bodyToken) {
    return bodyToken;
  }

  const raw = res.headers['set-cookie'];
  if (!raw) {
    return undefined;
  }

  const cookies = Array.isArray(raw) ? raw : [String(raw)];
  const cookieName =
    (Cypress.env('authCookieName') as string | undefined) ?? NOME_COOKIE_AUTH_PADRAO;

  for (const entry of cookies) {
    const match = entry.match(new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`));
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return undefined;
}

/** Persiste token para `apiHeadersBancoTestes()` / `Authorization`. */
export function armazenarTokenAuth(token: string | undefined): void {
  if (token) {
    Cypress.env('authToken', token);
  }
}

/** Remove cookies, sessionStorage e token Cypress de sessões anteriores (ex.: admin dev). */
export function limparSessaoAuthBrowser(): void {
  cy.clearCookies();
  cy.clearAllSessionStorage();
  Cypress.env('authToken', undefined);
}

/**
 * Sincroniza JWT no cookie jar do browser após login via cy.request.
 * Necessário porque cookies HttpOnly de sessões antigas (ex.: admin@livraria.com.br)
 * não são sobrescritos automaticamente se o login programático falhar silenciosamente.
 */
export function aplicarCookieAuthNoBrowser(token: string | undefined): void {
  if (!token) {
    return;
  }
  const cookieName =
    (Cypress.env('authCookieName') as string | undefined) ?? NOME_COOKIE_AUTH_PADRAO;
  cy.setCookie(cookieName, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });
  if (Cypress.env('injectTestDbHeader') === true) {
    cy.setCookie('x-use-test-db', 'true', { path: '/' });
  }
}

type UsuarioLoginE2e = {
  uuid?: string;
  email?: string;
  nome?: string;
  cpf?: string;
  role?: string;
  papeis?: string[];
  lojas?: unknown[];
  loja_uuid_principal?: string | null;
};

/**
 * Persiste user+token no sessionStorage para `restoreSession` usar quando
 * cookie HttpOnly não sincroniza via cy.request (Next.js dev + proxy).
 */
export function persistirSessaoAuthNoBrowser(user: UsuarioLoginE2e | undefined, token: string | undefined): void {
  if (!user?.uuid || !token) {
    return;
  }
  cy.window().then((win) => {
    const w = win as Window & { __USE_TEST_DB__?: boolean };
    if (Cypress.env('injectTestDbHeader') === true) {
      w.__USE_TEST_DB__ = true;
    }
    win.sessionStorage.setItem(
      SESSION_STORAGE_KEY_E2E,
      JSON.stringify({ user, token }),
    );
  });
}

/** Cookie + sessionStorage após login programático Cypress. */
export function aplicarSessaoAuthCompletaNoBrowser(
  user: UsuarioLoginE2e | undefined,
  token: string | undefined,
): void {
  armazenarTokenAuth(token);
  aplicarCookieAuthNoBrowser(token);
  persistirSessaoAuthNoBrowser(user, token);
}

/** Resolve UUID da loja E2E a partir da lista retornada por GET /admin/lojas. */
export function resolverUuidLojaPadraoNasLojas(
  lojas: Array<{ slug?: string; uuid?: string }> | undefined,
): string | undefined {
  if (!lojas?.length) {
    return undefined;
  }
  for (const slug of SLUGS_LOJA_E2E) {
    const loja = lojas.find((l) => l.slug === slug);
    if (loja?.uuid) {
      return loja.uuid;
    }
  }
  return lojas[0]?.uuid;
}

/**
 * Headers para requests autenticados com banco de testes
 * Inclui token JWT no header Authorization quando disponível (para chamadas API via cy.request)
 */
export function apiHeadersBancoTestes(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const authToken = Cypress.env('authToken') as string | undefined;
  const headers: Record<string, string> = {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
  // Incluir token no header Authorization para chamadas API subsequentes
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

/**
 * Headers de API com loja específica (multi-tenancy / UUID da loja).
 * O UUID deve ser fornecido explicitamente. Para testes que não especificam loja,
 * use o comando cy.obterLojaPadraoUuid() para buscar o UUID dinamicamente.
 */
export function apiHeadersBancoTestesComLoja(lojaUuid: string): Record<string, string> {
  const headers = { ...apiHeadersBancoTestes() };
  headers['x-loja-uuid'] = lojaUuid;
  return headers;
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
  const apiUrl = getApiUrl();
  return cy.request<PagamentoInfoResponse>({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers: apiHeadersBancoTestes(),
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
 * Lock: aguarda elemento estar estável e clicável antes de interagir
 */
export function clicarElementoSeguro(seletor: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 10000;
  
  cy.get(seletor, { timeout })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .scrollIntoView()
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
 * Lock: aguarda campo estar estável antes de digitar
 */
export function preencherCampoSeguro(seletor: string, valor: string, options?: { timeout?: number }) {
  const timeout = options?.timeout || 10000;
  
  cy.get(seletor, { timeout })
    .should('exist')
    .should('be.visible')
    .scrollIntoView()
    .clear()
    .type(valor, { delay: 50 });
}

/**
 * Valida se o texto do restante contém "OK"
 * Considera o novo formato: "Total após cupoms: R$ X · Soma das linhas: R$ Y · OK"
 */
export function validarRestanteOk() {
  cy.get('[data-cy="pagamento-dividido-restante"]')
    .should('contain', 'OK');
}

/**
 * Valida se o texto do restante indica ajuste
 * Considera o novo formato: "Total após cupoms: R$ X · Soma das linhas: R$ Y · Ajuste de R$ Z"
 */
export function validarRestanteAjuste() {
  cy.get('[data-cy="pagamento-dividido-restante"]')
    .should('contain', 'Ajuste');
}

/** Converte texto monetário BR (ex.: "R$ 123,45") em número. */
export function parseMoedaBrParaNumero(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim();
  if (!limpo) return 0;
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;
  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? n : 0;
}

/** Extrai o total após cupons do texto E2E em `checkout-split-restante`. */
export function extrairTotalAposCuponsDoRestante(texto: string): number {
  const m = texto.match(/Total[^R]*R\$\s*([\d.,]+)/i);
  return m ? parseMoedaBrParaNumero(m[1]) : 0;
}

/**
 * Obtém o valor total do carrinho via API
 */
export function obterTotalCarrinhoViaApi() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/carrinho`,
    headers: apiHeadersBancoTestes(),
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
      ...apiHeadersBancoTestes(),
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
