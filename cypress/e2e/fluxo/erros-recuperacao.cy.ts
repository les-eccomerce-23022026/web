/**
 * Testes E2E de Cenários de Erro e Recuperação
 * 
 * Cobertura de cenários de erro e recuperação:
 * - Erro de rede durante solicitação de troca
 * - Timeout durante despacho
 * - Sessão expirada durante ação admin
 * - Conflito de edição (2 admins tentando despachar mesmo pedido)
 * 
 * Estratégia: E2E UI real com simulação de erros via cy.intercept
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('Cenários de Erro e Recuperação (UI Real)', () => {
  let vendaUuid: string;
  let itemVendaUuid: string;
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    
    // Setup: criar venda entregue para testes de troca
    cy.criarVendaAprovadaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
      itemVendaUuid = dados.itemVendaUuid;
    });
    
    cy.despacharPedidoApi(vendaUuid);
    cy.confirmarEntregaApi(vendaUuid);
  });

  describe('Erro de Rede Durante Solicitação de Troca', () => {
    it('deve exibir erro de rede e permitir retry', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito');
      
      // Simular erro de rede
      cy.intercept('POST', '**/vendas/*/troca', {
        forceNetworkError: true,
      }).as('solicitarTrocaErro');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      cy.wait('@solicitarTrocaErro');
      
      // Verificar mensagem de erro de rede
      cy.get('[data-cy="erro-rede"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Erro de conexão');
      
      // Remover intercept e tentar novamente
      cy.intercept('POST', '**/vendas/*/troca').as('solicitarTrocaRetry');
      
      cy.get('[data-cy="btn-tentar-novamente"]')
        .scrollIntoView()
        .click();
      
      cy.wait('@solicitarTrocaRetry');
      
      // Verificar sucesso
      cy.get('[data-cy="sucesso-troca"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('deve exibir erro de servidor 500', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito');
      
      // Simular erro 500
      cy.intercept('POST', '**/vendas/*/troca', {
        statusCode: 500,
        body: { erro: 'Erro interno do servidor' },
      }).as('solicitarTroca500');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      cy.wait('@solicitarTroca500');
      
      // Verificar mensagem de erro
      cy.get('[data-cy="erro-troca"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Erro ao processar');
    });
  });

  describe('Timeout Durante Despacho', () => {
    it('deve exibir mensagem de timeout e permitir retry', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Criar nova venda para teste
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        // Simular timeout
        cy.intercept('PUT', `**/admin/pedidos/${novaVendaUuid}/despachar`, {
          delay: 30000, // 30 segundos de delay
        }).as('despacharTimeout');
        
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('be.visible')
          .click();
        
        // Verificar indicador de loading
        cy.get('[data-cy="loading-indicator"]', { timeout: 5000 })
          .should('be.visible');
        
        // Cancelar operação
        cy.get('[data-cy="btn-cancelar-operacao"]')
          .scrollIntoView()
          .click();
        
        // Verificar que o pedido ainda não foi despachado
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy="status-badge"]')
          .should('not.contain', 'Em Trânsito');
      });
    });
  });

  describe('Sessão Expirada Durante Ação Admin', () => {
    it('deve redirecionar para login quando sessão expira', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Simular sessão expirada interceptando requisições
      cy.intercept('PUT', '**/admin/pedidos/*/despachar', {
        statusCode: 401,
        body: { erro: 'Sessão expirada' },
      }).as('sessaoExpirada');
      
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('be.visible')
          .click();
        
        cy.wait('@sessaoExpirada');
        
        // Verificar redirecionamento para login
        cy.url({ timeout: 10000 }).should('include', '/login');
        
        // Verificar mensagem de sessão expirada
        cy.get('[data-cy="sessao-expirada-mensagem"]', { timeout: 5000 })
          .should('be.visible')
          .should('contain', 'Sessão expirada');
      });
    });

    it('deve permitir login novamente após sessão expirar', () => {
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Simular sessão expirada
      cy.intercept('PUT', '**/admin/pedidos/*/despachar', {
        statusCode: 401,
        body: { erro: 'Sessão expirada' },
      }).as('sessaoExpirada');
      
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('be.visible')
          .click();
        
        cy.wait('@sessaoExpirada');
        
        // Fazer login novamente
        const emailAdmin = Cypress.env('adminEmail') || 'admin@les.com.br';
        const senhaAdmin = Cypress.env('adminSenha') || '@Admin123#';
        
        cy.get('[data-cy="login-email-input"]')
          .type(emailAdmin);
        
        cy.get('[data-cy="login-senha-input"]')
          .type(senhaAdmin);
        
        cy.get('[data-cy="login-submit-button"]')
          .click();
        
        // Verificar redirecionamento para admin
        cy.url({ timeout: 10000 }).should('include', '/admin');
        
        // Tentar despachar novamente
        cy.visit('/admin/pedidos');
        cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
        
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('be.visible')
          .click();
        
        cy.contains(/despachado|em trânsito/i).should('be.visible');
      });
    });
  });

  describe('Conflito de Edição (2 Admins)', () => {
    it('deve impedir despacho simultâneo do mesmo pedido', () => {
      // Setup: criar venda aprovada
      cy.criarVendaAprovadaApi().then((dados) => {
        const novaVendaUuid = dados.vendaUuid;
        
        // Admin 1 despacha
        cy.loginAdminApi();
        cy.visit('/admin/pedidos');
        cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
        
        cy.contains(novaVendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy^="btn-despachar-"]')
          .should('be.visible')
          .click();
        
        cy.contains(/despachado|em trânsito/i).should('be.visible');
        
        // Admin 2 tenta despachar o mesmo pedido (simulado via API)
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${novaVendaUuid}/despachar`,
          headers: apiHeadersTestDb(),
          failOnStatusCode: false,
        }).then((res) => {
          // Verificar erro de conflito
          expect(res.status).to.equal(409);
          expect(res.body.erro).to.include('já foi despachado');
        });
      });
    });

    it('deve impedir autorização de troca simultânea', () => {
      // Setup: solicitar troca
      cy.solicitarTrocaApi(vendaUuid, itemVendaUuid, 'Produto com defeito');
      
      // Admin 1 autoriza
      cy.loginAdminApi();
      cy.visit('/admin/trocas');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-autorizar-troca-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'autorizada');
      
      // Admin 2 tenta autorizar a mesma troca (simulado via API)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/troca/autorizar`,
        headers: apiHeadersTestDb(),
        failOnStatusCode: false,
      }).then((res) => {
        // Verificar erro de conflito
        expect(res.status).to.equal(409);
        expect(res.body.erro).to.include('já foi autorizada');
      });
    });
  });

  describe('Recuperação Após Erro de Validação', () => {
    it('deve permitir corrigir formulário após erro de validação', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      // Tentar solicitar sem motivo
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro
      cy.get('[data-cy="erro-motivo-obrigatorio"]', { timeout: 5000 })
        .should('be.visible');
      
      // Corrigir formulário
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito de fabricação');
      
      // Tentar novamente
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar sucesso
      cy.get('[data-cy="sucesso-troca"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('deve permitir corrigir endereço após erro de validação', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/minha-conta');
      
      cy.get('[data-cy="tab-enderecos"]').click();
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
      
      // Tentar salvar sem campos obrigatórios
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro
      cy.get('[data-cy="endereco-logradouro-input"]')
        .should('have.class', 'error');
      
      // Corrigir formulário
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Corrigida');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01310-100');
      
      cy.get('[data-cy="endereco-cidade-input"]')
        .type('São Paulo');
      
      cy.get('[data-cy="endereco-estado-input"]')
        .select('SP');
      
      // Tentar novamente
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar sucesso
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Endereço salvo');
    });
  });

  describe('Comportamento de Loading e Estado', () => {
    it('deve desabilitar botão durante requisição', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito');
      
      // Simular delay
      cy.intercept('POST', '**/vendas/*/troca', {
        delay: 2000,
      }).as('solicitarTrocaDelay');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar que botão está desabilitado
      cy.get('[data-cy="btn-solicitar-troca"]')
        .should('be.disabled');
      
      // Verificar indicador de loading
      cy.get('[data-cy="btn-enviando"]')
        .should('be.visible');
      
      cy.wait('@solicitarTrocaDelay');
      
      // Verificar que botão foi reabilitado
      cy.get('[data-cy="btn-solicitar-troca"]')
        .should('not.be.disabled');
    });

    it('deve exibir loading enquanto carrega dados', () => {
      cy.loginApi(emailCliente, senhaCliente);
      
      // Simular delay na resposta
      cy.intercept('GET', '**/vendas', {
        delay: 1000,
      }).as('carregarPedidos');
      
      cy.visit('/pedidos');
      
      // Verificar indicador de loading
      cy.get('[data-cy="loading"]')
        .should('be.visible');
      
      cy.wait('@carregarPedidos');
      
      // Verificar que loading desapareceu
      cy.get('[data-cy="loading"]')
        .should('not.exist');
    });
  });
});
