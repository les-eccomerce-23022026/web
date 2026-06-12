/**
 * E2E - Registro de Cliente
 *
 * Cobre:
 * 1. Preenchimento do wizard de cadastro (passo 1 e passo 2)
 * 2. Verificação da mensagem de sucesso após cadastro
 * 3. Login com as credenciais recém-criadas
 * 4. Verificação do estado autenticado no header
 * 5. Logout ao final
 */

describe('Registro de Cliente', () => {
  // Garante e-mail/CPF únicos por execução para não colidir com dados anteriores
  const ts = Date.now();
  const cliente = {
    nome: `Cypress Teste ${ts}`,
    cpf: gerarCpfValido(ts),
    email: `cypress.teste.${ts}@email.com`,
    senha: 'Cypress@123',
    telefone: '11987650001',
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('registra um novo cliente, confirma sucesso e loga com as credenciais criadas', () => {
    // ── 1. Abrir página de autenticação ──────────────────────────────────────
    cy.visit('/minha-conta');
    cy.get('[data-cy="auth-show-register"]').click();

    // ── 2. Passo 1 — Dados básicos ───────────────────────────────────────────
    cy.get('[data-cy="register-nome-input"]').clear().type(cliente.nome);
    cy.get('[data-cy="register-cpf-input"]').clear().type(cliente.cpf);
    cy.get('[data-cy="register-email-input"]').clear().type(cliente.email);
    cy.get('[data-cy="register-genero-select"]').select('Masculino');
    cy.get('[data-cy="register-nascimento-input"]').type('1995-03-20');

    cy.get('[data-cy="register-step1-next-button"]').click();

    // ── 3. Passo 2 — Contato e senha ─────────────────────────────────────────
    cy.get('[data-cy="register-telefone-input"]').clear().type(cliente.telefone);
    cy.get('[data-cy="register-senha-input"]').clear().type(cliente.senha);
    cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(cliente.senha);

    cy.get('[data-cy="register-step2-next-button"]').click();

    // ── 4. Verificar mensagem de sucesso ─────────────────────────────────────
    cy.get('[data-cy="register-success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', cliente.nome);

    // ── 5. Login com as credenciais recém-criadas ────────────────────────────
    cy.get('[data-cy="login-email-input"]').clear().type(cliente.email);
    cy.get('[data-cy="login-password-input"]').clear().type(cliente.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // ── 6. Verificar autenticação no header ──────────────────────────────────
    cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="header-logout-button"]').should('be.visible');

    // ── 7. Logout ────────────────────────────────────────────────────────────
    cy.get('[data-cy="header-logout-button"]').click();
    cy.get('[data-cy="header-login-link"]').should('be.visible');
  });

  it('registra um segundo cliente com dados distintos e confirma cadastro', () => {
    const ts2 = Date.now() + 1;
    const cliente2 = {
      nome: `Cypress Segunda ${ts2}`,
      cpf: gerarCpfValido(ts2 + 999),
      email: `cypress.segunda.${ts2}@email.com`,
      senha: 'Segunda@456',
      telefone: '21976540002',
    };

    cy.visit('/minha-conta');
    cy.get('[data-cy="auth-show-register"]').click();

    cy.get('[data-cy="register-nome-input"]').clear().type(cliente2.nome);
    cy.get('[data-cy="register-cpf-input"]').clear().type(cliente2.cpf);
    cy.get('[data-cy="register-email-input"]').clear().type(cliente2.email);
    cy.get('[data-cy="register-genero-select"]').select('Feminino');
    cy.get('[data-cy="register-nascimento-input"]').type('1998-07-10');

    cy.get('[data-cy="register-step1-next-button"]').click();

    cy.get('[data-cy="register-telefone-input"]').clear().type(cliente2.telefone);
    cy.get('[data-cy="register-senha-input"]').clear().type(cliente2.senha);
    cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(cliente2.senha);

    cy.get('[data-cy="register-step2-next-button"]').click();

    cy.get('[data-cy="register-success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', cliente2.nome);

    cy.get('[data-cy="login-email-input"]').clear().type(cliente2.email);
    cy.get('[data-cy="login-password-input"]').clear().type(cliente2.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="header-logout-button"]').click();
    cy.get('[data-cy="header-login-link"]').should('be.visible');
  });
});

/**
 * Gera um CPF numericamente válido a partir de uma semente.
 * Produz sempre 11 dígitos com dígitos verificadores corretos.
 */
function gerarCpfValido(seed: number): string {
  // 9 primeiros dígitos derivados do seed (nunca todos iguais)
  const base = String(seed).slice(-9).padStart(9, '1');
  const digits = base.split('').map(Number);

  // Primeiro dígito verificador
  let soma = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
  let resto = (soma * 10) % 11;
  const d1 = resto >= 10 ? 0 : resto;

  // Segundo dígito verificador
  soma = [...digits, d1].reduce((acc, d, i) => acc + d * (11 - i), 0);
  resto = (soma * 10) % 11;
  const d2 = resto >= 10 ? 0 : resto;

  return `${base}${d1}${d2}`;
}
