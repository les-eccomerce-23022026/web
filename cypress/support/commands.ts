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
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

export {};
