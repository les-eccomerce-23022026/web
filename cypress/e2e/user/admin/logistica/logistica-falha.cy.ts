/**
 * Testes E2E de Fluxo de Falha de Entrega com Re-endereçamento
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 * 
 * Cobertura do fluxo de logística quando a entrega falha:
 * - Marcar entrega como falhou
 * - Solicitar reconfirmação de endereço ao cliente
 * - Cliente atualiza endereço
 * - Admin redespacha pedido com novo endereço
 * - Nova tentativa de entrega com sucesso
 */

import { apiHeadersAdmin, apiHeadersCliente } from '../utils';

describe('Fluxo Admin - Falha de Entrega e Re-endereçamento', () => {
  let vendaUuid: string;
  let tokenAdmin: string;
  let tokenCliente: string;
  let novoEnderecoUuid: string;

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

    // Preparar carrinho e criar venda
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
          });
        });
      });
    });
  });

  describe('Marcação de Falha na Entrega', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Despachar pedido primeiro
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      });
    });

    it('deve marcar entrega como falhou via API', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
        body: {
          motivo: 'Endereço incompleto - número não encontrado',
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('ENTREGA FALHOU');
      });

      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('ENTREGA FALHOU');
      });
    });

    it('deve impedir marcação de falha para pedido não em trânsito', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Criar nova venda não despachada
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
            url: `${apiUrl}/admin/pedidos/${novaVendaUuid}/falha-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': `Bearer ${tokenAdmin}`,
              ...apiHeadersAdmin(),
            },
            body: {
              motivo: 'Teste',
            },
            failOnStatusCode: false,
          }).then((res) => {
            expect(res.status).to.equal(400);
          });
        });
      });
    });

    it('deve exibir botão de marcar falha na UI para pedidos em trânsito', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar o pedido na tabela e verificar botão de marcar falha
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('exist')
        .should('be.visible');
    });
  });

  describe('Solicitação de Reconfirmação de Endereço', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Despachar e marcar falha
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
          url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
          body: {
            motivo: 'Endereço incompleto',
          },
        });
      });
    });

    it('deve solicitar reconfirmação de endereço ao cliente', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.mensagem).to.equal('Solicitação de reconfirmação enviada');
      });
    });

    it('deve atualizar status para AGUARDANDO RECONFIRMAÇÃO', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${apiUrl}/vendas/${vendaUuid}`,
          headers: {
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
        }).then((res) => {
          expect(res.body.status).to.equal('AGUARDANDO RECONFIRMAÇÃO');
        });
      });
    });
  });

  describe('Atualização de Endereço pelo Cliente', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Despachar, marcar falha e solicitar reconfirmação
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
          url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
          body: {
            motivo: 'Endereço incompleto',
          },
        }).then(() => {
          cy.request({
            method: 'POST',
            url: `${apiUrl}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
            headers: {
              'Authorization': `Bearer ${tokenAdmin}`,
              ...apiHeadersAdmin(),
            },
          });
        });
      });
    });

    it('deve permitir cliente cadastrar novo endereço para o pedido', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Corrigida',
          numero: '999',
          complemento: 'Apto 99',
          bairro: 'Jardins',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01450-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço Corrigido',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
        expect(res.status).to.equal(201);
      });
    });

    it('deve associar novo endereço ao pedido', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Primeiro criar novo endereço
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Atualizada',
          numero: '888',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Trabalho Atualizado',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
        
        // Associar ao pedido
        cy.request({
          method: 'PUT',
          url: `${apiUrl}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            enderecoUuid: novoEnderecoUuid,
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
        });
      });
    });

    it('deve atualizar status para ENDEREÇO ATUALIZADO', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Nova',
          numero: '777',
          complemento: '',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01320-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Casa Nova',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
        
        cy.request({
          method: 'PUT',
          url: `${apiUrl}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            enderecoUuid: novoEnderecoUuid,
          },
        }).then(() => {
          cy.request({
            method: 'GET',
            url: `${apiUrl}/vendas/${vendaUuid}`,
            headers: {
              'Authorization': `Bearer ${tokenCliente}`,
              ...apiHeadersCliente(),
            },
          }).then((res) => {
            expect(res.body.status).to.equal('ENDEREÇO ATUALIZADO');
          });
        });
      });
    });
  });

  describe('Novo Despacho com Endereço Atualizado', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Fluxo completo: despachar → falha → solicitar reconfirmação → cliente atualiza endereço
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
          url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
          body: {
            motivo: 'Endereço incompleto',
          },
        }).then(() => {
          cy.request({
            method: 'POST',
            url: `${apiUrl}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
            headers: {
              'Authorization': `Bearer ${tokenAdmin}`,
              ...apiHeadersAdmin(),
            },
          }).then(() => {
            cy.request({
              method: 'POST',
              url: `${apiUrl}/clientes/perfil/enderecos`,
              headers: apiHeadersCliente(),
              body: {
                logradouro: 'Rua Final',
                numero: '666',
                complemento: '',
                bairro: 'Consolação',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01301-000',
                tipo: 'entrega',
                principal: false,
                apelido: 'Endereço Final',
              },
            }).then((res) => {
              novoEnderecoUuid = res.body.uuid;
              
              cy.request({
                method: 'PUT',
                url: `${apiUrl}/vendas/${vendaUuid}/endereco-entrega`,
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'Authorization': `Bearer ${tokenCliente}`,
                  ...apiHeadersCliente(),
                },
                body: {
                  enderecoUuid: novoEnderecoUuid,
                },
              });
            });
          });
        });
      });
    });

    it('deve permitir novo despacho com endereço atualizado', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });

      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });
    });

    it('deve confirmar nova entrega com sucesso', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Redespachar
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then(() => {
        // Confirmar entrega
        cy.request({
          method: 'PUT',
          url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
          headers: {
            'Authorization': `Bearer ${tokenAdmin}`,
            ...apiHeadersAdmin(),
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.status).to.equal('Entregue');
        });
      });
    });
  });

  describe('Fluxo Completo End-to-End', () => {
    it('deve executar fluxo completo: falha → re-endereço → novo despacho → entrega', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // 1. Despachar pedido
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('Em Trânsito');
      });

      // 2. Marcar falha na entrega
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
        body: {
          motivo: 'Endereço não encontrado',
        },
      }).then((res) => {
        expect(res.body.status).to.equal('ENTREGA FALHOU');
      });

      // 3. Solicitar reconfirmação de endereço
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
      });

      // 4. Cliente cadastra novo endereço
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Av. Paulista',
          numero: '1000',
          complemento: 'Sala 10',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          tipo: 'entrega',
          principal: false,
          apelido: 'Escritório Centro',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
        expect(res.status).to.equal(201);
      });

      // 5. Cliente associa novo endereço ao pedido
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/vendas/${vendaUuid}/endereco-entrega`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          enderecoUuid: novoEnderecoUuid,
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
      });

      // 6. Admin redespacha pedido
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });

      // 7. Admin confirma entrega
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('Entregue');
      });

      // 8. Verificar status final
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('ENTREGUE');
        expect(res.body.enderecoEntrega.logradouro).to.equal('Av. Paulista');
        expect(res.body.enderecoEntrega.numero).to.equal('1000');
      });
    });

    it('deve executar fluxo completo via UI admin: marcar falha → redespachar → entregar', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // 1. Despachar pedido via API
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      });

      // 2. Acessar painel de pedidos via UI
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');

      // 3. Marcar falha na entrega via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();

      // Preencher motivo da falha
      cy.get('[data-cy="falha-entrega-motivo"]')
        .should('be.visible')
        .type('Endereço não localizado pelo transportador');

      cy.get('[data-cy="btn-confirmar-falha"]')
        .click();

      // Verificar feedback de sucesso
      cy.contains(/falha registrada|entrega falhou/i).should('be.visible');

      // 4. Verificar status atualizado na tabela
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'FALHOU');

      // 5. Cadastrar novo endereço via API (para simular ação do cliente)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Corrigida',
          numero: '999',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço Corrigido',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
      });

      // 6. Associar novo endereço ao pedido via API
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/vendas/${vendaUuid}/endereco-entrega`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          enderecoUuid: novoEnderecoUuid,
        },
      });

      // 7. Redespachar pedido via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-redespachar-"]')
        .should('be.visible')
        .click();

      cy.contains(/redespachado|em trânsito/i).should('be.visible');

      // 8. Confirmar nova entrega via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('be.visible')
        .click();

      cy.contains(/entregue|entrega confirmada/i).should('be.visible');

      // 9. Verificar status final na tabela
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });
  });
});
