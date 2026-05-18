/**
 * CDU005 - Admin Confirma Pagamento
 * 
 * Caso de Uso: Administrador confirma pagamento de uma venda
 * Rotas Envolvidas:
 * - POST /api/pagamento/processar - Processar Pagamento
 * - PATCH /api/admin/pedidos/:uuid/confirmar-pagamento - Confirmar Pagamento (Admin)
 * 
 * RF0037: Processamento de pagamentos
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU005 - Admin Confirma Pagamento', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = (Cypress.env('adminSenha') || '@Admin123');
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Admin Confirma Pagamento', () => {
    it('deve permitir que admin confirme pagamento de uma venda', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Criar venda**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 2
          }
        }).then(() => {
          cy.request({
            method: 'GET',
            url: `${apiUrl}/carrinho`,
            headers: apiHeadersTestDb()
          }).then((carrinhoResponse) => {
            const itens = carrinhoResponse.body.itens;
            const valorTotalItens = itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
            const valorFrete = 15;
            const valorTotal = valorTotalItens + valorFrete;

            cy.request({
              method: 'GET',
              url: `${apiUrl}/clientes/perfil`,
              headers: apiHeadersTestDb()
            }).then((perfilResponse) => {
              const enderecoUuid = perfilResponse.body.dados.enderecos[0].uuid;
              const cartaoUuid = perfilResponse.body.dados.cartoes[0].uuid;

              cy.request({
                method: 'POST',
                url: `${apiUrl}/vendas`,
                headers: apiHeadersTestDb(),
                body: {
                  enderecoUuid,
                  cartaoUuid,
                  formaPagamento: 'cartao',
                  valorTotal,
                  valorTotalItens,
                  valorFrete,
                  parcelas: 1,
                  itens: itens.map((item: any) => ({
                    livroUuid: item.livroUuid,
                    quantidade: item.quantidade,
                    precoUnitario: item.precoUnitario
                  })),
                  pagamentos: [
                    {
                      tipo: 'cartao',
                      valor: valorTotal,
                      cartaoUuid
                    }
                  ]
                }
              }).then((vendaResponse) => {
                const vendaUuid = vendaResponse.body.uuid;
                cy.log(`Venda criada: ${vendaUuid}`);

                cy.log('**Etapa 3: Autenticação do Admin**');
                cy.loginApi(emailAdmin, senhaAdmin);

                cy.log('**Etapa 4: Processar pagamento como admin**');
                cy.request({
                  method: 'POST',
                  url: `${apiUrl}/pagamento/processar`,
                  headers: apiHeadersTestDb(),
                  body: {
                    vendaUuid,
                    pagamentos: [
                      {
                        tipo: 'cartao',
                        valor: valorTotal,
                        cartaoUuid,
                        parcelas: 1
                      }
                    ]
                  }
                }).then((pagamentoResponse) => {
                  cy.log('**Resposta POST /api/pagamento/processar:**');
                  cy.log(JSON.stringify(pagamentoResponse.body, null, 2));
                  expect(pagamentoResponse.status).to.equal(200);
                  expect(pagamentoResponse.body.status).to.equal('APROVADO');
                });

                cy.log('**Etapa 5: Verificar status da venda atualizado**');
                cy.request({
                  method: 'GET',
                  url: `${apiUrl}/vendas/${vendaUuid}`,
                  headers: apiHeadersTestDb()
                }).then((vendaAtualizadaResponse) => {
                  cy.log('**Resposta GET /api/vendas/:uuid:**');
                  cy.log(JSON.stringify(vendaAtualizadaResponse.body, null, 2));
                  expect(vendaAtualizadaResponse.status).to.equal(200);
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Validações de Segurança', () => {
    it('deve negar acesso a operações de admin para usuário comum', () => {
      cy.log('**Etapa 1: Autenticação do Cliente (não admin)**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Tentar acessar rota de admin**');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/admin/pedidos/123e4567-e89b-12d3-a456-426614174000/autorizar-troca`,
        headers: apiHeadersTestDb(),
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/autorizar-troca (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(403);
      });
    });
  });
});
