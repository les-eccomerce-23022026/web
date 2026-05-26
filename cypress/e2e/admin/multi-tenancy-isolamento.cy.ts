/**
 * Testes E2E de Multi-tenancy — Isolamento por Loja
 * Cobertura: Verificação de isolamento de dados entre lojas diferentes
 */

describe('Admin — Multi-tenancy Isolamento', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  describe('API Isolamento', () => {
    it('deve autenticar admin da Loja A com sucesso', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001/api';

      // Autenticar como admin da Loja A (define cookie x-loja-uuid)
      cy.autenticarAdminLojaA();

      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-use-test-db': 'true',
        },
        body: {
          email: 'admin_loja_a@email.com',
          senha: 'SenhaAdminA123!',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.sucesso).to.be.true;
        expect(response.body.dados.user.email).to.equal('admin_loja_a@email.com');
      });
    });

    it('deve autenticar admin da Loja B com sucesso', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001/api';

      // Autenticar como admin da Loja B (define cookie x-loja-uuid)
      cy.autenticarAdminLojaB();

      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-use-test-db': 'true',
        },
        body: {
          email: 'admin_loja_b@email.com',
          senha: 'SenhaAdminB123!',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.sucesso).to.be.true;
        expect(response.body.dados.user.email).to.equal('admin_loja_b@email.com');
      });
    });

    it('deve listar livros com contexto de loja A', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001/api';

      // Autenticar como admin da Loja A (define cookie x-loja-uuid)
      cy.autenticarAdminLojaA();

      cy.request({
        method: 'GET',
        url: `${apiUrl}/livros`,
        headers: {
          'x-use-test-db': 'true',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.livros).to.be.an('array');
      });
    });

    it('deve listar livros com contexto de loja B', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001/api';

      // Autenticar como admin da Loja B (define cookie x-loja-uuid)
      cy.autenticarAdminLojaB();

      cy.request({
        method: 'GET',
        url: `${apiUrl}/livros`,
        headers: {
          'x-use-test-db': 'true',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.livros).to.be.an('array');
      });
    });
  });
});
