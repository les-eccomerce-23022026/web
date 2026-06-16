/**
 * E2E Test - Dados de Domínio (RNF0013)
 *
 * Valida que os dados de domínio necessários estão disponíveis na aplicação,
 * usando a navegação e os componentes reais da UI:
 * 1. Categorias de livros (seed via catálogo) — select no cadastro de livro
 * 2. Grupos de precificação — select no cadastro de livro
 * 3. Bandeiras de cartão aceitas — select no formulário de cartão (perfil cliente)
 * 4. Tipos de telefone — select no perfil do cliente
 * 5. Backend: APIs de domínio (categorias/catálogo e pagamento/info)
 */

describe('Dados de Domínio', () => {
  const adminEmail = 'admintest@email.com';
  const adminSenha = '123456';
  const clienteEmail = 'clientetest@email.com';
  const clienteSenha = 'Teste@123456';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  function login(email: string, senha: string): void {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(email);
    cy.get('[data-cy="login-password-input"]').clear().type(senha);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/minha-conta');
  }

  describe('Categorias e Grupos de Precificação (Cadastro de Livro)', () => {
    it('deve listar categorias e grupos de precificação no cadastro de livro', () => {
      cy.intercept('GET', '**/categorias/catalogo').as('getCategorias');

      login(adminEmail, adminSenha);

      cy.visit('/admin/livros/novo');
      cy.url().should('include', '/admin/livros/novo');

      cy.wait('@getCategorias', { timeout: 15000 });

      // Categorias vêm do catálogo (dados de domínio reais)
      cy.get('[data-cy="cadastro-livro-categoria-select"]', { timeout: 10000 })
        .should('be.visible')
        .find('option')
        .should('have.length.at.least', 2);

      // Grupos de precificação disponíveis
      cy.get('[data-cy="cadastro-livro-grupo-preco-select"]')
        .should('be.visible')
        .find('option')
        .should('have.length.at.least', 3);
    });
  });

  describe('Bandeiras de Cartão (Perfil do Cliente)', () => {
    it('deve listar bandeiras de cartão aceitas', () => {
      login(clienteEmail, clienteSenha);

      cy.visit('/minha-conta');
      cy.get('[data-cy="tab-cartoes"]', { timeout: 10000 }).should('be.visible').click();

      cy.get('[data-cy="cartao-add-button"]', { timeout: 10000 }).should('be.visible').click();

      cy.get('[data-cy="cartao-bandeira-select"]', { timeout: 10000 })
        .should('be.visible')
        .find('option')
        .should('have.length.at.least', 3);
    });
  });

  describe('Tipos de Telefone (Perfil do Cliente)', () => {
    it('deve listar tipos de telefone disponíveis', () => {
      login(clienteEmail, clienteSenha);

      cy.visit('/minha-conta');
      // A aba "perfil" é a padrão e contém o formulário de telefone
      cy.get('[data-cy="tab-perfil"]', { timeout: 10000 }).should('be.visible').click();

      cy.get('[data-cy="perfil-tel-tipo-select"]', { timeout: 10000 })
        .should('be.visible')
        .find('option')
        .should('have.length.at.least', 2);
    });
  });

  describe('Backend — APIs de Dados de Domínio', () => {
    it('deve retornar categorias via GET /api/categorias/catalogo', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/categorias/catalogo`).then((resposta) => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body).to.be.an('array');
        expect(resposta.body.length).to.be.greaterThan(0);
      });
    });

    it('deve retornar informações de pagamento (domínio) para cliente autenticado', () => {
      // Login via API para obter token
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
        email: clienteEmail,
        senha: clienteSenha,
      }).then((respLogin) => {
        expect(respLogin.status).to.eq(200);
        const token = respLogin.body?.dados?.token;
        expect(token).to.be.a('string');

        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/pagamento/info`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((respInfo) => {
          expect(respInfo.status).to.eq(200);
          expect(respInfo.body).to.be.an('object');
        });
      });
    });
  });
});
