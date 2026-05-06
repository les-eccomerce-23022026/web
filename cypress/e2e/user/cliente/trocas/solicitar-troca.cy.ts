/**
 * Testes E2E de Solicitação de Troca - Cliente (UI)
 * RF0040 — Solicitação de Troca · RF0043 — Prazo de 7 dias pós entrega
 * 
 * Cobertura do fluxo de solicitação de troca pela interface do cliente:
 * - Cliente acessa página de troca de pedido entregue
 * - Cliente seleciona itens para troca
 * - Cliente informa motivo
 * - Sistema valida e processa solicitação
 * - Cliente recebe confirmação e é redirecionado
 */

import { apiHeadersCliente } from '../../admin/utils';

describe('Cliente - Solicitação de Troca (UI)', () => {
  let vendaUuid: string;
  let itemVendaUuid: string;
  let tokenCliente: string;
  let tokenAdmin: string;

  beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    
    // Login como admin para preparar pedido entregue
    const emailAdmin = (Cypress.env('adminEmail') as string | undefined) ?? 'admin@les.com.br';
    const senhaAdmin = (Cypress.env('adminSenha') as string | undefined) ?? '@Admin123#';
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
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

    // Preparar carrinho e criar venda entregue via API
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
                ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
              },
            }).then(() => {
              cy.request({
                method: 'PUT',
                url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
                headers: {
                  'Authorization': `Bearer ${tokenAdmin}`,
                  ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
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

  describe('Acesso à Página de Troca', () => {
    it('deve exibir página de solicitação de troca para pedido entregue', () => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.contains('h1', 'Solicitar Troca').should('be.visible');
      cy.contains('Pedido:').should('be.visible');
      cy.contains('Status:').should('contain', 'Entregue');
    });

    it('deve exibir erro para pedido não entregue', () => {
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
          
          cy.visit(`/pedidos/${novaVendaUuid}/troca`);
          
          cy.contains('Apenas pedidos com status').should('be.visible');
          cy.contains('Entregue').should('be.visible');
        });
      });
    });

    it('deve exibir erro para pedido não encontrado', () => {
      const uuidInexistente = '00000000-0000-0000-0000-000000000000';
      
      cy.visit(`/pedidos/${uuidInexistente}/troca`);
      
      cy.contains('Pedido não encontrado').should('be.visible');
    });
  });

  describe('Seleção de Itens para Troca', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
    });

    it('deve exibir lista de itens do pedido', () => {
      cy.contains('Selecione os itens para troca').should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length.at.least', 1);
    });

    it('deve permitir selecionar item para troca', () => {
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').first().should('be.checked');
    });

    it('deve permitir desmarcar item selecionado', () => {
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').first().uncheck();
      cy.get('input[type="checkbox"]').first().should('not.be.checked');
    });

    it('deve exibir erro ao tentar solicitar sem selecionar itens', () => {
      cy.contains('Solicitar Troca').click();
      
      cy.contains('Selecione pelo menos um item').should('be.visible');
    });
  });

  describe('Preenchimento de Motivo', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      cy.get('input[type="checkbox"]').first().check();
    });

    it('deve exibir campo de motivo da troca', () => {
      cy.contains('Motivo da troca:').should('be.visible');
      cy.get('textarea').should('be.visible');
    });

    it('deve permitir preencher motivo da troca', () => {
      cy.get('textarea').type('Produto com defeito de fabricação');
      cy.get('textarea').should('have.value', 'Produto com defeito de fabricação');
    });

    it('deve exibir erro ao tentar solicitar sem motivo', () => {
      cy.contains('Solicitar Troca').click();
      
      cy.contains('Informe o motivo da troca').should('be.visible');
    });
  });

  describe('Solicitação de Troca Completa', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
    });

    it('deve solicitar troca com sucesso', () => {
      cy.get('input[type="checkbox"]').first().check();
      cy.get('textarea').type('Produto com defeito');
      
      cy.contains('Solicitar Troca').click();
      
      cy.contains('Troca Solicitada com Sucesso').should('be.visible');
      cy.contains('Redirecionando para Meus Pedidos').should('be.visible');
      
      cy.url({ timeout: 5000 }).should('include', '/pedidos');
    });

    it('deve desabilitar botão durante envio', () => {
      cy.get('input[type="checkbox"]').first().check();
      cy.get('textarea').type('Produto com defeito');
      
      cy.intercept('POST', '**/vendas/*/troca', {
        delay: 2000,
      }).as('solicitarTroca');
      
      cy.contains('Solicitar Troca').click();
      
      cy.contains('Enviando...').should('be.visible');
      cy.contains('Solicitar Troca').should('be.disabled');
    });

    it('deve permitir cancelar solicitação', () => {
      cy.contains('Cancelar').click();
      
      cy.url().should('include', '/pedidos');
    });

    it('deve exibir erro em caso de falha na API', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.intercept('POST', `${apiUrl}/vendas/*/troca`, {
        statusCode: 400,
        body: { erro: 'Erro ao processar solicitação de troca' },
      }).as('solicitarTrocaFalha');
      
      cy.get('input[type="checkbox"]').first().check();
      cy.get('textarea').type('Produto com defeito');
      
      cy.contains('Solicitar Troca').click();
      cy.wait('@solicitarTrocaFalha');
      
      cy.contains('Erro ao solicitar troca').should('be.visible');
    });
  });

  describe('Validação de Prazo (RN0043)', () => {
    it('deve bloquear solicitação pós 7 dias da entrega', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Atualizar data de entrega para há 8 dias
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/atualizar-data-entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          dataEntrega: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit(`/pedidos/${vendaUuid}/troca`);
        
        cy.contains('Apenas pedidos com status').should('be.visible');
        cy.contains('Entregue').should('be.visible');
      });
    });

    it('deve exibir mensagem informativa sobre prazo de 7 dias', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Atualizar data de entrega para há 8 dias
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/atualizar-data-entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          dataEntrega: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit(`/pedidos/${vendaUuid}/troca`);
        
        cy.contains(/7 dias/i).should('be.visible');
        cy.contains(/prazo/i).should('be.visible');
      });
    });

    it('deve permitir solicitação dentro do prazo de 7 dias', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Atualizar data de entrega para há 5 dias (dentro do prazo)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/atualizar-data-entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          dataEntrega: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit(`/pedidos/${vendaUuid}/troca`);
        
        // Deve exibir a página normalmente (não bloqueada)
        cy.contains('Solicitar Troca').should('be.visible');
        cy.get('input[type="checkbox"]').should('have.length.at.least', 1);
      });
    });
  });

  describe('Bloqueio Preventivo UI (RN0043)', () => {
    it('deve desabilitar botão de solicitação fora do prazo', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Atualizar data de entrega para há 8 dias
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/atualizar-data-entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          dataEntrega: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit(`/pedidos/${vendaUuid}/troca`);
        
        cy.contains('Solicitar Troca')
          .should('be.disabled');
      });
    });

    it('deve mostrar contador de dias restantes para o prazo', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Atualizar data de entrega para há 3 dias
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/atualizar-data-entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          dataEntrega: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        failOnStatusCode: false,
      }).then(() => {
        cy.visit(`/pedidos/${vendaUuid}/troca`);
        
        cy.contains(/4 dias/i).should('be.visible');
        cy.contains(/restantes/i).should('be.visible');
      });
    });
  });
});
