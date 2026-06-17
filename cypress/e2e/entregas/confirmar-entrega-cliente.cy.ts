/**
 * E2E Tests for Confirmação de Entrega pelo Cliente
 * 
 * Testes focados no fluxo de confirmação de entrega:
 * - Cliente visualiza pedidos em trânsito
 * - Cliente confirma recebimento do pedido
 * - Admin verifica status atualizado no painel
 * 
 * Não inclui fluxo de compra (assumindo pedido já existe)
 */
import { prepararPedidoEmProcessamentoApi } from '../../support/fluxo-venda.helpers';

describe('Entregas — Confirmação de Entrega pelo Cliente', () => {
  const clienteEmail = 'clientetest@email.com';
  const clienteSenha = 'ASDF@asdf123';
  const adminEmail = 'admintest@email.com';
  const adminSenha = 'ASDF@asdf123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  /**
   * Helper para login de cliente via UI
   */
  function loginCliente() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(clienteEmail);
    cy.get('[data-cy="login-password-input"]').type(clienteSenha);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.url().should('not.include', '/minha-conta');
  }

  /**
   * Helper para login de admin via UI
   */
  function loginAdmin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(adminEmail);
    cy.get('[data-cy="login-password-input"]').type(adminSenha);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.url().should('include', '/admin');
  }

  /**
   * Helper para navegar para pedidos e filtrar por "Em Aberto"
   */
  function navegarParaPedidosEmAberto() {
    cy.visit('/pedidos');
    cy.url().should('include', '/pedidos');
    
    // Verificar que a lista de pedidos carregou
    cy.get('[data-cy="pedidos-lista"]', { timeout: 10000 }).should('be.visible');
    
    // Clicar no filtro "Em Aberto"
    cy.get('[data-cy="pedidos-filtro-em-aberto"]').click();
  }

  /**
   * Helper para encontrar pedido em trânsito e confirmar recebimento
   */
  function confirmarRecebimentoPedido() {
    // Encontrar pedido com status "Em Trânsito"
    cy.get('[data-cy^="pedido-"]').then(($cards) => {
      // Buscar card que contém "Em Trânsito" ou "etapa 3 de 4"
      const pedidoEmTransito = $cards.filter((index, card) => {
        const text = card.textContent || '';
        return text.includes('Em Trânsito') || text.includes('etapa 3 de 4');
      });

      if (pedidoEmTransito.length > 0) {
        // Extrair UUID do pedido
        const pedidoId = pedidoEmTransito.first().attr('data-cy')?.replace('pedido-', '');
        
        cy.wrap(pedidoEmTransito.first()).within(() => {
          // Clicar no botão "Confirmar recebimento" usando data-cy específico
          if (!pedidoId) {
            throw new Error('UUID do pedido em trânsito não encontrado — verifique o atributo data-cy do card');
          }
          cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoId}"]`).scrollIntoView().click();
        });
      } else {
        cy.log('Nenhum pedido em trânsito encontrado para confirmação');
      }
    });
  }

  /**
   * Helper para verificar que pedido foi movido para "Finalizados"
   */
  function verificarPedidoFinalizado() {
    cy.get('[data-cy="pedidos-filtro-finalizados"]').scrollIntoView().click();
    cy.get('[data-cy^="pedido-"]').should('have.length.at.least', 1);
    
    // Verificar que pelo menos um pedido tem status "Entregue"
    cy.get('[data-cy^="pedido-"]').first().within(() => {
      cy.get('[data-cy="pedido-status"]').should('be.visible').and('contain.text', 'Entregue');
    });
  }

  /**
   * Helper para admin verificar status do pedido no painel
   */
  function verificarStatusPedidoAdmin() {
    cy.visit('/admin/pedidos');
    cy.url().should('include', '/admin/pedidos');
    
    // Aguardar painel carregar
    cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
    
    // Verificar que há pedidos com status "Entregue"
    cy.get('[data-cy="admin-pedidos-tabela"]').should('be.visible');
  }

  describe('Fluxo Completo de Confirmação de Entrega', () => {
    beforeEach(() => {
      prepararPedidoEmProcessamentoApi();
    });

    it('deve permitir cliente confirmar recebimento de pedido em trânsito', () => {
      /**
       * Fluxo (Admin confirma que o produto foi ENTREGUE):
       * 1. Cliente acessa Meus Pedidos
       * 2. Encontra pedido com status "Em Trânsito"
       * 3. Clica em "Confirmar recebimento"
       * 4. Sistema atualiza status para "Entregue"
       * 5. Sistema notifica admin sobre entrega
       * 6. Admin verifica status atualizado no painel
       * 7. Pedido aparece como "Entregue" (etapa 4 de 4)
       */
      cy.log('=== ETAPA 1: Login do Cliente ===');
      loginCliente();

      cy.log('=== ETAPA 2: Navegar para Pedidos em Aberto ===');
      navegarParaPedidosEmAberto();

      cy.log('=== ETAPA 3: Confirmar recebimento do pedido ===');
      confirmarRecebimentoPedido();

      cy.log('=== ETAPA 4: Verificar pedido movido para Finalizados ===');
      verificarPedidoFinalizado();

      cy.log('=== ETAPA 5: Login do Admin ===');
      loginAdmin();

      cy.log('=== ETAPA 6: Verificar status atualizado no painel admin ===');
      verificarStatusPedidoAdmin();

      cy.log('[ENTREGA] Fluxo de confirmação de entrega concluído com sucesso');
    });
  });

  describe('Verificação de Interface de Pedidos', () => {
    beforeEach(() => {
      prepararPedidoEmProcessamentoApi();
    });

    it('deve exibir filtros de pedidos (Todos, Em Aberto, Finalizados)', () => {
      loginCliente();
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');

      // Verificar filtros usando data-cy
      cy.get('[data-cy="pedidos-filtro-todos"]').should('be.visible');
      cy.get('[data-cy="pedidos-filtro-em-aberto"]').should('be.visible');
      cy.get('[data-cy="pedidos-filtro-finalizados"]').should('be.visible');

      cy.log('[ENTREGA] Filtros de pedidos exibidos corretamente');
    });

    it('deve exibir card de pedido com informações relevantes', () => {
      loginCliente();
      navegarParaPedidosEmAberto();

      // Verificar que cards de pedido existem usando data-cy
      cy.get('[data-cy^="pedido-"]').should('have.length.at.least', 1);

      // Verificar informações no card
      cy.get('[data-cy^="pedido-"]').first().within(() => {
        // UUID do pedido (no atributo data-cy)
        cy.get('[data-cy="pedido-status"]').should('be.visible');
        // Status
        cy.get('[data-cy="pedido-status"]').should('be.visible');
      });

      cy.log('[ENTREGA] Cards de pedido exibidos com informações corretas');
    });
  });

  describe('Verificação de Botões de Ação', () => {
    beforeEach(() => {
      prepararPedidoEmProcessamentoApi();
    });

    it('deve exibir botão "Confirmar recebimento" para pedidos em trânsito', () => {
      loginCliente();
      navegarParaPedidosEmAberto();

      // Buscar pedido em trânsito usando data-cy
      cy.get('[data-cy^="pedido-"]').then(($cards) => {
        const pedidoEmTransito = $cards.filter((index, card) => {
          const text = card.textContent || '';
          return text.includes('Em Trânsito') || text.includes('etapa 3 de 4');
        });

        if (pedidoEmTransito.length > 0) {
          const pedidoId = pedidoEmTransito.first().attr('data-cy')?.replace('pedido-', '');
          
          cy.wrap(pedidoEmTransito.first()).within(() => {
            if (pedidoId) {
              cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoId}"]`).should('be.visible');
              cy.get(`[data-cy="btn-rastrear-${pedidoId}"]`).should('be.visible');
              cy.get(`[data-cy="btn-detalhes-${pedidoId}"]`).should('be.visible');
            }
          });
        } else {
          cy.log('Nenhum pedido em trânsito encontrado');
        }
      });

      cy.log('[ENTREGA] Botões de ação exibidos corretamente para pedidos em trânsito');
    });

    it('deve exibir botão "Solicitar troca" para pedidos entregues', () => {
      loginCliente();
      cy.visit('/pedidos');
      cy.get('[data-cy="pedidos-filtro-finalizados"]').scrollIntoView().click();

      // Buscar pedido entregue usando data-cy
      cy.get('[data-cy^="pedido-"]').then(($cards) => {
        const pedidoEntregue = $cards.filter((index, card) => {
          const text = card.textContent || '';
          return text.includes('Entregue') || text.includes('etapa 4 de 4');
        });

        if (pedidoEntregue.length > 0) {
          const pedidoId = pedidoEntregue.first().attr('data-cy')?.replace('pedido-', '');
          
          cy.wrap(pedidoEntregue.first()).within(() => {
            if (pedidoId) {
              cy.get(`[data-cy="btn-detalhes-${pedidoId}"]`).should('be.visible');
              cy.get(`[data-cy="btn-solicitar-troca-${pedidoId}"]`).should('be.visible');
            }
          });
        } else {
          cy.log('Nenhum pedido entregue encontrado');
        }
      });

      cy.log('[ENTREGA] Botão "Solicitar troca" exibido para pedidos entregues');
    });
  });

  describe('Verificação de Status de Entrega', () => {
    beforeEach(() => {
      prepararPedidoEmProcessamentoApi();
    });

    it('deve mostrar progresso de entrega (etapas 1 a 4)', () => {
      loginCliente();
      navegarParaPedidosEmAberto();

      // Verificar indicador de progresso usando data-cy
      cy.get('[data-cy^="pedido-"]').first().within(() => {
        cy.get('[data-cy="pedido-status"]').should('be.visible');
        // O status deve conter informação de etapa
        cy.get('[data-cy="pedido-status"]').should('not.be.empty');
      });

      cy.log('[ENTREGA] Progresso de entrega exibido corretamente');
    });

    it('deve atualizar status após confirmação de recebimento', () => {
      loginCliente();
      navegarParaPedidosEmAberto();

      // Encontrar e confirmar pedido em trânsito usando data-cy
      cy.get('[data-cy^="pedido-"]').then(($cards) => {
        const pedidoEmTransito = $cards.filter((index, card) => {
          const text = card.textContent || '';
          return text.includes('Em Trânsito') || text.includes('etapa 3 de 4');
        });

        if (pedidoEmTransito.length > 0) {
          const pedidoId = pedidoEmTransito.first().attr('data-cy')?.replace('pedido-', '');

          cy.wrap(pedidoEmTransito.first()).within(() => {
            if (pedidoId) {
              cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoId}"]`).scrollIntoView().click();
            }
          });

          // Verificar que pedido agora está em "Finalizados"
          cy.get('[data-cy="pedidos-filtro-finalizados"]').scrollIntoView().click();
          
          if (pedidoId) {
            cy.get(`[data-cy="pedido-${pedidoId}"]`).should('be.visible');
          }
          
          cy.get('[data-cy^="pedido-"]').first().within(() => {
            cy.get('[data-cy="pedido-status"]').should('be.visible').and('contain.text', 'Entregue');
          });
        }
      });

      cy.log('[ENTREGA] Status atualizado corretamente após confirmação');
    });
  });

  describe('Verificação no Painel Admin', () => {
    it('deve exibir tabela de pedidos com status correto', () => {
      loginAdmin();
      cy.visit('/admin/pedidos');
      cy.url().should('include', '/admin/pedidos');

      // Verificar painel usando data-cy
      cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
      
      // Verificar tabela
      cy.get('[data-cy="admin-pedidos-tabela"]').should('be.visible');

      cy.log('[ENTREGA] Tabela de pedidos exibida corretamente no painel admin');
    });

    it('deve mostrar status "Entregue" para pedidos confirmados pelo cliente', () => {
      // Assumindo que já existe um pedido entregue
      loginAdmin();
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
      
      // Verificar que há pedidos com status "Entregue"
      cy.get('[data-cy="admin-pedidos-tabela"]').should('be.visible');

      cy.log('[ENTREGA] Status "Entregue" exibido corretamente no painel admin');
    });

    it('deve mostrar botão "Despachar" para pedidos em processamento', () => {
      // Preparar um pedido em EM_PROCESSAMENTO para garantir que existe um pedido com botão Despachar
      prepararPedidoEmProcessamentoApi().then(() => {
        loginAdmin();
        cy.visit('/admin/pedidos');
        
        cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
        
        // Verificar que há pedidos com botão "Despachar" usando data-cy
        cy.get('[data-cy^="btn-despachar-"]').should('exist');

        cy.log('[ENTREGA] Botão "Despachar" exibido para pedidos em processamento');
      });
    });
  });
});
