/**
 * CDU004 - Solicitar Troca/Devolução
 * 
 * Caso de Uso: Cliente solicita troca de itens de uma venda entregue
 * Rotas Envolvidas:
 * - POST /api/vendas/:uuid/troca - Solicitar Troca
 * 
 * RF0043: Solicitação de troca/devolução
 * RN0043: Prazo de arrependimento de 7 dias
 * RN0063: Troca apenas para pedidos entregues
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU004 - Solicitar Troca/Devolução', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
  });

  describe('Caminho Feliz - Solicitação de Troca', () => {
    it('deve solicitar troca com sucesso para venda entregue dentro do prazo de 7 dias', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Criar venda e simular entrega**');
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        // Adicionar ao carrinho
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: apiHeadersTestDb(),
          body: {
            livroUuid,
            quantidade: 2
          }
        }).then(() => {
          // Obter carrinho
          cy.request({
            method: 'GET',
            url: `${apiUrl}/carrinho`,
            headers: apiHeadersTestDb()
          }).then((carrinhoResponse) => {
            const itens = carrinhoResponse.body.itens;
            const valorTotalItens = itens.reduce((acc: number, item: any) => acc + (item.precoUnitario * item.quantidade), 0);
            const valorFrete = 15;
            const valorTotal = valorTotalItens + valorFrete;

            // Obter perfil
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
                cy.log(`Venda criada: ${vendaUuid}`);

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
                    cy.log(`Entrega criada: ${entregaUuid}`);

                    // Confirmar entrega
                    cy.request({
                      method: 'PATCH',
                      url: `${apiUrl}/entregas/${entregaUuid}/confirmar`,
                      headers: apiHeadersTestDb()
                    }).then(() => {
                      cy.log('**Etapa 3: Solicitar troca**');
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
                        expect(trocaResponse.body.motivoTroca).to.equal('Produto não atendeu expectativas');
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
    it('deve rejeitar troca quando venda não está entregue', () => {
      cy.log('**Etapa 1: Autenticação do Cliente**');
      cy.loginApi(emailCliente, senhaCliente);

      cy.log('**Etapa 2: Criar venda sem confirmar entrega**');
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
                cy.log(`Venda criada (não entregue): ${vendaUuid}`);

                cy.log('**Etapa 3: Tentar solicitar troca (deve falhar RN0063)**');
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

    it.skip('deve rejeitar troca quando prazo de 7 dias expirou (RN0043)', () => {
      cy.log('**NOTA: Este teste requer manipulação de dataHoraEntrega no banco de dados**');
      cy.log('**Para implementar: criar venda com dataHoraEntrega > 7 dias atrás**');
    });
  });
});
