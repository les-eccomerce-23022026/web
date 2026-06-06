// Comandos de autenticação Cypress

import {
  aplicarSessaoAuthCompletaNoBrowser,
  extrairTokenJwtLoginResponse,
  limparSessaoAuthBrowser,
} from '../helpers/checkoutHelpers';
import { getApiUrl, getAdminCredentials, getClienteCredentials } from './utils';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      autenticarViaApi(email: string, password: string): Chainable<void>;
      loginProgramatico(userType: 'admin' | 'cliente'): Chainable<void>;
      /** Sessão de cliente via API real (banco de testes) — uso em checkout e fluxos autenticados. */
      loginCliente(): Chainable<void>;
      /** Autenticação via API com credenciais de dados de teste. */
      autenticarClienteDadosTeste(): Chainable<void>;
      /** Autenticação via API com cache de sessão (cy.session) para otimização de performance. */
      autenticarClienteDadosTesteComCache(): Chainable<void>;
      /** Login admin via API para testes de painel */
      autenticarAdministradorViaApi(): Chainable<Cypress.Response<any>>;
      /** Login admin via API com cache de sessão (cy.session) para otimização de performance. */
      autenticarAdministradorViaApiComCache(): Chainable<void>;
      /** Aguarda GET /auth/me 200 após visit (sessão browser estabilizada). */
      aguardarSessaoBrowserViaAuthMe(opts?: { role?: 'admin' | 'cliente' }): Chainable<void>;
      /** Logout do usuário atual. */
      logout(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').type(email);
  cy.get('[data-cy="login-password-input"]').type(password);
  cy.get('[data-cy="login-submit-button"]').click();
});

Cypress.Commands.add('autenticarViaApi', (email: string, password: string) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: { email, password },
  }).then((response) => {
    const token = extrairTokenJwtLoginResponse(response);
    const user = response.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
  });
});

Cypress.Commands.add('loginProgramatico', (userType: 'admin' | 'cliente') => {
  if (userType === 'admin') {
    cy.autenticarAdministradorViaApi();
  } else {
    cy.autenticarClienteDadosTeste();
  }
});

Cypress.Commands.add('loginCliente', () => {
  const apiUrl = getApiUrl();
  const { email, senha } = getClienteCredentials();

  cy.session('session-cliente-teste', () => {
    limparSessaoAuthBrowser();
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email, senha },
    }).then((response) => {
      const token = extrairTokenJwtLoginResponse(response);
      const user = response.body?.dados?.user;
      aplicarSessaoAuthCompletaNoBrowser(user, token);
      if (token) {
        cy.log('[loginCliente] token JWT extraído e armazenado para chamadas API');
      }
    });
  });
  cy.visit('/');
});

Cypress.Commands.add('autenticarClienteDadosTeste', () => {
  const apiUrl = getApiUrl();
  const { email, senha } = getClienteCredentials();
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  limparSessaoAuthBrowser();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers,
    body: { email, senha },
    encoding: 'utf8',
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200 || !res.body?.dados?.user) {
      throw new Error(
        `Login seed falhou (${res.status}): ${JSON.stringify(res.body)} — rode o seed 005 no Postgres do backend.`
      );
    }
    const token = extrairTokenJwtLoginResponse(res);
    const user = res.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
  });
});

Cypress.Commands.add('autenticarClienteDadosTesteComCache', () => {
  const { email, senha } = getClienteCredentials();

  cy.session('session-cliente-cache', () => {
    cy.autenticarClienteDadosTeste();
  });
});

Cypress.Commands.add('autenticarAdministradorViaApi', () => {
  const apiUrl = getApiUrl();
  const { email, senha } = getAdminCredentials();

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'x-use-test-db': 'true'
    },
    body: { email, senha },
  }).then((response) => {
    const token = extrairTokenJwtLoginResponse(response);
    const user = response.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
    return response;
  });
});

Cypress.Commands.add('autenticarAdministradorViaApiComCache', () => {
  cy.session('session-admin-cache', () => {
    cy.autenticarAdministradorViaApi();
  });
});

Cypress.Commands.add('aguardarSessaoBrowserViaAuthMe', (opts = {}) => {
  const apiUrl = getApiUrl();
  const role = opts.role || 'cliente';
  cy.request({
    method: 'GET',
    url: `${apiUrl}/auth/me`,
    headers: { 'x-use-test-db': 'true' },
  }).then((response) => {
    expect(response.status).to.equal(200);
    const userRole = response.body?.dados?.user?.role;
    if (role === 'admin') {
      expect(userRole).to.equal('ADMIN');
    } else {
      expect(userRole).to.equal('CLIENTE');
    }
  });
});

Cypress.Commands.add('logout', () => {
  limparSessaoAuthBrowser();
  cy.clearCookies();
  cy.visit('/');
});
