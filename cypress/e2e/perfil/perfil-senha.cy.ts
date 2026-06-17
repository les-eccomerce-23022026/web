/**
 * E2E — Perfil / Aba Senha (RF0028)
 *
 * Usa um cliente descartável criado via API para cada suite,
 * evitando que alterações de senha contaminem a conta permanente de testes.
 */

const API = Cypress.env('apiUrl') ?? 'http://localhost:3002/api';
const SENHA_ORIGINAL = 'ASDF@asdf123';
const SENHA_NOVA = 'NovaSenha@2026';

function gerarCpfValido(seed: number): string {
  const raw = String(Math.abs(seed % 1000000000)).padStart(9, '0');
  const digits = raw.split('').map(Number);
  if (new Set(digits).size === 1) digits[8] = (digits[8] + 1) % 10;

  const soma1 = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
  const d1 = (soma1 * 10) % 11 >= 10 ? 0 : (soma1 * 10) % 11;

  const base2 = [...digits, d1];
  const soma2 = base2.reduce((acc, d, i) => acc + d * (11 - i), 0);
  const d2 = (soma2 * 10) % 11 >= 10 ? 0 : (soma2 * 10) % 11;

  return `${digits.join('')}${d1}${d2}`;
}

function criarClienteDescartavel(): Cypress.Chainable<{ email: string; senha: string }> {
  const seed = Date.now() + Math.floor(Math.random() * 99999);
  const cliente = {
    nome: `Descartável Senha ${seed}`,
    cpf: gerarCpfValido(seed),
    email: `senha.${seed}@e2e.com`,
    senha: SENHA_ORIGINAL,
    confirmacaoSenha: SENHA_ORIGINAL,
    dataNascimento: '1995-05-10',
    genero: 'Masculino',
    telefone: { tipo: 'Celular', numero: '11988887777' },
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
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').clear().type(email);
  cy.get('[data-cy="login-password-input"]').clear().type(senha);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
}

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

function reverterSenhaViaApi(email: string, senhaAtual: string, senhaOriginal: string) {
  cy.request({
    method: 'POST',
    url: `${API}/auth/login`,
    headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
    body: { email, senha: senhaAtual },
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
  let clienteEmail: string;
  let clienteSenhaAtual: string;

  before(() => {
    criarClienteDescartavel().then(({ email, senha }) => {
      clienteEmail = email;
      clienteSenhaAtual = senha;
    });
  });

  beforeEach(() => {
    loginUi(clienteEmail, clienteSenhaAtual);
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
    alterarSenha(clienteSenhaAtual, SENHA_NOVA);
    cy.get('[data-cy="senha-success-message"]', { timeout: 8000 }).should('be.visible');

    reverterSenhaViaApi(clienteEmail, SENHA_NOVA, clienteSenhaAtual);
  });
});
