/**
 * E2E — Perfil / Aba Dados Pessoais (RF0025)
 *
 * Fluxo: cliente atualiza nome, gênero, nascimento e telefone.
 * Salvar exige confirmação de senha via modal.
 * O teste reverte as alterações ao final para não poluir o seed.
 */
import { loginClienteUi, CLIENTE } from '../../support/fluxo-venda.helpers';

const API = Cypress.env('apiUrl') ?? 'http://localhost:3001/api';

function navegarParaPerfil() {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-perfil"]').should('be.visible');
}

function salvarComSenha(senha = CLIENTE.senha) {
  cy.get('[data-cy="perfil-save-button"]').click();
  cy.get('[data-cy="perfil-modal-password-input"]').type(senha);
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
    cy.get('[data-cy="perfil-cpf-input"]').should('be.disabled');
  });

  it('deve atualizar o nome e salvar via modal de confirmação', () => {
    cy.get('[data-cy="perfil-nome-input"]').invoke('val').then((nomeOriginal) => {
      const novoNome = 'Cliente Atualizado E2E';

      cy.get('[data-cy="perfil-nome-input"]').clear().type(novoNome);
      salvarComSenha();

      cy.get('[data-cy="perfil-nome-input"]', { timeout: 8000 }).should('have.value', novoNome);

      // Reverter
      cy.get('[data-cy="perfil-nome-input"]').clear().type(String(nomeOriginal));
      salvarComSenha();
    });
  });

  it('deve atualizar gênero e data de nascimento', () => {
    cy.get('[data-cy="perfil-genero-select"]').invoke('val').then((generoOriginal) => {
      cy.get('[data-cy="perfil-nascimento-input"]').invoke('val').then((nascOriginal) => {
        cy.get('[data-cy="perfil-genero-select"]').select('Feminino');
        cy.get('[data-cy="perfil-nascimento-input"]').clear().type('1995-06-15');

        salvarComSenha();
        cy.get('[data-cy="perfil-genero-select"]', { timeout: 8000 }).should('have.value', 'Feminino');

        // Reverter
        cy.get('[data-cy="perfil-genero-select"]').select(String(generoOriginal));
        cy.get('[data-cy="perfil-nascimento-input"]').clear().type(String(nascOriginal));
        salvarComSenha();
      });
    });
  });

  it('deve cancelar o modal sem salvar', () => {
    cy.get('[data-cy="perfil-nome-input"]').invoke('val').then((nomeOriginal) => {
      cy.get('[data-cy="perfil-nome-input"]').clear().type('Nome Cancelado');
      cy.get('[data-cy="perfil-save-button"]').click();
      cy.get('[data-cy="perfil-modal-cancel-button"]').click();

      // Campo mantém o valor digitado mas não foi salvo no servidor
      cy.get('[data-cy="perfil-modal-password-input"]').should('not.exist');

      // Reverter campo para original sem salvar
      cy.get('[data-cy="perfil-nome-input"]').clear().type(String(nomeOriginal));
    });
  });

  it('deve rejeitar senha incorreta no modal de confirmação', () => {
    cy.get('[data-cy="perfil-nome-input"]').clear().type('Nome Com Senha Errada');
    salvarComSenha('senhaerrada123');

    // Modal permanece visível ou exibe erro
    cy.get('[data-cy="perfil-modal-confirm-button"]', { timeout: 5000 })
      .should('exist');
  });
});
