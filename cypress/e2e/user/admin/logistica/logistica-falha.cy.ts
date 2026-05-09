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
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

describe('Fluxo Admin - Falha de Entrega e Re-endereçamento', () => {
  let vendaUuid: string;
  let novoEnderecoUuid: string;

  beforeEach(() => {
    // Setup mínimo via API: criar venda aprovada
    cy.criarVendaAprovadaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });

    // Login admin via API para estabelecer sessão
    cy.loginAdminApi();
  });

  describe('Marcação de Falha na Entrega - E2E UI Real', () => {
    beforeEach(() => {
      // Setup: despachar pedido
      cy.despacharPedidoApi(vendaUuid);
    });

    it('deve marcar entrega como falhou via UI', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar no botão de marcar falha
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      // Preencher motivo da falha
      cy.get('[data-cy="falha-entrega-motivo"]')
        .should('be.visible')
        .type('Endereço incompleto - número não encontrado');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'falha');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'FALHOU');
    });

    it('deve impedir marcação de falha para pedido não em trânsito via API', () => {
      // Criar nova venda não despachada
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${novaVendaUuid}/falha-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
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

  describe('Solicitação de Reconfirmação de Endereço - Setup API', () => {
    beforeEach(() => {
      // Setup: despachar e marcar falha
      cy.despacharPedidoApi(vendaUuid);
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incompleto');
    });

    it('deve solicitar reconfirmação de endereço ao cliente via API', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.mensagem).to.equal('Solicitação de reconfirmação enviada');
      });
    });

    it('deve atualizar status para AGUARDANDO RECONFIRMAÇÃO via API', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersTestDb(),
        }).then((res) => {
          expect(res.body.status).to.equal('AGUARDANDO RECONFIRMAÇÃO');
        });
      });
    });
  });

  describe('Atualização de Endereço pelo Cliente - Setup API', () => {
    beforeEach(() => {
      // Setup: despachar, marcar falha e solicitar reconfirmação
      cy.despacharPedidoApi(vendaUuid);
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incompleto');
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
    });

    it('deve permitir cliente cadastrar novo endereço para o pedido via API', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
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

    it('deve associar novo endereço ao pedido via API', () => {
      // Primeiro criar novo endereço
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
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
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
          },
          body: {
            enderecoUuid: novoEnderecoUuid,
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
        });
      });
    });

    it('deve atualizar status para ENDEREÇO ATUALIZADO via API', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
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
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
          },
          body: {
            enderecoUuid: novoEnderecoUuid,
          },
        }).then(() => {
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
            headers: apiHeadersTestDb(),
          }).then((res) => {
            expect(res.body.status).to.equal('ENDEREÇO ATUALIZADO');
          });
        });
      });
    });
  });

  describe('Novo Despacho com Endereço Atualizado - Setup API', () => {
    beforeEach(() => {
      // Fluxo completo: despachar → falha → solicitar reconfirmação → cliente atualiza endereço
      cy.despacharPedidoApi(vendaUuid);
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incompleto');
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersTestDb(),
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
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersTestDb(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
      });
    });

    it('deve permitir novo despacho com endereço atualizado via API', () => {
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });

      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });
    });

    it('deve confirmar nova entrega com sucesso via API', () => {
      // Redespachar
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      }).then(() => {
        // Confirmar entrega
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/entrega`,
          headers: apiHeadersTestDb(),
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.status).to.equal('Entregue');
        });
      });
    });
  });

  describe('Fluxo Completo End-to-End - E2E UI Real', () => {
    it('deve executar fluxo completo via UI: marcar falha → redespachar → entregar', () => {
      // 1. Despachar pedido via API para setup
      cy.despacharPedidoApi(vendaUuid);

      // 2. Acessar painel de pedidos via UI
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');

      // 3. Marcar falha na entrega via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();

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
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
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
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...apiHeadersTestDb(),
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
