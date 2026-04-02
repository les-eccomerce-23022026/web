// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginProgramatico(userType: 'admin' | 'cliente'): Chainable<void>;
      /** Sessão de cliente via API real (banco de testes) — uso em checkout e fluxos autenticados. */
      loginCliente(): Chainable<void>;
      /** Login via API com credenciais de `Cypress.env('cliente')` (seed do banco de testes). */
      loginClienteSeed(): Chainable<void>;
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getNewUser(): Chainable<{ nome: string, cpf: string, email: string, senha: string }>;
    }
  }
}

/**
 * Gera um usuário dinâmico para testes de registro e perfil.
 */
/** CPFs com dígitos verificadores válidos (backend/README — cadastro de cliente). */
const CPFS_CADASTRO_VALIDOS = [
  '245.699.622-46',
  '019.364.721-47',
  '747.200.643-29',
  '371.568.753-37',
  '497.592.260-65',
  '283.323.987-46',
  '206.903.522-04',
  '824.477.504-12',
  '989.888.819-90',
  '267.905.031-29',
  '684.262.887-31',
  '802.563.243-10',
  '087.098.018-12',
  '707.848.056-28',
  '952.426.835-38',
];

Cypress.Commands.add('getNewUser', () => {
  const cpf = CPFS_CADASTRO_VALIDOS[Math.floor(Math.random() * CPFS_CADASTRO_VALIDOS.length)];
  return cy.wrap({
    nome: 'João Silva Teste',
    cpf,
    email: `teste.${Date.now()}.${Math.floor(Math.random() * 1000)}@email.com`,
    senha: 'StrongPass@2026',
  });
});

/**
 * Login via UI - Útil para testar o fluxo completo de login e feedbacks visuais.
 */
Cypress.Commands.add('loginCliente', () => {
  cy.loginProgramatico('cliente');
});

Cypress.Commands.add('loginClienteSeed', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  /** Mesmas credenciais do `005_seed_usuarios_teste.sql` (senha com Ç como U+00C7). */
  const email =
    (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
  const senha =
    (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: { email, senha },
    encoding: 'utf8',
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200 || !res.body?.dados?.user) {
      throw new Error(
        `Login seed falhou (${res.status}): ${JSON.stringify(res.body)} — rode o seed 005 no Postgres do backend.`,
      );
    }
  });
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
  // Aguarda o login ser processado
  cy.url().should('not.include', '/minha-conta');
});

/**
 * Registra um usuário dinamicamente via API e realiza o login programático.
 * Extremamente rápido e isola o estado entre os testes usando cy.session.
 * Sessão via cookie HttpOnly (mesma origem `apiUrl` = Vite + proxy).
 */
Cypress.Commands.add('loginProgramatico', (userType: 'admin' | 'cliente') => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  if (userType === 'cliente') {
    cy.getNewUser().then((newUser) => {
      cy.session(`session-cliente-${newUser.email}`, () => {
        // Passo 1: Registrar o cliente via API
        cy.request({
          method: 'POST',
          url: `${apiUrl}/clientes/registro`,
          headers: { 'x-use-test-db': 'true' },
          body: {
            nome: newUser.nome,
            cpf: newUser.cpf,
            email: newUser.email,
            senha: newUser.senha,
            confirmacaoSenha: newUser.senha,
            genero: 'Prefiro não informar',
            dataNascimento: '1990-01-01',
            telefone: { tipo: 'Celular', ddd: '11', numero: '999999999' }
          },
          failOnStatusCode: false
        }).then((registroResponse) => {
          if (registroResponse.status !== 201 && registroResponse.status !== 200) {
            throw new Error(`Falha no registro programático: ${registroResponse.body.mensagem || 'Erro desconhecido'}`);
          }

          // Passo 2: Login — cookie HttpOnly associado à origem do Vite
          cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/login`,
            headers: { 'x-use-test-db': 'true' },
            body: { email: newUser.email, senha: newUser.senha },
            failOnStatusCode: false
          }).then((loginResponse) => {
            if (loginResponse.status !== 200 || !loginResponse.body?.dados?.user) {
              throw new Error(`Falha no login programático (cliente): ${loginResponse.body?.mensagem || 'Erro desconhecido'}`);
            }
          });
        });
      }, {
        cacheAcrossSpecs: false
      });
    });
  } else {
    const user = Cypress.env('admin') || { email: 'admin@livraria.com.br', senha: 'Admin@123' };
    
    cy.session(`session-admin`, () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/bootstrap`,
        headers: { 'x-use-test-db': 'true' },
        failOnStatusCode: false
      }).then((bootstrapResponse) => {
        if (bootstrapResponse.status !== 200 && bootstrapResponse.status !== 201) {
          throw new Error(`Falha no bootstrap do admin: ${bootstrapResponse.body?.mensagem || 'Erro'}`);
        }

        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          headers: { 'x-use-test-db': 'true' },
          body: { email: user.email, senha: user.senha },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status !== 200 || !response.body?.dados?.user) {
            throw new Error(`Falha no login programático (admin): ${response.body?.mensagem || 'Erro desconhecido'}`);
          }
        });
      });
    }, {
      cacheAcrossSpecs: false
    });
  }
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});

export {};
