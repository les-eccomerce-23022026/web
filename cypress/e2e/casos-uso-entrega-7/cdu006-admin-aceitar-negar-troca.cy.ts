/**
 * CDU006 - Admin Aceitar/Negar Troca
 * 
 * Caso de Uso: Administrador autoriza ou rejeita solicitação de troca
 * Rotas Envolvidas:
 * - PATCH /api/admin/pedidos/:uuid/autorizar-troca - Autorizar Troca
 * - PATCH /api/admin/pedidos/:uuid/rejeitar-troca - Rejeitar Troca
 * 
 * RF0044: Aprovação de troca pelo admin
 * RF0045: Rejeição de troca pelo admin
 * RN0065: Motivo obrigatório ao rejeitar
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU006 - Admin Aceitar/Negar Troca', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = Cypress.env('adminSenha') || '@Admin123';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Admin Autoriza Troca', () => {
    it('deve autorizar solicitação de troca com sucesso', () => {
      cy.log('**Etapa 1: Criar venda entregue com solicitação de troca**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        // Setup: criar venda, processar pagamento, criar entrega, confirmar entrega, solicitar troca
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

              // Criar venda
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

                // Processar pagamento
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
                  // Criar entrega
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

                    // Confirmar entrega
                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/confirmar`,
                      headers: apiHeadersTestDb()
                    }).then(() => {
                      // Solicitar troca
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
                        cy.log('**Etapa 2: Autenticação do Admin**');
                        cy.loginApi(emailAdmin, senhaAdmin);

                        cy.log('**Etapa 3: Autorizar troca**');
                        cy.request({
                          method: 'PATCH',
                          url: `${apiUrl}/admin/pedidos/${vendaUuid}/autorizar-troca`,
                          headers: apiHeadersTestDb(),
                          body: {}
                        }).then((autorizacaoResponse) => {
                          cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/autorizar-troca:**');
                          cy.log(JSON.stringify(autorizacaoResponse.body, null, 2));
                          expect(autorizacaoResponse.status).to.equal(200);
                          expect(autorizacaoResponse.body.status).to.equal('TROCA AUTORIZADA');
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

  describe('Caminho Feliz - Admin Rejeita Troca', () => {
    it('deve rejeitar solicitação de troca com motivo', () => {
      cy.log('**Etapa 1: Criar venda entregue com solicitação de troca**');
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
                        cy.log('**Etapa 2: Autenticação do Admin**');
                        cy.loginApi(emailAdmin, senhaAdmin);

                        cy.log('**Etapa 3: Rejeitar troca com motivo**');
                        cy.request({
                          method: 'PATCH',
                          url: `${apiUrl}/admin/pedidos/${vendaUuid}/rejeitar-troca`,
                          headers: apiHeadersTestDb(),
                          body: {
                            motivo: 'Produto danificado'
                          }
                        }).then((rejeicaoResponse) => {
                          cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/rejeitar-troca:**');
                          cy.log(JSON.stringify(rejeicaoResponse.body, null, 2));
                          expect(rejeicaoResponse.status).to.equal(200);
                          expect(rejeicaoResponse.body.status).to.equal('TROCA REJEITADA');
                          expect(rejeicaoResponse.body.motivoTroca).to.equal('Produto danificado');
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
    it('deve exigir motivo ao rejeitar troca (RN0065)', () => {
      cy.log('**Etapa 1: Autenticação do Admin**');
      cy.loginApi(emailAdmin, senhaAdmin);

      cy.log('**Etapa 2: Tentar rejeitar troca sem motivo**');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/admin/pedidos/123e4567-e89b-12d3-a456-426614174000/rejeitar-troca`,
        headers: apiHeadersTestDb(),
        body: {}, // Sem motivo
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/rejeitar-troca (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.include('motivo');
      });
    });

    it('deve rejeitar autorização quando status não é EM TROCA', () => {
      cy.log('**Etapa 1: Autenticação do Admin**');
      cy.loginApi(emailAdmin, senhaAdmin);

      cy.log('**Etapa 2: Tentar autorizar troca de venda com status incorreto**');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/admin/pedidos/123e4567-e89b-12d3-a456-426614174000/autorizar-troca`,
        headers: apiHeadersTestDb(),
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/autorizar-troca (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.include('EM TROCA');
      });
    });
  });
});
