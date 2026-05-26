describe('Admin — Autorização de Trocas por Loja', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('admin_loja_a pode autorizar troca de pedido da Loja A', () => {
    // Criar venda na Loja A
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid, itemVendaUuid }) => {
        cy.log(`Venda criada na Loja A: ${vendaUuid}`);

        // Despachar pedido
        cy.despacharPedidoViaApi(vendaUuid);

        // Confirmar entrega
        cy.confirmarEntregaViaApi(vendaUuid);

        // Solicitar troca
        cy.solicitarTrocaViaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');

        // Autenticar como admin da Loja A
        cy.autenticarAdminLojaA();

        // Visitar página de trocas admin
        cy.visit('/admin/trocas');

        // Verificar que a página carregou
        cy.get('body').should('not.be.empty');

        // Admin A deve ver a solicitação de troca da Loja A
        cy.get('[data-cy="admin-troca-card"]', { timeout: 10000 })
          .should('exist')
          .should('have.length.at.least', 1);

        // Autorizar troca via API
        cy.autorizarTrocaViaApi(vendaUuid);

        // Verificar que o status foi atualizado
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
        }).then((res) => {
          expect(res.body.status).to.equal('TROCA AUTORIZADA');
          cy.log('Admin Loja A autorizou troca de pedido da Loja A com sucesso');
        });
      });
    });
  });

  it('admin_loja_a não pode autorizar troca de pedido da Loja B', () => {
    // Criar venda na Loja B
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaB(livroUuid).then(({ vendaUuid, itemVendaUuid }) => {
        cy.log(`Venda criada na Loja B: ${vendaUuid}`);

        // Despachar pedido
        cy.despacharPedidoViaApi(vendaUuid);

        // Confirmar entrega
        cy.confirmarEntregaViaApi(vendaUuid);

        // Solicitar troca
        cy.solicitarTrocaViaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');

        // Autenticar como admin da Loja A
        cy.autenticarAdminLojaA();

        // Tentar autorizar troca da Loja B via API
        // Deve falhar pois o filtro por loj_id impedirá acesso
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/troca/autorizar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404 ou 403) pois venda não pertence à Loja A
          expect(res.status).to.be.oneOf([404, 403, 400]);
          cy.log('Admin Loja A não conseguiu autorizar troca de pedido da Loja B (filtro multi-tenancy funcionando)');
        });
      });
    });
  });

  it('admin_loja_b pode autorizar troca de pedido da Loja B', () => {
    // Criar venda na Loja B
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaB(livroUuid).then(({ vendaUuid, itemVendaUuid }) => {
        cy.log(`Venda criada na Loja B: ${vendaUuid}`);

        // Despachar pedido
        cy.despacharPedidoViaApi(vendaUuid);

        // Confirmar entrega
        cy.confirmarEntregaViaApi(vendaUuid);

        // Solicitar troca
        cy.solicitarTrocaViaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');

        // Autenticar como admin da Loja B
        cy.autenticarAdminLojaB();

        // Visitar página de trocas admin
        cy.visit('/admin/trocas');

        // Verificar que a página carregou
        cy.get('body').should('not.be.empty');

        // Admin B deve ver a solicitação de troca da Loja B
        cy.get('[data-cy="admin-troca-card"]', { timeout: 10000 })
          .should('exist')
          .should('have.length.at.least', 1);

        // Autorizar troca via API
        cy.autorizarTrocaViaApi(vendaUuid);

        // Verificar que o status foi atualizado
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
        }).then((res) => {
          expect(res.body.status).to.equal('TROCA AUTORIZADA');
          cy.log('Admin Loja B autorizou troca de pedido da Loja B com sucesso');
        });
      });
    });
  });

  it('admin_loja_b não pode autorizar troca de pedido da Loja A', () => {
    // Criar venda na Loja A
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid, itemVendaUuid }) => {
        cy.log(`Venda criada na Loja A: ${vendaUuid}`);

        // Despachar pedido
        cy.despacharPedidoViaApi(vendaUuid);

        // Confirmar entrega
        cy.confirmarEntregaViaApi(vendaUuid);

        // Solicitar troca
        cy.solicitarTrocaViaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');

        // Autenticar como admin da Loja B
        cy.autenticarAdminLojaB();

        // Tentar autorizar troca da Loja A via API
        // Deve falhar pois o filtro por loj_id impedirá acesso
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/troca/autorizar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404 ou 403) pois venda não pertence à Loja B
          expect(res.status).to.be.oneOf([404, 403, 400]);
          cy.log('Admin Loja B não conseguiu autorizar troca de pedido da Loja A (filtro multi-tenancy funcionando)');
        });
      });
    });
  });
});
