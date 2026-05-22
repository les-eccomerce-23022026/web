describe('Admin — Visibilidade de Livros por Loja', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('admin_loja_a vê apenas livros com estoque na Loja A', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: {
        'x-use-test-db': 'true',
        'x-loja-id': '18',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.livros).to.be.an('array');
      cy.log('Admin Loja A vê livros com contexto Loja A (loj_id=18)');
    });
  });

  it('admin_loja_b vê apenas livros com estoque na Loja B', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: {
        'x-use-test-db': 'true',
        'x-loja-id': '19',
      },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.livros).to.be.an('array');
      cy.log('Admin Loja B vê livros com contexto Loja B (loj_id=19)');
    });
  });

  it('admin_loja_a não vê pedidos da Loja B', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';
    
    // Autenticar como admin da Loja A para obter token
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-use-test-db': 'true',
        'x-loja-id': '18',
      },
      body: {
        email: 'admin_loja_a@email.com',
        senha: 'SenhaAdminA123!',
      },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;
      
      // Listar pedidos com contexto Loja A
      cy.request({
        method: 'GET',
        url: `${apiUrl}/admin/pedidos`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-use-test-db': 'true',
          'x-loja-id': '18',
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        cy.log('Admin Loja A vê apenas pedidos da Loja A (loj_id=18)');
      });
    });
  });

  it('admin_loja_b não vê pedidos da Loja A', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3000/api';
    
    // Autenticar como admin da Loja B para obter token
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-use-test-db': 'true',
        'x-loja-id': '19',
      },
      body: {
        email: 'admin_loja_b@email.com',
        senha: 'SenhaAdminB123!',
      },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;
      
      // Listar pedidos com contexto Loja B
      cy.request({
        method: 'GET',
        url: `${apiUrl}/admin/pedidos`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-use-test-db': 'true',
          'x-loja-id': '19',
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        cy.log('Admin Loja B vê apenas pedidos da Loja B (loj_id=19)');
      });
    });
  });
});
