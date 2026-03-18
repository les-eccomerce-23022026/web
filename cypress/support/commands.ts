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
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/**
 * Login via UI - Útil para testar o fluxo completo de login e feedbacks visuais.
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
  // Aguarda o login ser processado
  cy.url().should('not.include', '/minha-conta');
});

/**
 * Login Programático via API - Injeta o token diretamente no sessionStorage.
 * Extremamente rápido e isola o estado entre os testes usando cy.session.
 */
Cypress.Commands.add('loginProgramatico', (userType: 'admin' | 'cliente') => {
  const user = Cypress.env(userType);
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';

  cy.session(`session-${userType}`, () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'x-use-test-db': 'true'
      },
      body: {
        email: user.email,
        senha: user.senha
      },
      failOnStatusCode: false
    }).then((response) => {
      // Caso falhe por algum motivo (ex: backend fora), logamos e deixamos o Cypress lidar
      if (response.status !== 200) {
        throw new Error(`Falha no login programático (${userType}): ${response.body.mensagem || 'Erro desconhecido'}`);
      }

      const { token, user: userData } = response.body.dados;
      
      // Persistência compatível com o authSlice.ts do seu frontend
      window.sessionStorage.setItem('les_auth_session', JSON.stringify({
        token,
        user: userData
      }));
    });
  }, {
    cacheAcrossSpecs: false // Mantém sessões isoladas para cada spec file
  });
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});

export {};
