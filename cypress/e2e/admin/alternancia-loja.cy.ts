describe('Admin — Alternância entre Lojas', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('admin com múltiplas lojas pode alternar contexto', () => {
    // Criar vendas em ambas as lojas
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      // Criar venda na Loja A
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid: vendaA }) => {
        cy.log(`Venda A criada: ${vendaA}`);

        // Criar venda na Loja B
        cy.criarVendaLojaB(livroUuid).then(({ vendaUuid: vendaB }) => {
          cy.log(`Venda B criada: ${vendaB}`);

          // Autenticar como admin da Loja A
          cy.autenticarAdminLojaA();

          // Visitar página de pedidos admin com contexto Loja A
          cy.visit('/admin/pedidos');

          // Verificar que a página carregou
          cy.get('body').should('not.be.empty');

          // Admin A deve ver apenas pedidos da Loja A
          cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 })
            .should('exist')
            .then(($pedidos) => {
              const pedidoIds = $pedidos.map((_, el) => el.textContent).get();
              const vendaAVisivel = pedidoIds.some((texto) => texto.includes(vendaA));
              const vendaBVisivel = pedidoIds.some((texto) => texto.includes(vendaB));
              
              expect(vendaAVisivel).to.be.true;
              expect(vendaBVisivel).to.be.false;
              cy.log('Admin Loja A vê apenas pedidos da Loja A');
            });

          // Alternar para Loja B
          cy.autenticarAdminLojaB();

          // Visitar página de pedidos admin com contexto Loja B
          cy.visit('/admin/pedidos');

          // Verificar que a página carregou
          cy.get('body').should('not.be.empty');

          // Admin B deve ver apenas pedidos da Loja B
          cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 })
            .should('exist')
            .then(($pedidos) => {
              const pedidoIds = $pedidos.map((_, el) => el.textContent).get();
              const vendaAVisivel = pedidoIds.some((texto) => texto.includes(vendaA));
              const vendaBVisivel = pedidoIds.some((texto) => texto.includes(vendaB));
              
              expect(vendaAVisivel).to.be.false;
              expect(vendaBVisivel).to.be.true;
              cy.log('Admin Loja B vê apenas pedidos da Loja B');
            });
        });
      });
    });
  });

  it('admin_loja_a não consegue acessar dados da Loja B mesmo após alternar login', () => {
    // Criar venda na Loja B
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaB(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda B criada: ${vendaUuid}`);

        // Autenticar como admin da Loja A
        cy.autenticarAdminLojaA();

        // Tentar acessar venda da Loja B diretamente via API
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404) pois filtro por loj_id bloqueia acesso
          expect(res.status).to.equal(404);
          cy.log('Admin Loja A não consegue acessar venda da Loja B mesmo com UUID correto');
        });
      });
    });
  });

  it('admin_loja_b não consegue acessar dados da Loja A mesmo após alternar login', () => {
    // Criar venda na Loja A
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid }) => {
        cy.log(`Venda A criada: ${vendaUuid}`);

        // Autenticar como admin da Loja B
        cy.autenticarAdminLojaB();

        // Tentar acessar venda da Loja A diretamente via API
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/vendas/${vendaUuid}`,
          headers: {
            'x-use-test-db': 'true',
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Deve retornar erro (404) pois filtro por loj_id bloqueia acesso
          expect(res.status).to.equal(404);
          cy.log('Admin Loja B não consegue acessar venda da Loja A mesmo com UUID correto');
        });
      });
    });
  });
});
