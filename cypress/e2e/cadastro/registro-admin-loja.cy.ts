/**
 * E2E — Registro e Ciclo Completo do Administrador de Loja
 *
 * Fluxo coberto:
 * 1. Registro do admin de loja via wizard (3 passos: dados básicos → contato/senha → dados da loja)
 * 2. Verificação da mensagem de sucesso
 * 3. Login com as credenciais do admin de loja recém-criado
 * 4. Verificação do painel administrativo de loja
 * 5. Logout do admin de loja
 * 6. Login como admin_sistema
 * 7. Verificação do dashboard do admin_sistema (KPIs, menu específico)
 * 8. Navegação para Administradores de Lojas e inativação do admin criado
 * 9. Logout do admin_sistema
 */

const ADMIN_SISTEMA_EMAIL = 'admin@livraria.com.br';
const ADMIN_SISTEMA_SENHA = 'ASDF@asdf123';

describe('Registro e Ciclo do Administrador de Loja', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 1: Registro completo do admin de loja
  // ─────────────────────────────────────────────────────────────────────────
  it('registra um admin de loja com sucesso via wizard de 3 passos', () => {
    const admin = gerarAdminLoja();

    cy.visit('/minha-conta');
    cy.get('[data-cy="auth-show-register"]').click();

    // Passo 1 — Dados básicos (marcar checkbox de admin)
    cy.get('[data-cy="register-nome-input"]').clear().type(admin.nome);
    cy.get('[data-cy="register-cpf-input"]').clear().type(admin.cpf);
    cy.get('[data-cy="register-email-input"]').clear().type(admin.email);
    cy.get('[data-cy="register-genero-select"]').select('Masculino');
    cy.get('[data-cy="register-nascimento-input"]').type('1988-11-25');
    cy.get('[data-cy="register-admin-checkbox"]').check();

    cy.get('[data-cy="register-step1-next-button"]').click();

    // Passo 2 — Contato e senha
    cy.get('[data-cy="register-telefone-input"]').clear().type(admin.telefone);
    cy.get('[data-cy="register-senha-input"]').clear().type(admin.senha);
    cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(admin.senha);

    cy.get('[data-cy="register-step2-next-button"]').click();

    // Passo 3 — Dados da loja
    cy.get('[data-cy="register-tipo-pessoa-loja-select"]').select('Pessoa Jurídica (CNPJ)');
    cy.get('[data-cy="register-nome-fantasia-input"]').clear().type(admin.nomeFantasia);
    cy.get('[data-cy="register-cnpj-loja-input"]').clear().type(admin.cnpj);

    cy.get('[data-cy="register-submit-button"]').click();

    // Verificar mensagem de sucesso
    cy.get('[data-cy="register-success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', admin.nome);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 2: Login do admin de loja e verificação do painel
  // ─────────────────────────────────────────────────────────────────────────
  it('faz login com o admin de loja registrado e verifica o painel administrativo', () => {
    const admin = gerarAdminLoja();
    registrarAdminLoja(admin);

    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(admin.email);
    cy.get('[data-cy="login-password-input"]').clear().type(admin.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Deve redirecionar para /admin
    cy.url({ timeout: 10000 }).should('include', '/admin');

    // Verificar que está autenticado como admin de loja
    cy.get('[data-cy="header-user-profile"]').should('be.visible');
    cy.get('[data-cy="header-admin-link"]').should('be.visible');

    // Logout
    cy.get('[data-cy="header-logout-button"]').click({ force: true });
    cy.get('[data-cy="header-login-link"]').should('be.visible');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 3: Admin_sistema inativa o admin de loja criado
  // ─────────────────────────────────────────────────────────────────────────
  it('admin_sistema loga, inativa o admin de loja criado e depois faz logout', () => {
    const admin = gerarAdminLoja();
    registrarAdminLoja(admin);

    // Login como admin_sistema
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(ADMIN_SISTEMA_EMAIL);
    cy.get('[data-cy="login-password-input"]').clear().type(ADMIN_SISTEMA_SENHA);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url({ timeout: 10000 }).should('include', '/admin');

    // Verificar dashboard do admin_sistema
    cy.get('[data-cy="dashboard-admin-sistema"]', { timeout: 10000 }).should('be.visible');

    // Verificar KPIs presentes (cy.contains verifica DOM, não CSS transform)
    cy.contains('Total de Clientes').should('be.visible');
    cy.contains('Admins de Loja').should('be.visible');

    // Verificar menu restrito do admin_sistema
    cy.contains('Gestão de Clientes').should('be.visible');
    cy.contains('Administradores de Lojas').should('be.visible');
    cy.contains('Gestão de Catálogo').should('not.exist');

    // Navegar para Administradores de Lojas
    cy.contains('Administradores de Lojas').click();
    cy.url().should('include', '/admin/administradores');

    // Aguardar tabela carregar ao menos uma linha antes de buscar
    cy.get('[data-cy="admins-tabela-body"] tr', { timeout: 15000 }).should('have.length.gt', 0);

    // Buscar o admin de loja criado pelo e-mail
    cy.get('[data-cy="admin-toolbar-search"]').clear().type(admin.email);

    // Aguardar a linha aparecer (com folga para debounce de 300ms) e clicar em Inativar
    cy.get('[data-cy="admins-tabela-body"]', { timeout: 15000 })
      .contains('tr', admin.email)
      .find('button')
      .contains('Inativar')
      .click();

    // Confirmar no modal
    cy.get('[data-cy="modal-toggle-admin-confirmar"]', { timeout: 5000 })
      .should('be.visible')
      .click();

    // Verificar que o status mudou para Inativo
    cy.get('[data-cy="admins-tabela-body"]', { timeout: 10000 })
      .contains('tr', admin.email)
      .should('contain.text', 'Inativo');

    // Logout do admin_sistema
    cy.get('[data-cy="header-logout-button"]').click({ force: true });
    cy.get('[data-cy="header-login-link"]').should('be.visible');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 4: Fluxo completo encadeado
  // ─────────────────────────────────────────────────────────────────────────
  it('executa o fluxo completo: registro → login admin loja → logout → login admin_sistema → inativar → logout', () => {
    const admin = gerarAdminLoja();

    cy.visit('/minha-conta');
    cy.get('[data-cy="auth-show-register"]').click();

    // Passo 1
    cy.get('[data-cy="register-nome-input"]').clear().type(admin.nome);
    cy.get('[data-cy="register-cpf-input"]').clear().type(admin.cpf);
    cy.get('[data-cy="register-email-input"]').clear().type(admin.email);
    cy.get('[data-cy="register-genero-select"]').select('Feminino');
    cy.get('[data-cy="register-nascimento-input"]').type('1992-03-08');
    cy.get('[data-cy="register-admin-checkbox"]').check();
    cy.get('[data-cy="register-step1-next-button"]').click();

    // Passo 2
    cy.get('[data-cy="register-telefone-input"]').clear().type(admin.telefone);
    cy.get('[data-cy="register-senha-input"]').clear().type(admin.senha);
    cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(admin.senha);
    cy.get('[data-cy="register-step2-next-button"]').click();

    // Passo 3
    cy.get('[data-cy="register-tipo-pessoa-loja-select"]').select('Pessoa Jurídica (CNPJ)');
    cy.get('[data-cy="register-nome-fantasia-input"]').clear().type(admin.nomeFantasia);
    cy.get('[data-cy="register-cnpj-loja-input"]').clear().type(admin.cnpj);
    cy.get('[data-cy="register-submit-button"]').click();

    cy.get('[data-cy="register-success-message"]', { timeout: 10000 }).should('be.visible');

    // Login como admin de loja
    cy.get('[data-cy="login-email-input"]').clear().type(admin.email);
    cy.get('[data-cy="login-password-input"]').clear().type(admin.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url({ timeout: 10000 }).should('include', '/admin');
    cy.get('[data-cy="header-user-profile"]').should('be.visible');

    // Logout do admin de loja
    cy.get('[data-cy="header-logout-button"]').click({ force: true });
    cy.get('[data-cy="header-login-link"]').should('be.visible');

    // Login como admin_sistema
    cy.get('[data-cy="login-email-input"]').clear().type(ADMIN_SISTEMA_EMAIL);
    cy.get('[data-cy="login-password-input"]').clear().type(ADMIN_SISTEMA_SENHA);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.url({ timeout: 10000 }).should('include', '/admin');
    cy.get('[data-cy="dashboard-admin-sistema"]', { timeout: 10000 }).should('be.visible');

    // Inativar admin de loja
    cy.contains('Administradores de Lojas').click();
    cy.get('[data-cy="admins-tabela-body"] tr', { timeout: 15000 }).should('have.length.gt', 0);
    cy.get('[data-cy="admin-toolbar-search"]').clear().type(admin.email);

    cy.get('[data-cy="admins-tabela-body"]', { timeout: 15000 })
      .contains('tr', admin.email)
      .find('button')
      .contains('Inativar')
      .click();

    cy.get('[data-cy="modal-toggle-admin-confirmar"]').should('be.visible').click();

    cy.get('[data-cy="admins-tabela-body"]', { timeout: 10000 })
      .contains('tr', admin.email)
      .should('contain.text', 'Inativo');

    // Logout do admin_sistema
    cy.get('[data-cy="header-logout-button"]').click({ force: true });
    cy.get('[data-cy="header-login-link"]').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface IAdminLojaFixture {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone: string;
  nomeFantasia: string;
  cnpj: string;
}

/** Gera fixture único por chamada usando timestamp + random para evitar colisões. */
function gerarAdminLoja(): IAdminLojaFixture {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return {
    nome: `Admin Loja E2E ${seed}`,
    cpf: gerarCpfValido(seed),
    email: `admin.loja.e2e.${seed}@email.com`,
    senha: 'AdminLoja@E2E',
    telefone: '11955550099',
    nomeFantasia: `Livraria E2E ${seed}`,
    cnpj: gerarCnpjValido(seed),
  };
}

/** Registra um admin de loja via UI. */
function registrarAdminLoja(admin: IAdminLojaFixture): void {
  cy.visit('/minha-conta');
  cy.get('[data-cy="auth-show-register"]').click();

  cy.get('[data-cy="register-nome-input"]').clear().type(admin.nome);
  cy.get('[data-cy="register-cpf-input"]').clear().type(admin.cpf);
  cy.get('[data-cy="register-email-input"]').clear().type(admin.email);
  cy.get('[data-cy="register-genero-select"]').select('Masculino');
  cy.get('[data-cy="register-nascimento-input"]').type('1988-11-25');
  cy.get('[data-cy="register-admin-checkbox"]').check();
  cy.get('[data-cy="register-step1-next-button"]').click();

  cy.get('[data-cy="register-telefone-input"]').clear().type(admin.telefone);
  cy.get('[data-cy="register-senha-input"]').clear().type(admin.senha);
  cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(admin.senha);
  cy.get('[data-cy="register-step2-next-button"]').click();

  cy.get('[data-cy="register-tipo-pessoa-loja-select"]').select('Pessoa Jurídica (CNPJ)');
  cy.get('[data-cy="register-nome-fantasia-input"]').clear().type(admin.nomeFantasia);
  cy.get('[data-cy="register-cnpj-loja-input"]').clear().type(admin.cnpj);
  cy.get('[data-cy="register-submit-button"]').click();

  cy.get('[data-cy="register-success-message"]', { timeout: 10000 }).should('be.visible');
}

/** Gera CPF com dígitos verificadores válidos a partir de uma semente. */
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

/** Gera CNPJ com dígitos verificadores válidos a partir de uma semente. */
function gerarCnpjValido(seed: number): string {
  // 8 dígitos do seed + fixo "0001" = 12 dígitos base
  const corpo = String(seed).slice(-8).padStart(8, '1') + '0001';
  const digits = corpo.split('').map(Number);

  // Primeiro dígito verificador
  const peso1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = digits.reduce((acc, d, i) => acc + d * peso1[i], 0);
  let resto = soma % 11;
  const d1 = resto < 2 ? 0 : 11 - resto;

  // Segundo dígito verificador
  const peso2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = [...digits, d1].reduce((acc, d, i) => acc + d * peso2[i], 0);
  resto = soma % 11;
  const d2 = resto < 2 ? 0 : 11 - resto;

  return `${corpo}${d1}${d2}`;
}
