/**
 * CDU009 - Sistema Gera Cupom
 * 
 * Caso de Uso: Sistema gera automaticamente cupom de troca ao confirmar recebimento
 * Rotas Envolvidas:
 * - PATCH /api/admin/pedidos/:uuid/confirmar-recebimento - Confirmar Recebimento (gera cupom)
 * - GET /api/cupom/disponiveis - Listar Cupons Disponíveis
 * 
 * RF0054: Geração de cupom de troca
 * Código do cupom: TROCA-{primeiros 8 chars do UUID}
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU009 - Sistema Gera Cupom', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = Cypress.env('adminSenha') || '@Admin123';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Geração Automática de Cupom', () => {
    it('deve gerar cupom com código correto (TROCA-{primeiros 8 chars do UUID})', () => {
      cy.log('**Etapa 1: Criar fluxo completo de troca**');
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
                    const entregaUuid = entregaResponse.body.uuid;

                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/confirmar`,
                      headers: apiHeadersTestDb()
                    }).then(() => {
                      const itensTroca = itens.map((item: any) => item.livroUuid);
                      cy.request({
                        method: 'POST',
                        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
                        headers: apiHeadersTestDb(),
                        body: {
                          motivo: 'Produto não atendeu expectativas',
                          itensUuids: itensTroca
                        }
                      }).then(() => {
                        cy.loginApi(emailAdmin, senhaAdmin);

                        cy.request({
                          method: 'PATCH',
                          url: `${apiUrl}/admin/pedidos/${vendaUuid}/autorizar-troca`,
                          headers: apiHeadersTestDb(),
                          body: {}
                        }).then(() => {
                          cy.log('**Etapa 2: Confirmar recebimento e verificar geração do cupom**');
                          cy.request({
                            method: 'PATCH',
                            url: `${apiUrl}/admin/pedidos/${vendaUuid}/confirmar-recebimento`,
                            headers: apiHeadersTestDb(),
                            body: {
                              retornarEstoque: true
                            }
                          }).then((recebimentoResponse) => {
                            cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/confirmar-recebimento:**');
                            cy.log(JSON.stringify(recebimentoResponse.body, null, 2));
                            expect(recebimentoResponse.status).to.equal(200);
                            expect(recebimentoResponse.body.cupomGerado).to.exist;

                            const cupomCodigo = recebimentoResponse.body.cupomGerado.codigo;
                            const cupomValor = recebimentoResponse.body.cupomGerado.valor;

                            cy.log(`Cupom gerado: ${cupomCodigo}`);
                            cy.log(`Valor do cupom: R$ ${cupomValor}`);

                            cy.log('**Etapa 3: Validar formato do código do cupom**');
                            expect(cupomCodigo).to.match(/^TROCA-[a-f0-9]{8}$/i);
                            
                            // Validar que o código contém os primeiros 8 caracteres do UUID da venda
                            const primeiros8Chars = vendaUuid.substring(0, 8);
                            expect(cupomCodigo).to.include(primeiros8Chars.toUpperCase());

                            cy.log('**Etapa 4: Validar valor do cupom (soma dos itens em troca)**');
                            expect(cupomValor).to.equal(valorTotalItens);

                            cy.log('**Etapa 5: Verificar cupom na lista de cupons disponíveis**');
                            cy.loginApi(emailCliente, senhaCliente);

                            cy.request({
                              method: 'GET',
                              url: `${apiUrl}/cupom/disponiveis`,
                              headers: apiHeadersTestDb()
                            }).then((cuponsResponse) => {
                              cy.log('**Resposta GET /api/cupom/disponiveis:**');
                              cy.log(JSON.stringify(cuponsResponse.body, null, 2));
                              expect(cuponsResponse.status).to.equal(200);
                              
                              const cupomEncontrado = cuponsResponse.body.dados.find((c: any) => c.codigo === cupomCodigo);
                              expect(cupomEncontrado).to.exist;
                              expect(cupomEncontrado.tipo).to.equal('troca');
                              expect(cupomEncontrado.valor).to.equal(valorTotalItens);
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
      });
    });
  });

  describe('Validações de Negócio', () => {
    it.skip('deve gerar cupom apenas quando itens estão em troca', () => {
      cy.log('**NOTA: Este teste valida que o cupom é gerado apenas para itens marcados como emTroca**');
      cy.log('**A validação é feita no backend, o teste apenas verifica a resposta**');
    });

    it('deve definir validade do cupom corretamente', () => {
      cy.log('**Etapa 1: Criar fluxo de troca**');
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
                    const entregaUuid = entregaResponse.body.uuid;

                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/confirmar`,
                      headers: apiHeadersTestDb()
                    }).then(() => {
                      const itensTroca = itens.map((item: any) => item.livroUuid);
                      cy.request({
                        method: 'POST',
                        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
                        headers: apiHeadersTestDb(),
                        body: {
                          motivo: 'Produto não atendeu expectativas',
                          itensUuids: itensTroca
                        }
                      }).then(() => {
                        cy.loginApi(emailAdmin, senhaAdmin);

                        cy.request({
                          method: 'PATCH',
                          url: `${apiUrl}/admin/pedidos/${vendaUuid}/autorizar-troca`,
                          headers: apiHeadersTestDb(),
                          body: {}
                        }).then(() => {
                          cy.request({
                            method: 'PATCH',
                            url: `${apiUrl}/admin/pedidos/${vendaUuid}/confirmar-recebimento`,
                            headers: apiHeadersTestDb(),
                            body: {
                              retornarEstoque: true
                            }
                          }).then(() => {
                            cy.log('**Etapa 2: Verificar validade do cupom**');
                            cy.loginApi(emailCliente, senhaCliente);

                            cy.request({
                              method: 'GET',
                              url: `${apiUrl}/cupom/disponiveis`,
                              headers: apiHeadersTestDb()
                            }).then((cuponsResponse) => {
                              const cupomTroca = cuponsResponse.body.dados.find((c: any) => c.tipo === 'troca');
                              expect(cupomTroca).to.exist;
                              expect(cupomTroca.validoAte).to.exist;
                              
                              const dataValidade = new Date(cupomTroca.validoAte);
                              const dataAtual = new Date();
                              
                              cy.log(`Data de validade: ${dataValidade.toISOString()}`);
                              cy.log(`Data atual: ${dataAtual.toISOString()}`);
                              
                              // Validade deve ser no futuro (geralmente 6 meses ou 1 ano)
                              expect(dataValidade).to.be.greaterThan(dataAtual);
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
      });
    });
  });
});
