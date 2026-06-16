/**
 * E2E — Perfil / Aba Senha (RF0028)
 *
 * Fluxo: cliente altera a senha e volta para a original.
 * O revert é feito via API para garantir consistência entre testes.
 */
import { loginClienteUi, CLIENTE } from '../../support/fluxo-venda.helpers';

const API = Cypress.env('apiUrl') ?? 'http://localhost:3001/api';
const SENHA_NOVA = 'NovaSenha@2026';

function irParaSenha() {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-senha"]').click();
}

function alterarSenha(senhaAtual: string, novaSenha: string) {
  cy.get('[data-cy="senha-atual-input"]').clear().type(senhaAtual);
  cy.get('[data-cy="nova-senha-input"]').clear().type(novaSenha);
  cy.get('[data-cy="confirmar-nova-senha-input"]').clear().type(novaSenha);
  cy.get('[data-cy="senha-submit-button"]').click();
}

function reverterSenhaViaApi(senhaAtual: string, senhaOriginal: string) {
  cy.request({
    method: 'POST',
    url: `${API}/auth/login`,
    headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
    body: { email: CLIENTE.email, senha: senhaAtual },
    failOnStatusCode: false,
  }).then((loginRes) => {
    if (loginRes.status !== 200) return;
    const token = loginRes.body.dados.token;
    cy.request({
      method: 'PATCH',
      url: `${API}/clientes/seguranca/alterar-senha`,
      headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: { senhaAtual, novaSenha: senhaOriginal, confirmacaoNovaSenha: senhaOriginal },
      failOnStatusCode: false,
    });
  });
}

describe('Perfil — Senha (RF0028)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    irParaSenha();
  });

  it('deve exibir os campos de alteração de senha', () => {
    cy.get('[data-cy="senha-atual-input"]').should('be.visible');
    cy.get('[data-cy="nova-senha-input"]').should('be.visible');
    cy.get('[data-cy="confirmar-nova-senha-input"]').should('be.visible');
    cy.get('[data-cy="senha-submit-button"]').should('be.visible');
  });

  it('deve mostrar/ocultar a senha atual com o toggle', () => {
    cy.get('[data-cy="senha-atual-input"]').should('have.attr', 'type', 'password');
    cy.get('[data-cy="senha-atual-toggle"]').click();
    cy.get('[data-cy="senha-atual-input"]').should('have.attr', 'type', 'text');
    cy.get('[data-cy="senha-atual-toggle"]').click();
    cy.get('[data-cy="senha-atual-input"]').should('have.attr', 'type', 'password');
  });

  it('deve exibir erro ao informar senha atual incorreta', () => {
    alterarSenha('senhaerrada999', SENHA_NOVA);
    cy.get('[data-cy="senha-error-message"]', { timeout: 8000 }).should('be.visible');
  });

  it('deve alterar a senha com sucesso e reverter via API', () => {
    alterarSenha(CLIENTE.senha, SENHA_NOVA);
    cy.get('[data-cy="senha-success-message"]', { timeout: 8000 }).should('be.visible');

    // Revert confiável via API (garante que a senha original seja restaurada)
    reverterSenhaViaApi(SENHA_NOVA, CLIENTE.senha);
  });
});
