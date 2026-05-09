/**
 * Testes E2E do Fluxo Admin - Trocas e Devoluções
 * RF0043 — Solicitação de Troca · RF0044 — Autorização de Troca · RF0045 — Cupom de Troca
 * 
 * Cobertura do fluxo de trocas:
 * - Cliente solicita troca de item/pedido
 * - Admin autoriza ou rejeita troca
 * - Admin confirma recebimento do produto devolvido
 * - Sistema gera cupom de troca automaticamente
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

describe('Fluxo Admin - Trocas e Devoluções', () => {
  let vendaUuid: string;
  let itemVendaUuid: string;

  beforeEach(() => {
    // Setup mínimo via API: criar venda aprovada
    cy.criarVendaAprovadaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
      itemVendaUuid = dados.itemVendaUuid;
    });

    // Despachar e entregar para criar pedido elegível para troca
    cy.despacharPedidoApi(vendaUuid);
    cy.confirmarEntregaApi(vendaUuid);

    // Login admin via API para estabelecer sessão
    cy.loginAdminApi();
  });

  describe('Listagem de Trocas (UI)', () => {
    it('deve acessar página de gerenciamento de trocas via UI', () => {
      cy.visit('/admin/trocas');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      cy.get('[data-cy="trocas-painel"]').should('exist');
    });
  });

  describe('Solicitação de Troca (Cliente) - Setup API', () => {
    it('deve permitir cliente solicitar troca de pedido entregue via API', () => {
      cy.solicitarTrocaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');
    });

    it('deve impedir solicitação de troca de pedido não entregue via API', () => {
      // Criar nova venda não entregue
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        const novoItemVendaUuid = dados.itemVendaUuid;
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${novaVendaUuid}/troca`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersTestDb(),
          },
          body: {
            motivo: 'Produto com defeito',
            itensUuids: [novoItemVendaUuid],
          },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });
  });

  describe('Autorização de Troca (Admin) - E2E UI Real', () => {
    beforeEach(() => {
      // Setup: solicitar troca via API
      cy.solicitarTrocaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');
    });

    it('deve autorizar solicitação de troca via UI', () => {
      cy.visit('/admin/trocas');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar a solicitação de troca e clicar em autorizar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-autorizar-troca-"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'autorizada');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'AUTORIZADA');
    });

    it('deve rejeitar solicitação de troca via UI', () => {
      // Solicitar nova troca para rejeitar
      cy.solicitarTrocaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');
      
      cy.visit('/admin/trocas');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar em rejeitar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-rejeitar-troca-"]')
        .should('be.visible')
        .click();
      
      // Preencher motivo (se houver modal)
      cy.get('[data-cy="troca-motivo-rejeicao"]', { timeout: 5000 })
        .should('be.visible')
        .type('Produto danificado');
      
      cy.get('[data-cy="btn-confirmar-rejeicao"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'rejeitada');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'REJEITADA');
    });

    it('deve impedir autorização de troca não solicitada via API', () => {
      // Criar venda sem solicitação de troca
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${novaVendaUuid}/troca/autorizar`,
          headers: apiHeadersTestDb(),
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });
  });

  describe('Confirmação de Recebimento e Geração de Cupom - E2E UI Real', () => {
    beforeEach(() => {
      // Setup: solicitar e autorizar troca
      cy.solicitarTrocaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');
      cy.autorizarTrocaApi(vendaUuid);
    });

    it('deve confirmar recebimento do produto devolvido via UI', () => {
      cy.visit('/admin/trocas');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar em confirmar recebimento
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-recebimento-"]')
        .should('be.visible')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'recebido');
      
      // Verificar status atualizado
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'FINALIZADA');
    });

    it('deve gerar cupom de troca automaticamente após confirmar recebimento via API', () => {
      // Confirmar recebimento via API
      cy.confirmarRecebimentoTrocaApi(vendaUuid);
      
      // Verificar se cupom foi criado via API
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/cupons`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        
        // Verificar se existe cupom de troca
        const cupomTroca = res.body.find((c: { tipo: string }) => c.tipo === 'troca');
        expect(cupomTroca).to.exist;
      });
    });

    it('deve impedir confirmação de recebimento de troca não autorizada via API', () => {
      // Criar venda sem autorização de troca
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${novaVendaUuid}/troca/confirmar-recebimento`,
          headers: apiHeadersTestDb(),
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });
  });
});
