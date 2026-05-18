/**
 * CDU007 - Admin Define EM TRANSPORTE
 * 
 * Caso de Uso: Administrador agenda remessa/entrega para uma venda
 * Rotas Envolvidas:
 * - POST /api/entregas - Agendar Remessa (Entrega)
 * 
 * RF0046: Criação de entrega
 * RN0067: Custo do frete validado
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU007 - Admin Define EM TRANSPORTE', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = Cypress.env('adminSenha') || '@Admin123';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Admin Agenda Entrega', () => {
    it('deve agendar entrega com sucesso para venda processada', () => {
      cy.log('**Etapa 1: Criar venda processada**');
      cy.loginApi(emailCliente, senhaCliente);

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
                }).then(() => {
                  cy.log('**Etapa 2: Autenticação do Admin**');
                  cy.loginApi(emailAdmin, senhaAdmin);

                  cy.log('**Etapa 3: Agendar entrega**');
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
                    expect(entregaResponse.body.uuid).to.exist;
                    expect(entregaResponse.body.vendaUuid).to.equal(vendaUuid);
                    expect(entregaResponse.body.status).to.equal('EM TRÂNSITO');
                    expect(entregaResponse.body.custo).to.equal(valorFrete);

                    cy.log('**Etapa 4: Verificar status da venda atualizado**');
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
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar entrega quando custo não confere com frete da venda (RN0067)', () => {
      cy.log('**Etapa 1: Criar venda**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 1
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
                }).then(() => {
                  cy.log('**Etapa 2: Autenticação do Admin**');
                  cy.loginApi(emailAdmin, senhaAdmin);

                  cy.log('**Etapa 3: Tentar agendar entrega com custo incorreto**');
                  cy.request({
                    method: 'POST',
                    url: `${apiUrl}/entregas`,
                    headers: apiHeadersTestDb(),
                    body: {
                      vendaUuid,
                      tipoFrete: 'PAC',
                      endereco: 'Rua Teste, 123 - São Paulo - SP',
                      custo: 999, // Custo incorreto
                      entregador: 'Transportadora Padrão'
                    },
                    failOnStatusCode: false
                  }).then((response) => {
                    cy.log('**Resposta POST /api/entregas (erro esperado):**');
                    cy.log(JSON.stringify(response.body, null, 2));
                    expect(response.status).to.equal(400);
                    expect(response.body.erro).to.include('Custo da entrega não confere');
                  });
                });
              });
            });
          });
        });
      });
    });

    it('deve rejeitar entrega quando venda não existe', () => {
      cy.log('**Etapa 1: Autenticação do Admin**');
      cy.loginApi(emailAdmin, senhaAdmin);

      cy.log('**Etapa 2: Tentar agendar entrega para venda inexistente**');
      cy.request({
        method: 'POST',
        url: `${apiUrl}/entregas`,
        headers: apiHeadersTestDb(),
        body: {
          vendaUuid: '00000000-0000-0000-0000-000000000000',
          tipoFrete: 'PAC',
          endereco: 'Rua Teste, 123 - São Paulo - SP',
          custo: 15,
          entregador: 'Transportadora Padrão'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta POST /api/entregas (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.exist;
      });
    });
  });

  describe('Listar Entregas por Venda', () => {
    it('deve listar entregas vinculadas a uma venda', () => {
      cy.log('**Etapa 1: Criar venda e entrega**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 1
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
                }).then(() => {
                  cy.loginApi(emailAdmin, senhaAdmin);

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
                  }).then(() => {
                    cy.log('**Etapa 2: Listar entregas da venda**');
                    cy.request({
                      method: 'GET',
                      url: `${apiUrl}/entregas`,
                      headers: apiHeadersTestDb(),
                      qs: {
                        vendaUuid
                      }
                    }).then((response) => {
                      cy.log('**Resposta GET /api/entregas?vendaUuid=:**');
                      cy.log(JSON.stringify(response.body, null, 2));
                      expect(response.status).to.equal(200);
                      expect(response.body).to.be.an('array');
                      expect(response.body.length).to.be.at.least(1);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
