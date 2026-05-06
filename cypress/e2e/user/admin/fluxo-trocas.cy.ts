/**
 * Testes E2E do Fluxo Admin - Trocas e Devoluções
 * RF0043 — Solicitação de Troca · RF0044 — Autorização de Troca · RF0045 — Cupom de Troca
 * 
 * Cobertura do fluxo de trocas:
 * - Cliente solicita troca de item/pedido
 * - Admin autoriza ou rejeita troca
 * - Admin confirma recebimento do produto devolvido
 * - Sistema gera cupom de troca automaticamente
 */

import { apiHeadersAdmin, apiHeadersCliente } from './utils';

describe('Fluxo Admin - Trocas e Devoluções', () => {
  let vendaUuid: string;
  let itemVendaUuid: string;
  let tokenAdmin: string;
  let tokenCliente: string;

  beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    
    // Login como admin
    const emailAdmin = (Cypress.env('adminEmail') as string | undefined) ?? 'admin@les.com.br';
    const senhaAdmin = (Cypress.env('adminSenha') as string | undefined) ?? '@Admin123#';
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...apiHeadersAdmin(),
      },
      body: {
        email: emailAdmin,
        senha: senhaAdmin,
      },
    }).then((res) => {
      tokenAdmin = res.body.token;
    });

    // Login como cliente
    const emailCliente = (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
    const senhaCliente = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKLÇ123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...apiHeadersCliente(),
      },
      body: {
        email: emailCliente,
        senha: senhaCliente,
      },
    }).then((res) => {
      tokenCliente = res.body.token;
    });

    // Preparar carrinho e criar venda entregue
    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: apiHeadersCliente(),
    }).then((res) => {
      const primeiroLivro = res.body[0];
      const livroUuid = primeiroLivro.uuid;

      // Adicionar ao carrinho
      cy.request({
        method: 'POST',
        url: `${apiUrl}/carrinho/itens`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...apiHeadersCliente(),
        },
        body: {
          livroUuid,
          quantidade: 1,
        },
      });

      // Criar venda
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
          valorTotalItens: 30,
          valorFrete: 10,
          valorTotal: 40,
        },
      }).then((res) => {
        vendaUuid = res.body.id;

        // Aprovar pagamento
        cy.request({
          method: 'POST',
          url: `${apiUrl}/pagamentos/selecionar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            vendaUuid,
            valor: 40,
            tipoPagamento: 'cartao_credito',
            cartao: {
              numero: '4111111111111111',
              nomeTitular: 'Cliente Teste',
              validade: '12/30',
              bandeira: 'Visa',
            },
          },
        }).then((selRes) => {
          const pagamentoUuid = selRes.body.id;
          
          cy.request({
            method: 'POST',
            url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
            headers: {
              'Authorization': `Bearer ${tokenCliente}`,
              ...apiHeadersCliente(),
            },
          }).then(() => {
            // Despachar e entregar
            cy.request({
              method: 'PUT',
              url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
              headers: {
                'Authorization': `Bearer ${tokenAdmin}`,
                ...apiHeadersAdmin(),
              },
            }).then(() => {
              cy.request({
                method: 'PUT',
                url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
                headers: {
                  'Authorization': `Bearer ${tokenAdmin}`,
                  ...apiHeadersAdmin(),
                },
              }).then(() => {
                // Obter item UUID
                cy.request({
                  method: 'GET',
                  url: `${apiUrl}/vendas/${vendaUuid}`,
                  headers: {
                    'Authorization': `Bearer ${tokenCliente}`,
                    ...apiHeadersCliente(),
                  },
                }).then((vendaRes) => {
                  itemVendaUuid = vendaRes.body.itens[0].id;
                });
              });
            });
          });
        });
      });
    });
  });

  describe('Listagem de Trocas', () => {
    it('deve exibir lista de solicitações de troca no painel admin', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'GET',
        url: `${apiUrl}/admin/trocas`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
      });
    });

    it('deve acessar página de gerenciamento de trocas', () => {
      cy.visit('/admin/trocas');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="trocas-painel"]').should('exist');
    });
  });

  describe('Solicitação de Troca (Cliente)', () => {
    it('deve permitir cliente solicitar troca de pedido entregue', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          motivo: 'Produto com defeito',
          itensUuids: [itemVendaUuid],
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('EM TROCA');
      });
    });

    it('deve impedir solicitação de troca de pedido não entregue', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Criar nova venda não entregue
      cy.request({
        method: 'GET',
        url: `${apiUrl}/livros`,
        headers: apiHeadersCliente(),
      }).then((res) => {
        const livroUuid = res.body[0].uuid;
        
        cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        }).then((vendaRes) => {
          const novaVendaUuid = vendaRes.body.id;
          
          cy.request({
            method: 'POST',
            url: `${apiUrl}/vendas/${novaVendaUuid}/troca`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': `Bearer ${tokenCliente}`,
              ...apiHeadersCliente(),
            },
            body: {
              motivo: 'Produto com defeito',
              itensUuids: [itemVendaUuid],
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.equal(400);
          });
        });
      });
    });
  });

  describe('Autorização de Troca (Admin)', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Solicitar troca
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          motivo: 'Produto com defeito',
          itensUuids: [itemVendaUuid],
        },
      });
    });

    it('deve autorizar solicitação de troca', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${vendaUuid}/troca/autorizar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('TROCA AUTORIZizada');
      });
    });

    it('deve rejeitar solicitação de troca', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Solicitar nova troca para rejeitar
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          motivo: 'Produto com defeito',
          itensUuids: [itemVendaUuid],
        },
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas/${vendaUuid}/troca/rejeitar`,
          headers: {
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.status).to.equal('TROCA REJEITADA');
        });
      });
    });

    it('deve impedir autorização de troca não solicitada', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Criar venda sem solicitação de troca
      cy.request({
        method: 'GET',
        url: `${apiUrl}/livros`,
        headers: apiHeadersCliente(),
      }).then((res) => {
        const livroUuid = res.body[0].uuid;
        
        cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        }).then((vendaRes) => {
          const novaVendaUuid = vendaRes.body.id;
          
          cy.request({
            method: 'POST',
            url: `${apiUrl}/vendas/${novaVendaUuid}/troca/autorizar`,
            headers: {
              'Authorization': `Bearer ${tokenAdmin}`,
              ...apiHeadersAdmin(),
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.equal(400);
          });
        });
      });
    });
  });

  describe('Confirmação de Recebimento e Geração de Cupom', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Solicitar e autorizar troca
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${vendaUuid}/troca`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          motivo: 'Produto com defeito',
          itensUuids: [itemVendaUuid],
        },
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas/${vendaUuid}/troca/autorizar`,
          headers: {
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
        });
      });
    });

    it('deve confirmar recebimento do produto devolvido', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/vendas/${vendaUuid}/troca/confirmar-recebimento`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
      });
    });

    it('deve gerar cupom de troca automaticamente após confirmar recebimento', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Confirmar recebimento
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/vendas/${vendaUuid}/troca/confirmar-recebimento`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then(() => {
        // Verificar se cupom foi criado
        cy.request({
          method: 'GET',
          url: `${apiUrl}/clientes/perfil/cupons`,
          headers: {
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          
          // Verificar se existe cupom de troca
          const cupomTroca = res.body.find((c: { tipo: string }) => c.tipo === 'troca');
          expect(cupomTroca).to.exist;
        });
      });
    });

    it('deve impedir confirmação de recebimento de troca não autorizada', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Criar venda sem autorização de troca
      cy.request({
        method: 'GET',
        url: `${apiUrl}/livros`,
        headers: apiHeadersCliente(),
      }).then((res) => {
        const livroUuid = res.body[0].uuid;
        
        cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        }).then((vendaRes) => {
          const novaVendaUuid = vendaRes.body.id;
          
          cy.request({
            method: 'PUT',
            url: `${apiUrl}/vendas/${novaVendaUuid}/troca/confirmar-recebimento`,
            headers: {
              'Authorization': `Bearer ${tokenAdmin}`,
              ...apiHeadersAdmin(),
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.equal(400);
          });
        });
      });
    });
  });
});
