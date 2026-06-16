/**
 * E2E — Perfil / Aba Cupons
 *
 * Aba somente leitura: valida estrutura da lista e dados de cada item.
 */
import { loginClienteUi } from '../../support/fluxo-venda.helpers';

describe('Perfil — Cupons', () => {
  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    cy.visit('/minha-conta');
    cy.get('[data-cy="tab-cupons"]').click();
  });

  it('deve exibir a seção de cupons', () => {
    cy.get('[data-cy="secao-cupons"]').should('be.visible');
  });

  it('deve exibir a lista com ao menos um cupom', () => {
    cy.get('[data-cy="cupons-list"]').should('be.visible');
    cy.get('[data-cy^="cupom-"]').should('have.length.at.least', 1);
  });

  it('deve exibir código, valor e validade em cada cupom', () => {
    cy.get('[data-cy^="cupom-codigo-"]').first().should('be.visible').invoke('text').should('not.be.empty');
    cy.get('[data-cy^="cupom-valor-"]').first().should('be.visible').invoke('text').should('match', /R\$/);
    cy.get('[data-cy^="cupom-validade-"]').first().should('be.visible').invoke('text').should('include', 'Válido até');
  });
});
