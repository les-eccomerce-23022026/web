/**
 * CDU001 - Cliente Realizar Compra
 * 
 * Caso de Uso: Cliente finaliza compra com itens do carrinho
 * Rotas Envolvidas:
 * - POST /api/vendas - Registrar Pedido de Venda
 * - POST /api/pagamento/processar - Processar Pagamento
 * - POST /api/entregas - Agendar Remessa
 * 
 * RF0033: Cadastro de venda
 * RF0037: Pagamento via cartão de crédito
 * RN0069: Parcelamento mínimo R$ 80,00
 * RN0034: Mínimo R$ 10,00 por meio de pagamento no split
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU001 - Cliente Realizar Compra', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Compra com Sucesso', () => {
    it('deve registrar venda com sucesso quando cliente finaliza compra com itens no carrinho', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);
      
      cy.log('**Etapa 2: Obter livro do catálogo**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.log(`Livro selecionado: ${livroUuid}`);
        
        cy.log('**Etapa 3: Adicionar livro ao carrinho via API**');
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 2
          }
        }).then((response) => {
          cy.log('**Resposta POST /api/carrinho/itens:**');
          cy.log(JSON.stringify(response.body, null, 2));
          expect(response.status).to.equal(200);
        });

        cy.log('**Etapa 4: Obter perfil do cliente (endereços e cartões)**');
        cy.request({
          method: 'GET',
          url: `${apiUrl}/clientes/perfil`,
          headers: apiHeadersTestDb()
        }).then((response) => {
          cy.log('**Resposta GET /api/clientes/perfil:**');
          cy.log(JSON.stringify(response.body, null, 2));
          expect(response.status).to.equal(200);
          expect(response.body.dados.enderecos).to.be.an('array').that.is.not.empty;
          expect(response.body.dados.cartoes).to.be.an('array').that.is.not.empty;
          
          const enderecoUuid = response.body.dados.enderecos[0].uuid;
          const cartaoUuid = response.body.dados.cartoes[0].uuid;
          
          cy.log(`Endereço selecionado: ${enderecoUuid}`);
          cy.log(`Cartão selecionado: ${cartaoUuid}`);

          cy.log('**Etapa 5: Obter itens do carrinho**');
          cy.request({
            method: 'GET',
            url: `${apiUrl}/carrinho`,
            headers: apiHeadersTestDb()
          }).then((carrinhoResponse) => {
            cy.log('**Resposta GET /api/carrinho:**');
            cy.log(JSON.stringify(carrinhoResponse.body, null, 2));
            expect(carrinhoResponse.status).to.equal(200);
            
            const itens = carrinhoResponse.body.itens;
            const valorTotalItens = itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
            const valorFrete = 15;
            const valorTotal = valorTotalItens + valorFrete;

            cy.log(`Valor total itens: R$ ${valorTotalItens}`);
            cy.log(`Valor frete: R$ ${valorFrete}`);
            cy.log(`Valor total: R$ ${valorTotal}`);

            cy.log('**Etapa 6: Registrar venda via API**');
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
              cy.log('**Resposta POST /api/vendas:**');
              cy.log(JSON.stringify(vendaResponse.body, null, 2));
              expect(vendaResponse.status).to.equal(201);
              expect(vendaResponse.body.uuid).to.exist;
              expect(vendaResponse.body.status).to.equal('EM PROCESSAMENTO');
              expect(vendaResponse.body.valorTotal).to.equal(valorTotal);
              
              const vendaUuid = vendaResponse.body.uuid;
              cy.log(`Venda criada com UUID: ${vendaUuid}`);

              cy.log('**Etapa 7: Processar pagamento via API**');
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

                cy.log('**Etapa 8: Agendar entrega via API**');
                cy.request({
                  method: 'POST',
                  url: `${apiUrl}/entregas`,
                  headers: apiHeadersTestDb(),
                  body: {
                    vendaUuid,
                    tipoFrete: 'PAC',
                    endereco: 'Rua Teste, 123 - São Paulo - SP',
                    custo: valorFrete,
                    entregador: 'Transportadora Padrão'
                  }
                }).then((entregaResponse) => {
                  cy.log('**Resposta POST /api/entregas:**');
                  cy.log(JSON.stringify(entregaResponse.body, null, 2));
                  expect(entregaResponse.status).to.equal(201);
                  expect(entregaResponse.body.status).to.equal('EM TRÂNSITO');
                  expect(entregaResponse.body.vendaUuid).to.equal(vendaUuid);

                  cy.log('**Etapa 9: Verificar status da venda atualizado**');
                  cy.request({
                    method: 'GET',
                    url: `${apiUrl}/vendas/${vendaUuid}`,
                    headers: apiHeadersTestDb()
                  }).then((vendaAtualizadaResponse) => {
                    cy.log('**Resposta GET /api/vendas/:uuid:**');
                    cy.log(JSON.stringify(vendaAtualizadaResponse.body, null, 2));
                    expect(vendaAtualizadaResponse.status).to.equal(200);
                    expect(vendaAtualizadaResponse.body.status).to.equal('EM TRÂNSITO');
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar parcelamento quando valor total abaixo de R$ 80,00 (RN0069)', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Obter livro do catálogo**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.log('**Etapa 3: Adicionar 1 item ao carrinho (valor < R$ 80,00)**');
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 1
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

            cy.log(`Valor total: R$ ${valorTotal} (abaixo de R$ 80,00)`);

            cy.log('**Etapa 5: Obter perfil do cliente**');
            cy.request({
              method: 'GET',
              url: `${apiUrl}/clientes/perfil`,
              headers: apiHeadersTestDb()
            }).then((response) => {
              const enderecoUuid = response.body.dados.enderecos[0].uuid;
              const cartaoUuid = response.body.dados.cartoes[0].uuid;

              cy.log('**Etapa 6: Tentar registrar venda com 2 parcelas (deve falhar RN0069)**');
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
                  parcelas: 2,
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
                },
                failOnStatusCode: false
              }).then((vendaResponse) => {
                cy.log('**Resposta POST /api/vendas (erro esperado):**');
                cy.log(JSON.stringify(vendaResponse.body, null, 2));
                expect(vendaResponse.status).to.equal(400);
                expect(vendaResponse.body.erro).to.include('RN0069');
                expect(vendaResponse.body.erro).to.include('Compras abaixo de R$ 80,00 não permitem parcelamento');
              });
            });
          });
        });
      });
    });

    it('deve rejeitar split payment quando valor por cartão abaixo de R$ 10,00 (RN0034)', () => {
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

              cy.log('**Etapa 6: Tentar split payment com valor abaixo de R$ 10,00 (deve falhar RN0034)**');
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
                      valor: 5, // Abaixo de R$ 10,00
                      cartaoUuid
                    },
                    {
                      tipo: 'cartao',
                      valor: valorTotal - 5,
                      cartaoUuid
                    }
                  ]
                },
                failOnStatusCode: false
              }).then((vendaResponse) => {
                cy.log('**Resposta POST /api/vendas (erro esperado):**');
                cy.log(JSON.stringify(vendaResponse.body, null, 2));
                expect(vendaResponse.status).to.equal(400);
                expect(vendaResponse.body.erro).to.include('RN0034');
              });
            });
          });
        });
      });
    });
  });
});
