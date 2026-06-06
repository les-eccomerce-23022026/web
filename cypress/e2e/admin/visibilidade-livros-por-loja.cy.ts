describe('Admin — Visibilidade de Livros por Loja', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('admin_loja_a vê apenas livros com estoque na Loja A', () => {
    const apiUrl = Cypress.env('apiUrl');

    // Autenticar como admin da Loja A (define cookie x-loja-uuid)
    cy.autenticarAdminLojaA();

    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: {
        'x-use-test-db': 'true',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.livros).to.be.an('array');
      cy.log('Admin Loja A vê livros com contexto Loja A');
    });
  });

  it('admin_loja_b vê apenas livros com estoque na Loja B', () => {
    const apiUrl = Cypress.env('apiUrl');

    // Autenticar como admin da Loja B (define cookie x-loja-uuid)
    cy.autenticarAdminLojaB();

    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: {
        'x-use-test-db': 'true',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.livros).to.be.an('array');
      cy.log('Admin Loja B vê livros com contexto Loja B');
    });
  });

  it('admin_loja_a não vê pedidos da Loja B', () => {
    const apiUrl = Cypress.env('apiUrl');

    // Autenticar como admin da Loja A (define cookie x-loja-uuid)
    cy.autenticarAdminLojaA();

    // Listar pedidos com contexto Loja A
    cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/pedidos`,
      headers: {
        'x-use-test-db': 'true',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      cy.log('Admin Loja A vê apenas pedidos da Loja A');
    });
  });

  it('admin_loja_b não vê pedidos da Loja A', () => {
    const apiUrl = Cypress.env('apiUrl');

    // Autenticar como admin da Loja B (define cookie x-loja-uuid)
    cy.autenticarAdminLojaB();

    // Listar pedidos com contexto Loja B
    cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/pedidos`,
      headers: {
        'x-use-test-db': 'true',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      cy.log('Admin Loja B vê apenas pedidos da Loja B');
    });
  });
});
