/**
 * CDU008 - Admin Confirma Recebimento
 * 
 * Caso de Uso: Administrador confirma recebimento do produto devolvido
 * Rotas Envolvidas:
 * - PATCH /api/admin/pedidos/:uuid/confirmar-recebimento - Confirmar Recebimento de Troca
 * 
 * RF0054: Geração de cupom de troca
 * RF0055: Retorno ao estoque opcional
 * 
 * Estratégia: API-driven com logs detalhados dos dados retornados
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('CDU008 - Admin Confirma Recebimento', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
  const senhaAdmin = Cypress.env('adminSenha') || '@Admin123';
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = (Cypress.env('clienteSenha') as string) || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Caminho Feliz - Admin Confirma Recebimento e Gera Cupom', () => {
    it('deve confirmar recebimento e gerar cupom de troca com sucesso', () => {
      cy.log('**Etapa 1: Criar venda entregue com troca autorizada**');
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
                        // Autorizar troca como admin
                        cy.loginApi(emailAdmin, senhaAdmin);

                        cy.request({
                          method: 'PATCH',
                          url: `${apiUrl}/admin/pedidos/${vendaUuid}/autorizar-troca`,
                          headers: apiHeadersTestDb(),
                          body: {}
                        }).then(() => {
                          cy.log('**Etapa 2: Confirmar recebimento e gerar cupom**');
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
                            expect(recebimentoResponse.body.pedido.status).to.equal('CONCLUÍDA');
                            expect(recebimentoResponse.body.cupomGerado).to.exist;
                            expect(recebimentoResponse.body.cupomGerado.codigo).to.exist;
                            expect(recebimentoResponse.body.cupomGerado.valor).to.equal(valorTotalItens);

                            const cupomCodigo = recebimentoResponse.body.cupomGerado.codigo;
                            cy.log(`Cupom gerado: ${cupomCodigo}`);

                            cy.log('**Etapa 3: Verificar cupom na lista de cupons disponíveis**');
                            cy.loginApi(emailCliente, senhaCliente);

                            cy.request({
                              method: 'GET',
                              url: `${apiUrl}/cupom/disponiveis`,
                              headers: apiHeadersTestDb()
                            }).then((cuponsResponse) => {
                              cy.log('**Resposta GET /api/cupom/disponiveis:**');
                              cy.log(JSON.stringify(cuponsResponse.body, null, 2));
                              expect(cuponsResponse.status).to.equal(200);
                              expect(cuponsResponse.body.dados).to.be.an('array');
                              
                              const cupomEncontrado = cuponsResponse.body.dados.find((c: any) => c.codigo === cupomCodigo);
                              expect(cupomEncontrado).to.exist;
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
    it('deve rejeitar confirmação quando status não é TROCA AUTORIZADA', () => {
      cy.log('**Etapa 1: Autenticação do Admin**');
      cy.loginApi(emailAdmin, senhaAdmin);

      cy.log('**Etapa 2: Tentar confirmar recebimento de venda com status incorreto**');
      cy.request({
        method: 'PATCH',
        url: `${apiUrl}/admin/pedidos/123e4567-e89b-12d3-a456-426614174000/confirmar-recebimento`,
        headers: apiHeadersTestDb(),
        body: {
          retornarEstoque: true
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log('**Resposta PATCH /api/admin/pedidos/:uuid/confirmar-recebimento (erro esperado):**');
        cy.log(JSON.stringify(response.body, null, 2));
        expect(response.status).to.equal(400);
        expect(response.body.erro).to.include('TROCA AUTORIZADA');
      });
    });
  });
});
