/**
 * E2E — Perfil / Aba Cartões (RF0027)
 *
 * Fluxo: cliente adiciona cartão, marca como preferencial e remove.
 * Delete de cartão e endereço exigem confirmação em modal genérico.
 */
import { loginClienteUi } from '../../support/fluxo-venda.helpers';

function irParaCartoes() {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-cartoes"]').click();
}

describe('Perfil — Cartões (RF0027)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    irParaCartoes();
  });

  it('deve exibir cartões existentes', () => {
    cy.get('[data-cy^="cartao-card-"]').should('have.length.at.least', 1);
  });

  it('deve abrir o formulário de novo cartão ao clicar no botão', () => {
    cy.get('[data-cy="cartao-add-button"]').click();
    cy.get('[data-cy="cartao-form-panel"]').should('be.visible');
    cy.get('[data-cy="cartao-numero-input"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="cartao-nome-input"]').should('be.visible');
    cy.get('[data-cy="cartao-bandeira-select"]').should('be.visible');
    cy.get('[data-cy="cartao-validade-input"]').should('be.visible');
    cy.get('[data-cy="cartao-cvv-input"]').should('be.visible');
  });

  it('deve cancelar o formulário sem salvar', () => {
    cy.get('[data-cy="cartao-add-button"]').click();
    cy.get('[data-cy="cartao-form-panel"]').should('be.visible');
    cy.get('[data-cy="cartao-numero-input"]').scrollIntoView().type('4111111111111111');
    cy.get('[data-cy="cartao-cancel-button"]').scrollIntoView().click();
    cy.get('[data-cy="cartao-form-panel"]').should('not.exist');
  });

  it('deve adicionar um novo cartão Visa e removê-lo com confirmação', () => {
    cy.get('[data-cy^="cartao-card-"]').its('length').then((qtdAntes) => {
      cy.get('[data-cy="cartao-add-button"]').click();
      cy.get('[data-cy="cartao-numero-input"]').scrollIntoView().type('4111111111111111');
      cy.get('[data-cy="cartao-nome-input"]').type('CLIENTE TESTE E2E');
      cy.get('[data-cy="cartao-bandeira-select"]').select('Visa');
      cy.get('[data-cy="cartao-validade-input"]').type('12/2030');
      cy.get('[data-cy="cartao-cvv-input"]').type('123');
      cy.get('[data-cy="cartao-submit-button"]').scrollIntoView().click();

      cy.get('[data-cy="cartao-form-panel"]', { timeout: 8000 }).should('not.exist');
      cy.get('[data-cy^="cartao-card-"]').should('have.length', qtdAntes + 1);

      // Limpeza: remover o cartão recém-adicionado + confirmar modal
      cy.get('[data-cy^="cartao-card-"]').last().find('[data-cy^="cartao-delete-button-"]').click({ force: true });
      cy.get('[data-cy="modal-confirm-button"]', { timeout: 5000 }).click();
      cy.get('[data-cy^="cartao-card-"]', { timeout: 8000 }).should('have.length', qtdAntes);
    });
  });

  it('deve marcar outro cartão como preferencial', () => {
    cy.get('[data-cy^="cartao-card-"]').then(($cards) => {
      if ($cards.length < 2) {
        cy.log('Apenas 1 cartão — pulando teste de troca de preferencial');
        return;
      }

      cy.get('[data-cy^="cartao-card-"]').not(':has([data-cy="cartao-preferencial-badge"])').first().within(() => {
        cy.get('[data-cy^="cartao-preferencial-button-"]').click();
      });

      cy.get('[data-cy="cartao-preferencial-badge"]').should('have.length', 1);
    });
  });
});
