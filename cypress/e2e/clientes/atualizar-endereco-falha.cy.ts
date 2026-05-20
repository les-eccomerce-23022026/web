/**
 * Testes E2E de Fluxo de Recuperação com Atualização de Endereço Real
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 * 
 * Cobertura do fluxo de recuperação quando a entrega falha:
 * - Cliente acessa "Meus Pedidos" → clicar em pedido com falha
 * - Cliente acessa "Meu Perfil" → cadastrar novo endereço
 * - Cliente seleciona novo endereço no pedido
 * - Admin redespacha pedido com novo endereço
 * - Nova tentativa de entrega com sucesso
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

import { apiHeadersBancoTestes } from '../../support/helpers/checkoutHelpers';

describe('Clientes — Falha ao Atualizar Endereço', () => {
  let vendaUuid: string;
  let novoEnderecoUuid: string;
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    
    // Setup mínimo via API: criar venda aprovada, despachar e marcar falha
    cy.criarVendaAprovadaViaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });
    
    cy.despacharPedidoViaApi(vendaUuid);
    cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço incompleto - número não encontrado');
    
    // Solicitar reconfirmação de endereço
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
      headers: apiHeadersBancoTestes(),
    });
  });

  describe('Acesso ao Pedido com Falha', () => {
    it('deve permitir cliente acessar pedido com falha', () => {
      // Login como cliente
      cy.visit('/login');
      cy.get('[data-cy="login-email-input"]').type(emailCliente);
      cy.get('[data-cy="login-senha-input"]').type(senhaCliente);
      cy.get('[data-cy="login-submit-button"]').click();
      
      // Acessar Meus Pedidos
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar que o pedido aparece na lista
      cy.contains(vendaUuid.split('-')[1].toUpperCase()).should('be.visible');
    });

    it('deve exibir status de falha no pedido', () => {
      cy.autenticarViaApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar status de falha
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'FALHOU');
    });
  });

  describe('Cadastro de Novo Endereço', () => {
    beforeEach(() => {
      cy.autenticarViaApi(emailCliente, senhaCliente);
    });

    it('deve permitir cliente cadastrar novo endereço', () => {
      cy.visit('/minha-conta');
      
      // Navegar para aba de endereços
      cy.get('[data-cy="tab-enderecos"]').click();
      
      // Clicar em adicionar novo endereço
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
      
      // Preencher formulário de endereço
      cy.get('[data-cy="endereco-logradouro-input"]')
        .should('be.visible')
        .type('Rua Corrigida');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .should('be.visible')
        .type('999');
      
      cy.get('[data-cy="endereco-complemento-input"]')
        .should('be.visible')
        .type('Apto 99');
      
      cy.get('[data-cy="endereco-bairro-input"]')
        .should('be.visible')
        .type('Jardins');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .should('be.visible')
        .type('01450-000');
      
      cy.get('[data-cy="endereco-cidade-input"]')
        .should('be.visible')
        .type('São Paulo');
      
      cy.get('[data-cy="endereco-estado-input"]')
        .should('be.visible')
        .select('SP');
      
      // Salvar endereço
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Endereço salvo');
      
      // Verificar que o endereço aparece na lista
      cy.contains('Rua Corrigida').should('be.visible');
    });

    it('deve impedir cadastro de endereço incompleto', () => {
      cy.visit('/minha-conta');
      
      cy.get('[data-cy="tab-enderecos"]').click();
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
      
      // Tentar salvar sem preencher campos obrigatórios
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar validação de campos obrigatórios
      cy.get('[data-cy="endereco-logradouro-input"]')
        .should('have.class', 'error');
    });
  });

  describe('Associação de Novo Endereço ao Pedido', () => {
    beforeEach(() => {
      cy.autenticarViaApi(emailCliente, senhaCliente);
      
      // Cadastrar novo endereço via API para setup
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersBancoTestes(),
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
          apelido: 'Endereço Corrigido',
        },
      }).then((res) => {
        novoEnderecoUuid = res.body.uuid;
      });
    });

    it('deve permitir cliente associar novo endereço ao pedido', () => {
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar no pedido para ver detalhes
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-detalhes-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar modal de detalhes
      cy.get('[data-cy="modal-detalhes-pedido"]', { timeout: 10000 })
        .should('be.visible');
      
      // Clicar em alterar endereço
      cy.get('[data-cy="pedido-alterar-endereco-button"]')
        .scrollIntoView()
        .click();
      
      // Selecionar novo endereço
      cy.get(`[data-cy="endereco-item-${novoEnderecoUuid}"]`)
        .scrollIntoView()
        .click();
      
      // Confirmar alteração
      cy.get('[data-cy="confirmar-alteracao-endereco-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Endereço atualizado');
      
      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
        headers: apiHeadersBancoTestes(),
      }).then((res) => {
        expect(res.body.status).to.equal('ENDEREÇO ATUALIZADO');
      });
    });
  });

  describe('Fluxo Completo de Recuperação - E2E UI Real', () => {
    it('deve executar fluxo completo: cliente cadastra endereço → admin redespacha → entrega com sucesso', () => {
      // 1. Cliente cadastra novo endereço
      cy.autenticarViaApi(emailCliente, senhaCliente);
      cy.visit('/minha-conta');
      
      cy.get('[data-cy="tab-enderecos"]').click();
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
      
      cy.get('[data-cy="endereco-logradouro-input"]').type('Rua Final');
      cy.get('[data-cy="endereco-numero-input"]').type('666');
      cy.get('[data-cy="endereco-bairro-input"]').type('Consolação');
      cy.get('[data-cy="endereco-cep-input"]').type('01301-000');
      cy.get('[data-cy="endereco-cidade-input"]').type('São Paulo');
      cy.get('[data-cy="endereco-estado-input"]').select('SP');
      
      cy.get('[data-cy="endereco-submit-button"]').scrollIntoView().click();
      
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Endereço salvo');
      
      // Obter UUID do novo endereço via API
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
        headers: apiHeadersBancoTestes(),
      }).then((res) => {
        const enderecoCorrigido = res.body.find((e: { apelido: string }) => e.apelido === 'Rua Final');
        novoEnderecoUuid = enderecoCorrigido.uuid;
        
        // 2. Associar novo endereço ao pedido via API (simulando ação)
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...apiHeadersBancoTestes(),
          },
          body: {
            enderecoUuid: novoEnderecoUuid,
          },
        });
      });
      
      // 3. Admin redespacha pedido
      cy.autenticarAdministradorViaApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-redespachar-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/redespachado|em trânsito/i).should('be.visible');
      
      // 4. Admin confirma nova entrega
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/entregue|entrega confirmada/i).should('be.visible');
      
      // 5. Verificar status final
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
      
      // 6. Cliente confirma recebimento
      cy.autenticarViaApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'Entregue');
    });
  });
});
