/**
 * E2E — Perfil / Aba Dados Pessoais (RF0025)
 *
 * Campos não-críticos (nome/gênero/nascimento): salvam direto, sem modal.
 * Campos críticos (email/telefone): exigem modal de confirmação de senha.
 */
import { loginClienteUi, CLIENTE } from '../../support/fluxo-venda.helpers';

function navegarParaPerfil() {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-perfil"]').should('be.visible');
}

function salvar() {
  cy.get('[data-cy="perfil-save-button"]').click();
}

function salvarComSenha(senha = CLIENTE.senha) {
  salvar();
  cy.get('[data-cy="perfil-modal-password-input"]', { timeout: 5000 }).type(senha);
  cy.get('[data-cy="perfil-modal-confirm-button"]').click();
}

describe('Perfil — Dados Pessoais (RF0025)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    navegarParaPerfil();
  });

  it('deve exibir os campos pré-preenchidos com os dados do cliente', () => {
    cy.get('[data-cy="perfil-nome-input"]').should('not.have.value', '');
    cy.get('[data-cy="perfil-genero-select"]').should('not.have.value', '');
    cy.get('[data-cy="perfil-nascimento-input"]').should('not.have.value', '');
    cy.get('[data-cy="perfil-email-input"]').should('not.have.value', '');
    cy.get('[data-cy="perfil-cpf-input"]').should('have.attr', 'readonly');
  });

  it('deve atualizar o nome e salvar sem modal (campo não-crítico)', () => {
    cy.get('[data-cy="perfil-nome-input"]').invoke('val').then((nomeOriginal) => {
      const novoNome = 'Cliente Atualizado E2E';

      cy.get('[data-cy="perfil-nome-input"]').clear().type(novoNome);
      salvar();

      cy.get('[data-cy="perfil-success-message"]', { timeout: 8000 }).should('be.visible');

      // Reverter
      cy.get('[data-cy="perfil-nome-input"]').clear().type(String(nomeOriginal));
      salvar();
      cy.get('[data-cy="perfil-success-message"]', { timeout: 8000 }).should('be.visible');
    });
  });

  it('deve atualizar gênero e data de nascimento sem modal (campos não-críticos)', () => {
    cy.get('[data-cy="perfil-genero-select"]').invoke('val').then((generoOriginal) => {
      cy.get('[data-cy="perfil-nascimento-input"]').invoke('val').then((nascOriginal) => {
        cy.get('[data-cy="perfil-genero-select"]').select('Feminino');
        cy.get('[data-cy="perfil-nascimento-input"]').clear().type('1995-06-15');

        salvar();
        cy.get('[data-cy="perfil-success-message"]', { timeout: 8000 }).should('be.visible');

        // Reverter
        cy.get('[data-cy="perfil-genero-select"]').select(String(generoOriginal));
        cy.get('[data-cy="perfil-nascimento-input"]').clear().type(String(nascOriginal));
        salvar();
        cy.get('[data-cy="perfil-success-message"]', { timeout: 8000 }).should('be.visible');
      });
    });
  });

  it('deve abrir modal ao alterar telefone (campo crítico) e cancelar sem salvar', () => {
    cy.get('[data-cy="perfil-tel-input"]').invoke('val').then(() => {
      cy.get('[data-cy="perfil-tel-input"]').clear().type('11999999900');
      salvar();

      cy.get('[data-cy="perfil-modal-password-input"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-cy="perfil-modal-cancel-button"]').click();

      cy.get('[data-cy="perfil-modal-password-input"]').should('not.exist');
    });
  });

  it('deve rejeitar senha incorreta no modal ao alterar telefone', () => {
    cy.get('[data-cy="perfil-tel-input"]').clear().type('11988881234');
    salvarComSenha('senhaerrada999');

    // Modal permanece visível (ou exibe erro) — senha incorreta não fecha o modal
    cy.get('[data-cy="perfil-modal-confirm-button"]', { timeout: 5000 }).should('exist');
  });
});
