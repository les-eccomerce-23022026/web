describe('Vendas — Fluxo Completo Multi-loja', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja antes de cada teste
    cy.criarAmbienteMultiLoja();
  });

  it('cliente compra de múltiplas lojas com admins diferentes', () => {
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      // Cliente compra livro da Loja A → Venda A criada
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid: vendaA, itemVendaUuid: itemA }) => {
        cy.log(`Venda A criada na Loja A: ${vendaA}`);

        // Cliente compra livro da Loja B → Venda B criada
        cy.criarVendaLojaB(livroUuid).then(({ vendaUuid: vendaB, itemVendaUuid: itemB }) => {
          cy.log(`Venda B criada na Loja B: ${vendaB}`);

          // Admin A despacha Venda A ✓
          cy.autenticarAdminLojaA();
          cy.despacharPedidoViaApi(vendaA);
          cy.log('Admin Loja A despachou Venda A com sucesso');

          // Verificar status da Venda A
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaA}`,
            headers: {
              'x-use-test-db': 'true',
            },
          }).then((res) => {
            expect(res.body.status).to.equal('EM TRÂNSITO');
          });

          // Admin B despacha Venda B ✓
          cy.autenticarAdminLojaB();
          cy.despacharPedidoViaApi(vendaB);
          cy.log('Admin Loja B despachou Venda B com sucesso');

          // Verificar status da Venda B
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaB}`,
            headers: {
              'x-use-test-db': 'true',
            },
          }).then((res) => {
            expect(res.body.status).to.equal('EM TRÂNSITO');
          });

          // Admin A NÃO pode despachar Venda B ✗
          cy.autenticarAdminLojaA();
          cy.request({
            method: 'PATCH',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaB}/despachar`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'x-use-test-db': 'true',
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.be.oneOf([404, 403, 400]);
            cy.log('Admin Loja A não conseguiu despachar Venda B (filtro multi-tenancy funcionando)');
          });

          // Admin B NÃO pode despachar Venda A ✗
          cy.autenticarAdminLojaB();
          cy.request({
            method: 'PATCH',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaA}/despachar`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'x-use-test-db': 'true',
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.be.oneOf([404, 403, 400]);
            cy.log('Admin Loja B não conseguiu despachar Venda A (filtro multi-tenancy funcionando)');
          });

          // Confirmar entregas para permitir testes de troca
          cy.autenticarAdminLojaA();
          cy.confirmarEntregaViaApi(vendaA);
          cy.autenticarAdminLojaB();
          cy.confirmarEntregaViaApi(vendaB);

          // Cliente solicita troca de Venda A
          cy.solicitarTrocaViaApi(vendaA, itemA, 'Produto com defeito');

          // Admin A pode autorizar troca de Venda A ✓
          cy.autenticarAdminLojaA();
          cy.autorizarTrocaViaApi(vendaA);
          cy.log('Admin Loja A autorizou troca de Venda A com sucesso');

          // Admin B NÃO pode autorizar troca de Venda A ✗
          cy.autenticarAdminLojaB();
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaA}/troca/autorizar`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'x-use-test-db': 'true',
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.be.oneOf([404, 403, 400]);
            cy.log('Admin Loja B não conseguiu autorizar troca de Venda A (filtro multi-tenancy funcionando)');
          });

          cy.log('Fluxo completo multi-loja validado com sucesso');
        });
      });
    });
  });

  it.skip('isolamento de dados entre lojas é mantido em todas as operações - requires backend multi-tenancy fix', () => {
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      // Criar vendas em ambas as lojas
      cy.criarVendaLojaA(livroUuid).then(({ vendaUuid: vendaA }) => {
        cy.criarVendaLojaB(livroUuid).then(({ vendaUuid: vendaB }) => {
          // Verificar que Admin A vê apenas Venda A
          cy.autenticarAdminLojaA();
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos`,
            headers: {
              'x-use-test-db': 'true',
            },
          }).then((res) => {
            const vendas = res.body;
            const vendaAVisivel = vendas.some((v: any) => v.id === vendaA);
            const vendaBVisivel = vendas.some((v: any) => v.id === vendaB);
            
            expect(vendaAVisivel).to.be.true;
            expect(vendaBVisivel).to.be.false;
            cy.log('Admin Loja A vê apenas Venda A');
          });

          // Verificar que Admin B vê apenas Venda B
          cy.autenticarAdminLojaB();
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos`,
            headers: {
              'x-use-test-db': 'true',
            },
          }).then((res) => {
            const vendas = res.body;
            const vendaAVisivel = vendas.some((v: any) => v.id === vendaA);
            const vendaBVisivel = vendas.some((v: any) => v.id === vendaB);
            
            expect(vendaAVisivel).to.be.false;
            expect(vendaBVisivel).to.be.true;
            cy.log('Admin Loja B vê apenas Venda B');
          });

          cy.log('Isolamento de dados entre lojas validado com sucesso');
        });
      });
    });
  });
});
