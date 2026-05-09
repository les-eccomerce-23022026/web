/**
 * Testes E2E de Fluxo Completo Cross-Domain (Cliente + Admin)
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 * RF0040 — Solicitação de Troca · RF0044 — Autorização de Troca · RF0045 — Cupom de Troca
 * 
 * Cobertura do fluxo completo end-to-end:
 * - Cliente compra livro via UI
 * - Admin despacha pedido via UI
 * - Admin confirma entrega via UI
 * - Cliente solicita troca via UI
 * - Admin autoriza troca via UI
 * - Admin confirma recebimento do produto devolvido via UI
 * - Sistema gera cupom de troca automaticamente
 * - Cliente usa cupom de troca em nova compra via UI
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

import { apiHeadersTestDb } from '../../support/helpers/checkoutHelpers';

describe('Fluxo Completo Cross-Domain - Cliente Compra → Troca → Cupom (UI Real)', () => {
  let vendaUuid: string;
  let itemVendaUuid: string;
  let cupomTrocaCodigo: string;
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
  });

  describe('Fluxo Completo End-to-End - UI Real', () => {
    it('deve executar fluxo completo: cliente compra → admin despacha → admin entrega → cliente solicita troca → admin autoriza → admin confirma recebimento → cliente usa cupom', () => {
      // === FASE 1: Cliente Compra via UI ===
      cy.loginApi(emailCliente, senhaCliente);
      
      // Obter primeiro livro do catálogo
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        // Adicionar ao carrinho via UI
        cy.visit(`/livro/${livroUuid}`);
        cy.get('[data-cy="detalhes-livro-comprar-agora"]')
          .scrollIntoView()
          .should('be.visible')
          .click();
        
        // Ir para checkout
        cy.visit('/checkout');
        cy.wait('@pagamentoInfo', { timeout: 20000 });
        
        // Selecionar endereço
        cy.get('[data-cy^="checkout-address-item-"]')
          .first()
          .scrollIntoView()
          .click();
        
        // Calcular frete
        cy.get('[data-cy="checkout-freight-zip-input"]')
          .scrollIntoView()
          .clear()
          .type('01310100');
        
        cy.get('[data-cy="checkout-freight-calculate-button"]')
          .scrollIntoView()
          .click();
        
        cy.wait('@freteCotar', { timeout: 15000 });
        
        cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 })
          .first()
          .scrollIntoView()
          .click();
        
        // Selecionar cartão
        cy.get('[data-cy^="checkout-card-item-"]', { timeout: 10000 })
          .first()
          .scrollIntoView()
          .click();
        
        // Finalizar compra
        cy.get('[data-cy="checkout-finish-button"]')
          .scrollIntoView()
          .should('not.be.disabled')
          .click();
        
        // Verificar redirecionamento para pedido confirmado
        cy.url({ timeout: 15000 }).should('include', '/pedido-confirmado');
        
        // Obter vendaUuid da URL ou da UI
        cy.url().then((url) => {
          const match = url.match(/\/pedido-confirmado\?venda=([a-f0-9-]+)/);
          if (match) {
            vendaUuid = match[1];
          } else {
            // Fallback: obter via API
            cy.request({
              method: 'GET',
              url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas`,
              headers: apiHeadersTestDb(),
            }).then((res) => {
              vendaUuid = res.body[0].uuid;
              itemVendaUuid = res.body[0].itens[0].uuid;
            });
          }
        });
      });
      
      // === FASE 2: Admin Despacha via UI ===
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar e despachar pedido
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/despachado|em trânsito/i).should('be.visible');
      
      // === FASE 3: Admin Confirma Entrega via UI ===
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/entregue|entrega confirmada/i).should('be.visible');
      
      // === FASE 4: Cliente Solicita Troca via UI ===
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar no pedido para ver detalhes
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-detalhes-button"]')
        .scrollIntoView()
        .click();
      
      // Clicar em solicitar troca
      cy.get('[data-cy="pedido-solicitar-troca-button"]')
        .scrollIntoView()
        .click();
      
      // Preencher formulário de troca
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito de fabricação');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar sucesso
      cy.get('[data-cy="sucesso-troca"]', { timeout: 10000 })
        .should('be.visible');
      
      // === FASE 5: Admin Autoriza Troca via UI ===
      cy.loginAdminApi();
      cy.visit('/admin/trocas');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar e autorizar troca
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-autorizar-troca-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'autorizada');
      
      // === FASE 6: Admin Confirma Recebimento via UI ===
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-recebimento-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'recebido');
      
      // === FASE 7: Verificar Geração de Cupom via API ===
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/cupons`,
        headers: apiHeadersTestDb(),
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        
        // Encontrar cupom de troca
        const cupomTroca = res.body.find((c: { tipo: string }) => c.tipo === 'troca');
        expect(cupomTroca).to.exist;
        cupomTrocaCodigo = cupomTroca.codigo;
      });
      
      // === FASE 8: Cliente Usa Cupom em Nova Compra via UI ===
      cy.loginApi(emailCliente, senhaCliente);
      
      // Adicionar novo livro ao carrinho
      cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        cy.visit(`/livro/${livroUuid}`);
        cy.get('[data-cy="detalhes-livro-comprar-agora"]')
          .scrollIntoView()
          .click();
        
        // Ir para checkout
        cy.visit('/checkout');
        cy.wait('@pagamentoInfo', { timeout: 20000 });
        
        // Selecionar endereço e frete
        cy.get('[data-cy^="checkout-address-item-"]')
          .first()
          .scrollIntoView()
          .click();
        
        cy.get('[data-cy="checkout-freight-zip-input"]')
          .scrollIntoView()
          .clear()
          .type('01310100');
        
        cy.get('[data-cy="checkout-freight-calculate-button"]')
          .scrollIntoView()
          .click();
        
        cy.wait('@freteCotar', { timeout: 15000 });
        
        cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 })
          .first()
          .scrollIntoView()
          .click();
        
        // Aplicar cupom de troca
        cy.get('[data-cy="checkout-coupon-input"]')
          .scrollIntoView()
          .type(cupomTrocaCodigo);
        
        cy.get('[data-cy="checkout-coupon-apply-button"]')
          .scrollIntoView()
          .click();
        
        // Verificar que cupom foi aplicado
        cy.get(`[data-cy="checkout-coupon-${cupomTrocaCodigo}"]`, { timeout: 10000 })
          .should('be.visible');
        
        // Selecionar cartão
        cy.get('[data-cy^="checkout-card-item-"]', { timeout: 10000 })
          .first()
          .scrollIntoView()
          .click();
        
        // Finalizar compra com cupom
        cy.get('[data-cy="checkout-finish-button"]')
          .scrollIntoView()
          .should('not.be.disabled')
          .click();
        
        // Verificar redirecionamento para pedido confirmado
        cy.url({ timeout: 15000 }).should('include', '/pedido-confirmado');
      });
    });
  });

  describe('Fluxo Parcial - Cliente Compra → Admin Despacha → Admin Entrega', () => {
    it('deve executar fluxo parcial de compra até entrega via UI', () => {
      // Setup via API: criar venda aprovada
      cy.criarVendaAprovadaApi().then((dados) => {
        vendaUuid = dados.vendaUuid;
      });
      
      // Admin despacha via UI
      cy.loginAdminApi();
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/despachado|em trânsito/i).should('be.visible');
      
      // Admin confirma entrega via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('be.visible')
        .click();
      
      cy.contains(/entregue|entrega confirmada/i).should('be.visible');
      
      // Cliente verifica pedido entregue via UI
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('[data-cy^="pedido-card-"]')
        .find('[data-cy="pedido-status"]')
        .should('contain', 'Entregue');
    });
  });

  describe('Fluxo Parcial - Cliente Solicita Troca → Admin Autoriza → Admin Confirma Recebimento', () => {
    it('deve executar fluxo parcial de troca via UI', () => {
      // Setup via API: criar venda entregue
      cy.criarVendaAprovadaApi().then((dados) => {
        vendaUuid = dados.vendaUuid;
        itemVendaUuid = dados.itemVendaUuid;
      });
      
      cy.despacharPedidoApi(vendaUuid);
      cy.confirmarEntregaApi(vendaUuid);
      
      // Cliente solicita troca via UI
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      cy.get('[data-cy="sucesso-troca"]', { timeout: 10000 })
        .should('be.visible');
      
      // Admin autoriza troca via UI
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
      
      // Admin confirma recebimento via UI
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-recebimento-"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'recebido');
    });
  });
});
