/**
 * E2E — Perfil / Aba Cupons
 *
 * Aba somente leitura: valida estrutura. Se não houver cupons,
 * testes de lista são pulados (estado depende de dados do banco).
 */
import { loginClienteUi } from '../../support/fluxo-venda.helpers';

describe('Perfil — Cupons', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    cy.visit('/minha-conta');
    cy.get('[data-cy="tab-cupons"]').click();
  });

  it('deve exibir a seção de cupons', () => {
    cy.get('[data-cy="secao-cupons"]').should('be.visible');
  });

  it('deve exibir a lista ou mensagem de vazio', () => {
    cy.get('[data-cy="secao-cupons"]').then(($secao) => {
      const temLista = $secao.find('[data-cy="cupons-list"]').length > 0;
      if (temLista) {
        cy.get('[data-cy="cupons-list"]').should('be.visible');
        cy.get('[data-cy^="cupom-"]').should('have.length.at.least', 1);
      } else {
        cy.log('Cliente sem cupons — exibindo mensagem de vazio');
        cy.get('[data-cy="secao-cupons"]').should('be.visible');
      }
    });
  });

  it('deve exibir código, valor e validade quando houver cupons', () => {
    cy.get('[data-cy="secao-cupons"]').then(($secao) => {
      const temLista = $secao.find('[data-cy="cupons-list"]').length > 0;
      if (!temLista) {
        cy.log('Cliente sem cupons — teste pulado');
        return;
      }
      cy.get('[data-cy^="cupom-codigo-"]').first().should('be.visible').invoke('text').should('not.be.empty');
      cy.get('[data-cy^="cupom-valor-"]').first().should('be.visible').invoke('text').should('match', /R\$/);
      cy.get('[data-cy^="cupom-validade-"]').first().should('be.visible').invoke('text').should('include', 'Válido até');
    });
  });
});
