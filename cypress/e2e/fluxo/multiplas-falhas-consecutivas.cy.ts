/**
 * Testes E2E de Múltiplas Falhas Consecutivas
 * RN00XX — Regra de Negócio: 3 falhas de entrega consecutivas → cancelamento automático
 * 
 * Cobertura do fluxo de múltiplas falhas:
 * - Primeira falha de entrega
 * - Segunda falha de entrega (após redespacho)
 * - Terceira falha de entrega (após segundo redespacho)
 * - Cancelamento automático do pedido
 * - Notificação ao cliente sobre cancelamento
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('Múltiplas Falhas Consecutivas - Cancelamento Automático (UI Real)', () => {
  let vendaUuid: string;
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    
    // Setup: criar venda aprovada e despachar
    cy.criarVendaAprovadaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });
    
    cy.despacharPedidoApi(vendaUuid);
  });

  describe('Primeira Falha de Entrega', () => {
    it('deve permitir marcar primeira falha de entrega via UI', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .should('be.visible')
        .type('Endereço não encontrado');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .should('be.visible')
        .click();
      
      cy.contains(/falha registrada|entrega falhou/i).should('be.visible');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'FALHOU');
    });

    it('deve permitir redespachar após primeira falha via UI', () => {
      // Marcar primeira falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço não encontrado');
      
      // Solicitar reconfirmação de endereço
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
      
      // Cliente atualiza endereço via API (setup)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua Atualizada 1',
          numero: '111',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço 1',
        },
      }).then((res) => {
        const novoEnderecoUuid = res.body.uuid;
        
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
      
      // Admin redespacha via UI
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-redespachar-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/redespachado|em trânsito/i).should('be.visible');
    });
  });

  describe('Segunda Falha de Entrega', () => {
    beforeEach(() => {
      // Setup: primeira falha e redespacho
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço não encontrado');
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua Atualizada 1',
          numero: '111',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço 1',
        },
      }).then((res) => {
        const novoEnderecoUuid = res.body.uuid;
        
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
      
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      });
    });

    it('deve permitir marcar segunda falha de entrega via UI', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .should('be.visible')
        .type('Endereço ainda incorreto');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .should('be.visible')
        .click();
      
      cy.contains(/falha registrada|entrega falhou/i).should('be.visible');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'FALHOU');
    });

    it('deve exibir aviso de múltiplas falhas via UI', () => {
      // Marcar segunda falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço ainda incorreto');
      
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar aviso de múltiplas falhas
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="aviso-multiplas-falhas"]')
        .should('be.visible')
        .should('contain', '2ª falha');
    });

    it('deve permitir segundo redespacho via UI', () => {
      // Marcar segunda falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço ainda incorreto');
      
      // Solicitar reconfirmação
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
      
      // Cliente atualiza endereço via API (setup)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua Atualizada 2',
          numero: '222',
          complemento: '',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01320-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço 2',
        },
      }).then((res) => {
        const novoEnderecoUuid = res.body.uuid;
        
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
      
      // Admin redespacha via UI
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-redespachar-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/redespachado|em trânsito/i).should('be.visible');
    });
  });

  describe('Terceira Falha de Entrega - Cancelamento Automático', () => {
    beforeEach(() => {
      // Setup: duas falhas e dois redespachos
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço não encontrado');
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua Atualizada 1',
          numero: '111',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço 1',
        },
      }).then((res) => {
        const novoEnderecoUuid = res.body.uuid;
        
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
      
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      });
      
      // Segunda falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço ainda incorreto');
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
        headers: apiHeadersTestDb(),
      });
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua Atualizada 2',
          numero: '222',
          complemento: '',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01320-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'Endereço 2',
        },
      }).then((res) => {
        const novoEnderecoUuid = res.body.uuid;
        
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
      
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      });
    });

    it('deve permitir marcar terceira falha de entrega via UI', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .should('be.visible')
        .type('Endereço incorreto novamente');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .should('be.visible')
        .click();
      
      cy.contains(/falha registrada|entrega falhou/i).should('be.visible');
    });

    it('deve cancelar pedido automaticamente após terceira falha via API', () => {
      // Marcar terceira falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incorreto novamente');
      
      // Verificar cancelamento automático via API
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.body.status).to.equal('Cancelado');
        expect(res.body.motivoCancelamento).to.include('3 falhas consecutivas');
      });
    });

    it('deve impedir redespacho após cancelamento automático via API', () => {
      // Marcar terceira falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incorreto novamente');
      
      // Tentar redespachar pedido cancelado
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.erro).to.include('Pedido cancelado');
      });
    });

    it('deve notificar cliente sobre cancelamento via UI', () => {
      // Marcar terceira falha
      cy.marcarFalhaEntregaApi(vendaUuid, 'Endereço incorreto novamente');
      
      // Cliente verifica pedido
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar status cancelado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'Cancelado');
      
      // Verificar notificação de cancelamento
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-cancelamento-motivo"]')
        .should('be.visible')
        .should('contain', '3 falhas consecutivas');
    });

    it('deve exibir aviso crítico de múltiplas falhas antes da terceira via UI', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar aviso crítico antes de marcar terceira falha
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="aviso-critico-falhas"]')
        .should('be.visible')
        .should('contain', '3ª falha')
        .should('contain', 'cancelamento automático');
    });
  });

  describe('Fluxo Completo de 3 Falhas - E2E UI Real', () => {
    it('deve executar fluxo completo: 3 falhas → cancelamento automático', () => {
      // === FASE 1: Primeira falha ===
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .type('Endereço não encontrado');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .click();
      
      cy.contains(/falha registrada/i).should('be.visible');
      
      // Redespachar (setup via API para agilizar)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua 1',
          numero: '1',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01200-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'E1',
        },
      }).then((res) => {
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
          },
          body: { enderecoUuid: res.body.uuid },
        });
      });
      
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      });
      
      // === FASE 2: Segunda falha ===
      cy.visit('/admin/pedidos');
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .type('Endereço ainda incorreto');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .click();
      
      cy.contains(/falha registrada/i).should('be.visible');
      
      // Redespachar (setup via API)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersTestDb(),
        body: {
          logradouro: 'Rua 2',
          numero: '2',
          complemento: '',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01320-000',
          tipo: 'entrega',
          principal: false,
          apelido: 'E2',
        },
      }).then((res) => {
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
          },
          body: { enderecoUuid: res.body.uuid },
        });
      });
      
      cy.request({
        method: 'PUT',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
        headers: apiHeadersTestDb(),
      });
      
      // === FASE 3: Terceira falha → cancelamento ===
      cy.visit('/admin/pedidos');
      
      // Verificar aviso crítico
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="aviso-critico-falhas"]')
        .should('be.visible')
        .should('contain', 'cancelamento automático');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-falha-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="falha-entrega-motivo"]')
        .type('Endereço incorreto novamente');
      
      cy.get('[data-cy="btn-confirmar-falha"]')
        .click();
      
      cy.contains(/falha registrada/i).should('be.visible');
      
      // Verificar cancelamento
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Cancelado');
      
      // Verificar que botão de redespacho não aparece
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-redespachar-"]')
        .should('not.exist');
      
      // Cliente verifica cancelamento
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'Cancelado');
    });
  });
});
