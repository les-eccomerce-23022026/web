/**
 * E2E — Perfil / Aba Endereços (RF0026)
 *
 * Fluxo: cliente adiciona, edita e remove endereço.
 * Setup via API garante estado limpo antes de cada teste.
 */
import { loginClienteUi, CLIENTE } from '../../support/fluxo-venda.helpers';

const API = Cypress.env('apiUrl') ?? 'http://localhost:3001/api';

const ENDERECO_TESTE = {
  apelido: 'E2E Perfil',
  logradouro: 'Rua dos Testes',
  numero: '42',
  complemento: 'Apto 1',
  bairro: 'Centro',
  cep: '01310-100',
  cidade: 'São Paulo',
  estado: 'SP',
};

function loginApi(): Cypress.Chainable<string> {
  return cy
    .request({
      method: 'POST',
      url: `${API}/auth/login`,
      headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: { email: CLIENTE.email, senha: CLIENTE.senha },
    })
    .then((r) => r.body.dados.token as string);
}

function limparEnderecoTeste(token: string) {
  cy.request({
    method: 'GET',
    url: `${API}/clientes/perfil`,
    headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
  }).then((r) => {
    const enderecos: Array<{ uuid: string; apelido: string }> = r.body.dados?.enderecos ?? [];
    enderecos
      .filter((e) => e.apelido === ENDERECO_TESTE.apelido)
      .forEach((e) =>
        cy.request({
          method: 'DELETE',
          url: `${API}/clientes/perfil/enderecos/${e.uuid}`,
          headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
          failOnStatusCode: false,
        }),
      );
  });
}

function irParaAbas() {
  cy.visit('/minha-conta');
  cy.get('[data-cy="tab-enderecos"]').click();
}

function preencherFormEndereco(end = ENDERECO_TESTE) {
  cy.get('[data-cy="endereco-apelido-input"]').clear().type(end.apelido);
  cy.get('[data-cy="endereco-logradouro-input"]').clear().type(end.logradouro);
  cy.get('[data-cy="endereco-numero-input"]').clear().type(end.numero);
  cy.get('[data-cy="endereco-complemento-input"]').clear().type(end.complemento);
  cy.get('[data-cy="endereco-bairro-input"]').clear().type(end.bairro);
  cy.get('[data-cy="endereco-cep-input"]').clear().type(end.cep);
  cy.get('[data-cy="endereco-cidade-input"]').clear().type(end.cidade);
  cy.get('[data-cy="endereco-estado-input"]').clear().type(end.estado);
}

describe('Perfil — Endereços (RF0026)', () => {
  let token: string;

  before(() => {
    loginApi().then((t) => {
      token = t;
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    limparEnderecoTeste(token);
    loginClienteUi();
    irParaAbas();
  });

  after(() => {
    loginApi().then((t) => limparEnderecoTeste(t));
  });

  it('deve exibir endereços existentes com apelido e logradouro', () => {
    cy.get('[data-cy^="endereco-card-"]').first().within(() => {
      cy.get('[data-cy^="endereco-apelido-"]').should('be.visible');
    });
  });

  it('deve adicionar um novo endereço e exibi-lo na lista', () => {
    cy.get('[data-cy="endereco-add-button"]').click();
    cy.get('[data-cy="endereco-form-panel"]').should('be.visible');

    preencherFormEndereco();
    cy.get('[data-cy="endereco-submit-button"]').scrollIntoView().click();

    cy.get('[data-cy="endereco-form-panel"]', { timeout: 8000 }).should('not.exist');
    cy.contains('[data-cy^="endereco-card-"]', ENDERECO_TESTE.apelido).should('be.visible');
  });

  it('deve editar o endereço adicionado e salvar', () => {
    // Adicionar via API para isolar
    cy.request({
      method: 'POST',
      url: `${API}/clientes/perfil/enderecos`,
      headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: {
        apelido: ENDERECO_TESTE.apelido,
        logradouro: ENDERECO_TESTE.logradouro,
        numero: ENDERECO_TESTE.numero,
        bairro: ENDERECO_TESTE.bairro,
        cep: '01310100',
        cidade: ENDERECO_TESTE.cidade,
        estado: ENDERECO_TESTE.estado,
      },
    });

    cy.reload();
    cy.get('[data-cy="tab-enderecos"]').click();

    cy.contains('[data-cy^="endereco-card-"]', ENDERECO_TESTE.apelido)
      .find('[data-cy^="endereco-edit-button-"]')
      .click();

    cy.get('[data-cy="endereco-form-panel"]').should('be.visible');
    // Formulário não pré-preenche ao editar: preenche todos os campos obrigatórios
    preencherFormEndereco({ ...ENDERECO_TESTE, numero: '999' });
    cy.get('[data-cy="endereco-submit-button"]').scrollIntoView().click();

    cy.get('[data-cy="endereco-form-panel"]', { timeout: 8000 }).should('not.exist');
    cy.contains('[data-cy^="endereco-card-"]', ENDERECO_TESTE.apelido).should('be.visible');
  });

  it('deve cancelar o formulário sem salvar', () => {
    cy.get('[data-cy="endereco-add-button"]').click();
    cy.get('[data-cy="endereco-form-panel"]').should('be.visible');
    cy.get('[data-cy="endereco-apelido-input"]').type('Endereço Cancelado');
    cy.get('[data-cy="endereco-cancel-button"]').scrollIntoView().click();
    cy.get('[data-cy="endereco-form-panel"]').should('not.exist');
    cy.contains('[data-cy^="endereco-card-"]', 'Endereço Cancelado').should('not.exist');
  });

  it('deve remover o endereço adicionado', () => {
    cy.request({
      method: 'POST',
      url: `${API}/clientes/perfil/enderecos`,
      headers: { Authorization: `Bearer ${token}`, 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: {
        apelido: ENDERECO_TESTE.apelido,
        logradouro: ENDERECO_TESTE.logradouro,
        numero: ENDERECO_TESTE.numero,
        bairro: ENDERECO_TESTE.bairro,
        cep: '01310100',
        cidade: ENDERECO_TESTE.cidade,
        estado: ENDERECO_TESTE.estado,
      },
    });

    cy.reload();
    cy.get('[data-cy="tab-enderecos"]').click();

    cy.contains('[data-cy^="endereco-card-"]', ENDERECO_TESTE.apelido)
      .find('[data-cy^="endereco-delete-button-"]')
      .click({ force: true });

    cy.get('[data-cy="modal-confirm-button"]', { timeout: 5000 }).click();

    cy.contains('[data-cy^="endereco-card-"]', ENDERECO_TESTE.apelido, { timeout: 8000 }).should('not.exist');
  });
});
