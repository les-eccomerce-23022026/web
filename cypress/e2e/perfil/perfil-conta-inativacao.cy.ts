/**
 * E2E — Perfil / Aba Conta — Inativação (RF0023)
 *
 * Cria um cliente descartável via API, faz login como esse cliente,
 * solicita exclusão da conta e confirma o modal.
 * O cliente criado é descartável — a inativação é a limpeza.
 */

const API = Cypress.env('apiUrl') ?? 'http://localhost:3001/api';

function gerarCpfValido(seed: number): string {
  const base = String(seed).slice(-9).padStart(9, '1');
  const digits = base.split('').map(Number);
  let soma = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
  let resto = (soma * 10) % 11;
  const d1 = resto >= 10 ? 0 : resto;
  soma = [...digits, d1].reduce((acc, d, i) => acc + d * (11 - i), 0);
  resto = (soma * 10) % 11;
  const d2 = resto >= 10 ? 0 : resto;
  return `${base}${d1}${d2}`;
}

function criarClienteDescartavel(): Cypress.Chainable<{ email: string; senha: string }> {
  const seed = Date.now() + Math.floor(Math.random() * 99999);
  const cliente = {
    nome: `Descartável E2E ${seed}`,
    cpf: gerarCpfValido(seed),
    email: `descartavel.${seed}@e2e.com`,
    senha: 'Descart@2026',
    confirmacaoSenha: 'Descart@2026',
    nascimento: '1995-05-10',
    genero: 'Outro',
    telefone: '11988887777',
  };

  return cy
    .request({
      method: 'POST',
      url: `${API}/clientes/registro`,
      headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: cliente,
    })
    .then(() => ({ email: cliente.email, senha: cliente.senha }));
}

function loginUi(email: string, senha: string) {
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').clear().type(email);
  cy.get('[data-cy="login-password-input"]').clear().type(senha);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
}

describe('Perfil — Inativação de Conta (RF0023)', () => {
  it('deve criar cliente, logar, solicitar exclusão e confirmar no modal', () => {
    criarClienteDescartavel().then(({ email, senha }) => {
      cy.clearCookies();
      cy.clearLocalStorage();

      loginUi(email, senha);

      cy.visit('/minha-conta');
      cy.get('[data-cy="tab-perigo"]').should('be.visible').click();

      cy.get('[data-cy="inativar-conta-button"]').should('be.visible').click();

      // Modal de confirmação
      cy.get('[data-cy="modal-confirm-button"]', { timeout: 5000 }).should('be.visible').click();

      // Após inativação: redirecionado para login ou header sem perfil
      cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="header-login-link"]').should('be.visible');
    });
  });

  it('deve cancelar a exclusão no modal sem inativar a conta', () => {
    criarClienteDescartavel().then(({ email, senha }) => {
      cy.clearCookies();
      cy.clearLocalStorage();

      loginUi(email, senha);

      cy.visit('/minha-conta');
      cy.get('[data-cy="tab-perigo"]').click();
      cy.get('[data-cy="inativar-conta-button"]').click();

      cy.get('[data-cy="modal-cancel-button"]', { timeout: 5000 }).click();

      // Permanece logado
      cy.get('[data-cy="header-user-profile"]').should('be.visible');
      cy.get('[data-cy="tab-perigo"]').should('be.visible');

      // Limpeza: inativar via API
      cy.request({
        method: 'POST',
        url: `${API}/auth/login`,
        headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
        body: { email, senha },
      }).then((r) => {
        const token = r.body.dados.token;
        cy.request({
          method: 'DELETE',
          url: `${API}/clientes/perfil`,
          headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
          failOnStatusCode: false,
        });
      });
    });
  });
});
