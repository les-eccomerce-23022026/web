/**
 * E2E — Gap 4 / RN0011: Categoria obrigatória no cadastro de livro
 *
 * Cenários cobertos:
 * 1. Backend rejeita cadastro sem categoria (400)
 * 2. Formulário exibe select de categoria
 * 3. Cadastro com categoria válida é aceito (201)
 */

import { loginAdminUi, ADMIN } from '../../../support/fluxo-venda.helpers';

const API = Cypress.env('apiUrl') ?? 'http://localhost:5001/api';

function loginAdminApi(): Cypress.Chainable<string> {
  return cy
    .request('POST', `${API}/auth/login`, { email: ADMIN.email, senha: ADMIN.senha })
    .then((resp) => resp.body.dados.token as string);
}

function payloadLivroBase(): Record<string, unknown> {
  const seed = Date.now();
  return {
    titulo: `Livro E2E ${seed}`,
    isbn: `978${String(seed).slice(-10)}`,
    autorNome: 'Machado de Assis',
    editoraNome: 'Companhia das Letras',
    categoriaNome: 'Tecnologia',
    grupoPrecificacaoNome: 'Varejo',
    ano: 2024,
    edicao: '1ª',
    numeroPaginas: 200,
    altura: 23,
    largura: 15,
    peso: 0.4,
    profundidade: 2,
    codigoBarras: `789${String(seed).slice(-10)}`,
    precoVenda: 80.0,
    valorCusto: 40.0,
    quantidadeEstoque: 10,
  };
}

describe('Gap 4 — RN0011: Categoria obrigatória no cadastro de livro', () => {
  // ── Testes de API (sem UI) ──────────────────────────────────────────────────

  describe('API', () => {
    let token: string;

    before(() => {
      loginAdminApi().then((t) => {
        token = t;
      });
    });

    it('deve retornar 400 ao criar livro sem categoriaNome', () => {
      const { categoriaNome: _, ...semCategoria } = payloadLivroBase();

      cy.request({
        method: 'POST',
        url: `${API}/admin/livros`,
        headers: { Authorization: `Bearer ${token}` },
        body: semCategoria,
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(400);
        expect(resp.body).to.have.property('mensagem');
        expect(resp.body.mensagem.toLowerCase()).to.include('categoria');
      });
    });

    it('deve retornar 400 ao criar livro com categoriaNome vazia', () => {
      cy.request({
        method: 'POST',
        url: `${API}/admin/livros`,
        headers: { Authorization: `Bearer ${token}` },
        body: { ...payloadLivroBase(), categoriaNome: '' },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(400);
      });
    });

    it('deve criar livro com sucesso quando categoriaNome válida fornecida', () => {
      cy.request({
        method: 'POST',
        url: `${API}/admin/livros`,
        headers: { Authorization: `Bearer ${token}` },
        body: payloadLivroBase(),
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(201);
        expect(resp.body.sucesso).to.be.true;
        expect(resp.body.dados).to.have.property('uuid');
      });
    });
  });

  // ── Testes de UI ───────────────────────────────────────────────────────────

  describe('UI', () => {
    beforeEach(() => {
      loginAdminUi();
      cy.visit('/admin/livros/novo');
    });

    it('deve exibir select de categoria no formulário', () => {
      cy.get('[data-cy="cadastro-livro-categoria-select"]').should('be.visible');
    });

    it('deve exibir opção padrão vazia no select de categoria', () => {
      cy.get('[data-cy="cadastro-livro-categoria-select"]')
        .find('option:first')
        .should('have.value', '');
    });

    it('deve carregar categorias no select a partir da API', () => {
      cy.get('[data-cy="cadastro-livro-categoria-select"] option').should(
        'have.length.greaterThan',
        1,
      );
    });

    it('deve exibir botão salvar no formulário', () => {
      cy.get('[data-cy="cadastro-livro-salvar-btn"]').should('be.visible');
    });
  });
});
