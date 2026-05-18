/**
 * CDU010 - Admin Confirma ENTREGUE
 * 
 * Caso de Uso: Administrador confirma que produto foi entregue ao cliente
 * Rotas Envolvidas:
 * - PATCH /api/entregas/:entregaUuid/confirmar - Confirmar Recebimento
 * 
 * RF0047: Confirmação de entrega
 * RN0043: Registro de dataHoraEntrega para validação de prazo de troca
 * RN0068: Status "ENTREGUE" habilita solicitações de troca
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU010 - Admin Confirma ENTREGUE', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = Cypress.env('adminSenha') || '@Admin123';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Admin Confirma Entrega', () => {
    it('deve confirmar entrega e registrar dataHoraEntrega', () => {
      cy.log('**Etapa 1: Criar venda em trânsito**');
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
                  }).then((entregaResponse) => {
                    const entregaUuid = entregaResponse.body.uuid;
                    cy.log(`Entrega criada: ${entregaUuid}`);

                    cy.log('**Etapa 2: Confirmar entrega**');
                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/confirmar`,
                      headers: apiHeadersTestDb()
                    }).then((confirmacaoResponse) => {
                      cy.log('**Resposta PATCH /api/entregas/:entregaUuid/confirmar:**');
                      cy.log('Status:', confirmacaoResponse.status);
                      expect(confirmacaoResponse.status).to.equal(204);
                    });

                    cy.log('**Etapa 3: Verificar status da venda atualizado para ENTREGUE**');
                    cy.request({
                      method: 'GET',
                      url: `${apiUrl}/vendas/${vendaUuid}`,
                      headers: apiHeadersTestDb()
                    }).then((vendaAtualizadaResponse) => {
                      cy.log('**Resposta GET /api/vendas/:uuid:**');
                      cy.log(JSON.stringify(vendaAtualizadaResponse.body, null, 2));
                      expect(vendaAtualizadaResponse.status).to.equal(200);
                      expect(vendaAtualizadaResponse.body.status).to.equal('ENTREGUE');
                      expect(vendaAtualizadaResponse.body.dataHoraEntrega).to.exist;

                      const dataHoraEntrega = new Date(vendaAtualizadaResponse.body.dataHoraEntrega);
                      const dataAtual = new Date();
                      
                      cy.log(`Data/hora entrega registrada: ${dataHoraEntrega.toISOString()}`);
                      cy.log(`Data/hora atual: ${dataAtual.toISOString()}`);
                      
                      // Data de entrega deve ser recente (últimos 5 minutos)
                      const diferencaMinutos = Math.abs(dataAtual.getTime() - dataHoraEntrega.getTime()) / (1000 * 60);
                      expect(diferencaMinutos).to.be.lessThan(5);
                    });

                    cy.log('**Etapa 4: Verificar que cliente pode solicitar troca (RN0068)**');
                    cy.loginApi(emailCliente, senhaCliente);

                    const itensTroca = itens.map((item: any) => item.livroUuid);
                    cy.request({
                      method: 'POST',
                      url: `${apiUrl}/vendas/${vendaUuid}/troca`,
                      headers: apiHeadersTestDb(),
                      body: {
                        motivo: 'Produto não atendeu expectativas',
                        itensUuids: itensTroca
                      }
                    }).then((trocaResponse) => {
                      cy.log('**Resposta POST /api/vendas/:uuid/troca:**');
                      cy.log(JSON.stringify(trocaResponse.body, null, 2));
                      expect(trocaResponse.status).to.equal(200);
                      expect(trocaResponse.body.status).to.equal('EM TROCA');
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

  describe('Tratamento de Falhas na Entrega', () => {
    it('deve registrar falha na entrega e mudar status para FALHA NA ENTREGA', () => {
      cy.log('**Etapa 1: Criar venda em trânsito**');
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
                  }).then((entregaResponse) => {
                    const entregaUuid = entregaResponse.body.uuid;

                    cy.log('**Etapa 2: Registrar falha na entrega**');
                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/falha`,
                      headers: apiHeadersTestDb()
                    }).then((falhaResponse) => {
                      cy.log('**Resposta PATCH /api/entregas/:entregaUuid/falha:**');
                      cy.log('Status:', falhaResponse.status);
                      expect(falhaResponse.status).to.equal(204);
                    });

                    cy.log('**Etapa 3: Verificar status da venda atualizado para FALHA NA ENTREGA**');
                    cy.request({
                      method: 'GET',
                      url: `${apiUrl}/vendas/${vendaUuid}`,
                      headers: apiHeadersTestDb()
                    }).then((vendaAtualizadaResponse) => {
                      cy.log('**Resposta GET /api/vendas/:uuid:**');
                      cy.log(JSON.stringify(vendaAtualizadaResponse.body, null, 2));
                      expect(vendaAtualizadaResponse.status).to.equal(200);
                      expect(vendaAtualizadaResponse.body.status).to.equal('FALHA NA ENTREGA');
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
    it('deve rejeitar confirmação quando entrega não existe', () => {
      cy.log('**Etapa 1: Autenticação do Admin**');
      cy.loginApi(emailAdmin, senhaAdmin);

      cy.log('**Etapa 2: Tentar confirmar entrega inexistente**');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/entregas/00000000-0000-0000-0000-000000000000/confirmar`,
        headers: apiHeadersTestDb(),
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta PATCH /api/entregas/:entregaUuid/confirmar (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.include('Entrega não encontrada');
      });
    });

    it('deve impedir solicitação de troca antes da confirmação de entrega (RN0063)', () => {
      cy.log('**Etapa 1: Criar venda em trânsito (sem confirmar entrega)**');
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
                    cy.log('**Etapa 2: Tentar solicitar troca antes de confirmar entrega**');
                    cy.loginApi(emailCliente, senhaCliente);

                    const itensTroca = itens.map((item: any) => item.livroUuid);
                    cy.request({
                      method: 'POST',
                      url: `${apiUrl}/vendas/${vendaUuid}/troca`,
                      headers: apiHeadersTestDb(),
                      body: {
                        motivo: 'Produto não atendeu expectativas',
                        itensUuids: itensTroca
                      },
                      failOnStatusCode: false
                    }).then((trocaResponse) => {
                      cy.log('**Resposta POST /api/vendas/:uuid/troca (erro esperado):**');
                      cy.log(JSON.stringify(trocaResponse.body, null, 2));
                      expect(trocaResponse.status).to.equal(400);
                      expect(trocaResponse.body.erro).to.include('entregue');
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
