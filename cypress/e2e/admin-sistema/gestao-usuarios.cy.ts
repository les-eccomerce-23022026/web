/**
 * E2E — Admin Sistema: Gestão de Usuários
 *
 * Cenários cobertos:
 * 1. Cria um cliente via formulário de registro e o inativa pelo painel do admin sistema
 * 2. Cria um admin de loja pelo painel do admin sistema e o inativa em seguida
 */

const ADMIN_SISTEMA_EMAIL = 'admin@livraria.com.br';
const ADMIN_SISTEMA_SENHA = '@asdf123';
const SENHA_PADRAO = 'Teste@12345';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface IClienteFixture {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone: string;
}

interface IAdminLojaFixture {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
}

function gerarCliente(): IClienteFixture {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return {
    nome: `Cliente E2E ${seed}`,
    cpf: gerarCpfValido(seed),
    email: `cliente.e2e.${seed}@email.com`,
    senha: SENHA_PADRAO,
    telefone: '11944440099',
  };
}

function gerarAdminLoja(): IAdminLojaFixture {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return {
    nome: `Admin Loja E2E ${seed}`,
    cpf: gerarCpfValido(seed),
    email: `admin.loja.e2e.${seed}@email.com`,
    senha: SENHA_PADRAO,
  };
}

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

function registrarCliente(cliente: IClienteFixture): void {
  cy.visit('/minha-conta');
  cy.get('[data-cy="auth-show-register"]').click();

  cy.get('[data-cy="register-nome-input"]').clear().type(cliente.nome);
  cy.get('[data-cy="register-cpf-input"]').clear().type(cliente.cpf);
  cy.get('[data-cy="register-email-input"]').clear().type(cliente.email);
  cy.get('[data-cy="register-genero-select"]').select('Masculino');
  cy.get('[data-cy="register-nascimento-input"]').type('1995-06-15');

  cy.get('[data-cy="register-step1-next-button"]').click();

  cy.get('[data-cy="register-telefone-input"]').clear().type(cliente.telefone);
  cy.get('[data-cy="register-senha-input"]').clear().type(cliente.senha);
  cy.get('[data-cy="register-confirmar-senha-input"]').clear().type(cliente.senha);

  // Para cliente (não-admin), este botão é "Finalizar Cadastro" e já submete.
  cy.get('[data-cy="register-step2-next-button"]').click();

  cy.get('[data-cy="register-success-message"]', { timeout: 10000 }).should('be.visible');
}

function loginAdminSistema(): void {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').clear().type(ADMIN_SISTEMA_EMAIL);
  cy.get('[data-cy="login-password-input"]').clear().type(ADMIN_SISTEMA_SENHA);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.url({ timeout: 10000 }).should('include', '/admin');
  cy.get('[data-cy="dashboard-admin-sistema"]', { timeout: 10000 }).should('be.visible');
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Admin Sistema — Gestão de Usuários', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 1: Criar cliente e inativar pelo admin sistema
  // ─────────────────────────────────────────────────────────────────────────
  it('cria um cliente via registro público e o inativa pelo painel do admin sistema', () => {
    const cliente = gerarCliente();

    // Registrar cliente via formulário público
    registrarCliente(cliente);

    // Login como admin sistema
    loginAdminSistema();

    // Navegar para Gestão de Clientes
    cy.visit('/admin/clientes');
    cy.url().should('include', '/admin/clientes');

    // Interceptar a busca para aguardar o retorno da API (debounce 400ms + request)
    cy.intercept('GET', '**/clientes**').as('buscaClientes');

    // Buscar o cliente criado pelo nome (a busca filtra por nome; o e-mail é
    // exibido mascarado, então não serve para casar o card).
    cy.get('[data-cy="clientes-busca-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(cliente.nome);

    cy.wait('@buscaClientes', { timeout: 15000 });

    // Aguardar o card do cliente aparecer e clicar nele
    cy.contains('[data-cy^="cliente-card-"]', cliente.nome, { timeout: 10000 })
      .should('be.visible')
      .click();

    // Verificar que o painel de detalhes abriu e o cliente está ativo
    cy.get('[data-cy="cliente-toggle-status-btn"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Inativar cliente');

    // Clicar em inativar
    cy.get('[data-cy="cliente-toggle-status-btn"]').click();

    // Confirmar no modal
    cy.get('[data-cy="cliente-modal-overlay"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="cliente-modal-confirmar"]').should('be.visible').click();

    // Verificar que o botão agora diz "Reativar cliente" (status mudou)
    cy.get('[data-cy="cliente-toggle-status-btn"]', { timeout: 10000 })
      .should('contain.text', 'Reativar cliente');

    // Verificar badge de status Inativo no card
    cy.contains('[data-cy^="cliente-card-"]', cliente.nome)
      .should('contain.text', 'Inativo');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Cenário 2: Criar admin de loja pelo painel e inativar
  // ─────────────────────────────────────────────────────────────────────────
  it('cria um admin de loja pelo painel do admin sistema e o inativa em seguida', () => {
    const admin = gerarAdminLoja();

    // Login como admin sistema
    loginAdminSistema();

    // Navegar para Administradores de Lojas
    cy.visit('/admin/administradores');
    cy.url().should('include', '/admin/administradores');

    // Aguardar tabela carregar
    cy.get('[data-cy="admins-tabela-body"] tr', { timeout: 15000 }).should('have.length.gt', 0);

    // Clicar em Novo Administrador
    cy.get('[data-cy="admin-toolbar-action-0"]').should('be.visible').click();

    // Preencher o formulário de criação
    cy.get('[data-cy="admin-form-nome"]', { timeout: 5000 }).should('be.visible').clear().type(admin.nome);
    cy.get('[data-cy="admin-form-email"]').clear().type(admin.email);
    cy.get('[data-cy="admin-form-cpf"]').clear().type(admin.cpf);
    cy.get('[data-cy="admin-form-senha"]').clear().type(admin.senha);
    cy.get('[data-cy="admin-form-confirmar-senha"]').clear().type(admin.senha);

    // Confirmar criação (abre modal de confirmação)
    cy.get('[data-cy="admin-form-salvar"]').click();

    // Modal de confirmação de criação
    cy.get('[data-cy="admin-modal-salvar-confirmar"]', { timeout: 5000 })
      .should('be.visible')
      .click();

    // Aguardar o admin aparecer na tabela
    cy.get('[data-cy="admins-tabela-body"]', { timeout: 15000 })
      .contains('tr', admin.email)
      .should('be.visible')
      .and('contain.text', 'Ativo');

    // Buscar o admin criado para garantir que esteja na lista
    cy.get('[data-cy="admin-toolbar-search"]').clear().type(admin.email);

    // Clicar em Inativar na linha do admin criado
    cy.get('[data-cy="admins-tabela-body"]', { timeout: 10000 })
      .contains('tr', admin.email)
      .find(`[data-cy^="admin-row-toggle-"]`)
      .should('be.visible')
      .click();

    // Confirmar inativação no modal
    cy.get('[data-cy="modal-toggle-admin-confirmar"]', { timeout: 5000 })
      .should('be.visible')
      .click();

    // Verificar que o status mudou para Inativo
    cy.get('[data-cy="admins-tabela-body"]', { timeout: 10000 })
      .contains('tr', admin.email)
      .should('contain.text', 'Inativo');
  });
});
