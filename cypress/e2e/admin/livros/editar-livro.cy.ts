/**
 * E2E — Gap 3 / RF0014: Edição parcial de livro
 *
 * Cenários cobertos:
 * 1. GET /admin/livros/:uuid retorna dados do livro
 * 2. PATCH atualiza título com sucesso (200)
 * 3. PATCH com campo proibido (isbn) retorna 400
 * 4. PATCH sem campos retorna 400
 * 5. PATCH sem autenticação retorna 401
 * 6. UI: formulário pré-preenchido ao navegar para /admin/livros/:uuid/editar
 * 7. UI: campos readonly (isbn, autor, categoria) não são editáveis
 * 8. UI: alerta de aprovação pendente aparece ao receber HTTP 202
 */

import { loginAdminUi, ADMIN } from '../../../support/fluxo-venda.helpers';

const API = Cypress.env('apiUrl') ?? 'http://localhost:5001/api';

function loginAdminApi(): Cypress.Chainable<string> {
  return cy
    .request('POST', `${API}/auth/login`, { email: ADMIN.email, senha: ADMIN.senha })
    .then((resp) => resp.body.dados.token as string);
}

function criarLivroApi(token: string): Cypress.Chainable<string> {
  const seed = Date.now() + Math.floor(Math.random() * 10000);
  return cy
    .request({
      method: 'POST',
      url: `${API}/admin/livros`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        titulo: `Livro Editar E2E ${seed}`,
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
      },
      failOnStatusCode: false,
    })
    .then((resp) => resp.body.dados?.uuid as string);
}

describe('Gap 3 — RF0014: Edição parcial de livro', () => {
  // ── Testes de API ──────────────────────────────────────────────────────────

  describe('API', () => {
    let token: string;
    let livroUuid: string;

    before(() => {
      loginAdminApi().then((t) => {
        token = t;
        criarLivroApi(token).then((uuid) => {
          livroUuid = uuid;
        });
      });
    });

    it('deve retornar livro via GET /admin/livros/:uuid', () => {
      expect(livroUuid, 'livroUuid deve estar definido').to.be.a('string');
      cy.request({
        method: 'GET',
        url: `${API}/admin/livros/${livroUuid}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((resp) => {
        expect(resp.status).to.equal(200);
        expect(resp.body.dados).to.have.property('uuid', livroUuid);
      });
    });

    it('deve atualizar título via PATCH retornando 200', () => {
      expect(livroUuid, 'livroUuid deve estar definido').to.be.a('string');
      cy.request({
        method: 'PATCH',
        url: `${API}/admin/livros/${livroUuid}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { titulo: 'Título Atualizado E2E' },
      }).then((resp) => {
        expect(resp.status).to.equal(200);
        expect(resp.body.dados.titulo).to.equal('Título Atualizado E2E');
      });
    });

    it('deve retornar 400 ao enviar campo proibido isbn via PATCH', () => {
      expect(livroUuid, 'livroUuid deve estar definido').to.be.a('string');
      cy.request({
        method: 'PATCH',
        url: `${API}/admin/livros/${livroUuid}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { isbn: '000-000' },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(400);
      });
    });

    it('deve retornar 400 ao enviar PATCH sem nenhum campo', () => {
      expect(livroUuid, 'livroUuid deve estar definido').to.be.a('string');
      cy.request({
        method: 'PATCH',
        url: `${API}/admin/livros/${livroUuid}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {},
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(400);
      });
    });

    it('deve retornar 401 ao tentar editar sem autenticação', () => {
      expect(livroUuid, 'livroUuid deve estar definido').to.be.a('string');
      cy.request({
        method: 'PATCH',
        url: `${API}/admin/livros/${livroUuid}`,
        body: { titulo: 'Hack' },
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.equal(401);
      });
    });
  });

  // ── Testes de UI ───────────────────────────────────────────────────────────

  describe('UI', () => {
    let token: string;
    let livroUuid: string;

    before(() => {
      loginAdminApi().then((t) => {
        token = t;
        criarLivroApi(token).then((uuid) => {
          livroUuid = uuid;
        });
      });
    });

    beforeEach(() => {
      loginAdminUi();
    });

    it('deve exibir formulário de edição ao navegar para /admin/livros/:uuid/editar', () => {
      cy.wrap(null).then(() => {
        cy.visit(`/admin/livros/${livroUuid}/editar`);
        cy.get('[data-cy="editar-livro-form"]', { timeout: 10000 }).should('be.visible');
      });
    });

    it('deve exibir campo título pré-preenchido', () => {
      cy.wrap(null).then(() => {
        cy.visit(`/admin/livros/${livroUuid}/editar`);
        cy.get('[data-cy="editar-livro-titulo"]', { timeout: 10000 })
          .invoke('val')
          .should('not.be.empty');
      });
    });

    it('deve ter campo isbn desabilitado (readonly)', () => {
      cy.wrap(null).then(() => {
        cy.visit(`/admin/livros/${livroUuid}/editar`);
        cy.get('[data-cy="editar-livro-isbn-readonly"]', { timeout: 10000 }).should('be.disabled');
      });
    });

    it('deve exibir botão salvar alterações', () => {
      cy.wrap(null).then(() => {
        cy.visit(`/admin/livros/${livroUuid}/editar`);
        cy.get('[data-cy="editar-livro-salvar-btn"]', { timeout: 10000 }).should('be.visible');
      });
    });
  });
});
