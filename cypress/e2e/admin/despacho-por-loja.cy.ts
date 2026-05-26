describe('Admin — Despacho de Pedidos por Loja', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('admin_loja_a pode despachar pedido da Loja A', () => {
    // Criar venda na Loja A
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda criada na Loja A: ${vendaUuid}`);

        // Autenticar como admin da Loja A
        cy.autenticarAdminLojaA();

        // Visitar página de pedidos admin
        cy.visit('/admin/pedidos');

        // Verificar que a página carregou
        cy.get('body').should('not.be.empty');

        // Admin A deve ver o pedido da Loja A
        cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 })
          .should('exist')
          .should('have.length.at.least', 1);

        // Despachar o pedido via API
        cy.despacharPedidoViaApi(vendaUuid);

        // Verificar que o status foi atualizado
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
        }).then((res) => {
          expect(res.body.status).to.equal('EM TRÂNSITO');
          cy.log('Admin Loja A despachou pedido da Loja A com sucesso');
        });
      });
    });
  });

  it('admin_loja_a não pode despachar pedido da Loja B', () => {
    // Criar venda na Loja B
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaB(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda criada na Loja B: ${vendaUuid}`);

        // Autenticar como admin da Loja A
        cy.autenticarAdminLojaA();

        // Tentar despachar o pedido da Loja B via API
        // Deve falhar pois o filtro por loj_id impedirá acesso
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/despachar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404 ou 403) pois venda não pertence à Loja A
          expect(res.status).to.be.oneOf([404, 403, 400]);
          cy.log('Admin Loja A não conseguiu despachar pedido da Loja B (filtro multi-tenancy funcionando)');
        });
      });
    });
  });

  it('admin_loja_b pode despachar pedido da Loja B', () => {
    // Criar venda na Loja B
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaB(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda criada na Loja B: ${vendaUuid}`);

        // Autenticar como admin da Loja B
        cy.autenticarAdminLojaB();

        // Visitar página de pedidos admin
        cy.visit('/admin/pedidos');

        // Verificar que a página carregou
        cy.get('body').should('not.be.empty');

        // Admin B deve ver o pedido da Loja B
        cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 })
          .should('exist')
          .should('have.length.at.least', 1);

        // Despachar o pedido via API
        cy.despacharPedidoViaApi(vendaUuid);

        // Verificar que o status foi atualizado
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
        }).then((res) => {
          expect(res.body.status).to.equal('EM TRÂNSITO');
          cy.log('Admin Loja B despachou pedido da Loja B com sucesso');
        });
      });
    });
  });

  it('admin_loja_b não pode despachar pedido da Loja A', () => {
    // Criar venda na Loja A
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda criada na Loja A: ${vendaUuid}`);

        // Autenticar como admin da Loja B
        cy.autenticarAdminLojaB();

        // Tentar despachar o pedido da Loja A via API
        // Deve falhar pois o filtro por loj_id impedirá acesso
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/despachar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404 ou 403) pois venda não pertence à Loja B
          expect(res.status).to.be.oneOf([404, 403, 400]);
          cy.log('Admin Loja B não conseguiu despachar pedido da Loja A (filtro multi-tenancy funcionando)');
        });
      });
    });
  });
});
