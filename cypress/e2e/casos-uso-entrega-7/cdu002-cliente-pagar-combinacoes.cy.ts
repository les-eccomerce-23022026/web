/**
 * CDU002 - Cliente Pagar com Combinações
 * 
 * Caso de Uso: Cliente processa pagamento com combinações (split payment, cupons)
 * Rotas Envolvidas:
 * - POST /api/pagamento/processar - Processar Pagamento
 * - GET /api/cupom/disponiveis - Listar Cupons Disponíveis
 * 
 * RF0037: Processamento de pagamentos
 * RN0034: Validação de split payment
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU002 - Cliente Pagar com Combinações', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Pagamento com Cartão Único', () => {
    it('deve processar pagamento com sucesso usando cartão único', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Obter livro do catálogo**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.log('**Etapa 3: Adicionar itens ao carrinho**');
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 2
          }
        }).then(() => {
          cy.log('**Etapa 4: Obter itens do carrinho**');
          cy.request({
            method: 'GET',
            url: `${apiUrl}/carrinho`,
            headers: apiHeadersTestDb()
          }).then((carrinhoResponse) => {
            const itens = carrinhoResponse.body.itens;
            const valorTotalItens = itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
            const valorFrete = 15;
            const valorTotal = valorTotalItens + valorFrete;

            cy.log('**Etapa 5: Obter perfil do cliente**');
            cy.request({
              method: 'GET',
              url: `${apiUrl}/clientes/perfil`,
              headers: apiHeadersTestDb()
            }).then((response) => {
              const enderecoUuid = response.body.dados.enderecos[0].uuid;
              const cartaoUuid = response.body.dados.cartoes[0].uuid;

              cy.log('**Etapa 6: Registrar venda**');
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

                cy.log('**Etapa 7: Processar pagamento com cartão único**');
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
                  expect(pagamentoResponse.body.valor).to.equal(valorTotal);
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Split Payment - Múltiplos Cartões', () => {
    it('deve processar pagamento com sucesso usando split payment em múltiplos cartões', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Obter livro do catálogo**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.log('**Etapa 3: Adicionar itens ao carrinho**');
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 3
          }
        }).then(() => {
          cy.log('**Etapa 4: Obter itens do carrinho**');
          cy.request({
            method: 'GET',
            url: `${apiUrl}/carrinho`,
            headers: apiHeadersTestDb()
          }).then((carrinhoResponse) => {
            const itens = carrinhoResponse.body.itens;
            const valorTotalItens = itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
            const valorFrete = 15;
            const valorTotal = valorTotalItens + valorFrete;

            cy.log(`Valor total: R$ ${valorTotal}`);

            cy.log('**Etapa 5: Obter perfil do cliente**');
            cy.request({
              method: 'GET',
              url: `${apiUrl}/clientes/perfil`,
              headers: apiHeadersTestDb()
            }).then((response) => {
              const enderecoUuid = response.body.dados.enderecos[0].uuid;
              const cartoes = response.body.dados.cartoes;
              
              // Verificar se há pelo menos 2 cartões para split
              if (cartoes.length < 2) {
                cy.log('**AVISO: Cliente não tem cartões suficientes para split payment, usando mesmo cartão**');
              }

              const cartao1Uuid = cartoes[0].uuid;
              const cartao2Uuid = cartoes.length > 1 ? cartoes[1].uuid : cartoes[0].uuid;
              
              // Dividir valor em 2 partes (ambas >= R$ 10,00)
              const valorParte1 = Math.ceil(valorTotal / 2);
              const valorParte2 = valorTotal - valorParte1;

              cy.log(`Valor parte 1: R$ ${valorParte1}`);
              cy.log(`Valor parte 2: R$ ${valorParte2}`);

              cy.log('**Etapa 6: Registrar venda com split payment**');
              cy.request({
                method: 'POST',
                url: `${apiUrl}/vendas`,
                headers: apiHeadersTestDb(),
                body: {
                  enderecoUuid,
                  cartaoUuid: cartao1Uuid,
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
                      valor: valorParte1,
                      cartaoUuid: cartao1Uuid
                    },
                    {
                      tipo: 'cartao',
                      valor: valorParte2,
                      cartaoUuid: cartao2Uuid
                    }
                  ]
                }
              }).then((vendaResponse) => {
                const vendaUuid = vendaResponse.body.uuid;
                cy.log(`Venda criada: ${vendaUuid}`);

                cy.log('**Etapa 7: Processar pagamento com split**');
                cy.request({
                  method: 'POST',
                  url: `${apiUrl}/pagamento/processar`,
                  headers: apiHeadersTestDb(),
                  body: {
                    vendaUuid,
                    pagamentos: [
                      {
                        tipo: 'cartao',
                        valor: valorParte1,
                        cartaoUuid: cartao1Uuid,
                        parcelas: 1
                      },
                      {
                        tipo: 'cartao',
                        valor: valorParte2,
                        cartaoUuid: cartao2Uuid,
                        parcelas: 1
                      }
                    ]
                  }
                }).then((pagamentoResponse) => {
                  cy.log('**Resposta POST /api/pagamento/processar (split):**');
                  cy.log(JSON.stringify(pagamentoResponse.body, null, 2));
                  expect(pagamentoResponse.status).to.equal(200);
                  expect(pagamentoResponse.body.status).to.equal('APROVADO');
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Cupons de Desconto', () => {
    it('deve listar cupons disponíveis para o cliente', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Listar cupons disponíveis**');
      cy.request({
        method: 'GET',
        url: `${apiUrl}/cupom/disponiveis`,
        headers: apiHeadersTestDb()
      }).then((response) => {
        cy.log('**Resposta GET /api/cupom/disponiveis:**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(200);
        expect(response.body.dados).to.be.an('array');
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar pagamento quando venda não existe', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      const vendaUuidInexistente = '00000000-0000-0000-0000-000000000000';

      cy.log('**Etapa 2: Tentar processar pagamento para venda inexistente**');
      cy.request({
        method: 'POST',
        url: `${apiUrl}/pagamento/processar`,
        headers: apiHeadersTestDb(),
        body: {
          vendaUuid: vendaUuidInexistente,
          pagamentos: [
            {
              tipo: 'cartao',
              valor: 100,
              cartaoUuid: '223e4567-e89b-12d3-a456-426614174001',
              parcelas: 1
            }
          ]
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta POST /api/pagamento/processar (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.exist;
      });
    });
  });
});
