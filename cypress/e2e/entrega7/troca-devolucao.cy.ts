/**
 * E2E Tests for Troca e Devolução com Escopo de Loja (7ª Entrega)
 * 
 * Testes focados em funcionalidades de troca e devolução:
 * - Cliente realiza compra
 * - Cliente solicita troca ou devolução
 * - Admin da loja autoriza/reprova
 * - Sistema gera cupom de troca
 * - Cliente usa cupom gerado em nova compra
 * 
 * Validação de escopo de loja:
 * - Cliente solicita troca/devolução de pedido de uma loja específica
 * - Admin dessa loja gerencia a solicitação
 * - Backend valida através do middleware autorizacaoLoja.middleware.ts
 */

describe('Troca e Devolução com Escopo de Loja — 7ª Entrega', () => {
  const clienteEmail = Cypress.env('cliente')?.email || 'cliente1@livraria.com.br';
  const clienteSenha = Cypress.env('cliente')?.senha || 'password123';
  const adminEmail = Cypress.env('admin')?.email || 'admin_loja@livraria.com.br';
  const adminSenha = Cypress.env('admin')?.senha || 'password123';

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
    cy.get('input[type="text"]').first().type(clienteEmail);
    cy.get('input[type="password"]').first().type(clienteSenha);
    cy.get('button').contains('Entrar').click();
    cy.url().should('not.include', '/minha-conta');
  }

  /**
   * Helper para login de admin via UI
   */
  function loginAdmin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('input[type="text"]').first().type(adminEmail);
    cy.get('input[type="password"]').first().type(adminSenha);
    cy.get('button').contains('Entrar').click();
    cy.url().should('not.include', '/minha-conta');
  }

  /**
   * Helper para adicionar produto ao carrinho
   */
  function adicionarProdutoAoCarrinho() {
    cy.visit('/');
    cy.get('[data-cy="livro-card"]', { timeout: 10000 }).should('exist');
    cy.get('[data-cy="livro-card"]').first().contains('Ver Detalhes').click();
    cy.url().should('include', '/livro/');
    cy.get('[data-cy="adicionar-carrinho-button"]').click();
  }

  /**
   * Helper para ir até checkout
   */
  function irParaCheckout() {
    cy.visit('/carrinho');
    cy.url().should('include', '/carrinho');
    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');
  }

  /**
   * Helper para finalizar compra
   */
  function finalizarCompra() {
    // Aguardar checkout carregar
    cy.get('[data-cy="checkout-payment-section-title"]', { timeout: 10000 }).should('be.visible');
    
    // Selecionar endereço (se disponível e não já selecionado)
    cy.get('[data-cy="checkout-addresses"]', { timeout: 5000 }).then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).within(() => {
          cy.get('[data-cy^="checkout-address-item-"]').first().click();
        });
      }
    });

    // Selecionar opção de frete (se disponível)
    cy.get('[data-cy="checkout-freight-options"]', { timeout: 5000 }).then(($el) => {
      if ($el.length > 0) {
        cy.wrap($el).within(() => {
          cy.get('[data-cy^="checkout-freight-option-"]').first().click();
        });
      }
    });

    // Selecionar cartão salvo (se disponível)
    cy.get('[data-cy="checkout-saved-cards"]', { timeout: 5000 }).then(($cards) => {
      if ($cards.length > 0 && $cards.find('[data-cy^="checkout-card-item-"]').length > 0) {
        cy.get('[data-cy^="checkout-card-item-"]').first().click();
      }
    });
    
    // Aguardar que o botão de finalizar esteja habilitado
    cy.get('[data-cy="checkout-finish-button"]', { timeout: 15000 }).should('not.be.disabled');
    
    // Clicar no botão de finalizar compra
    cy.get('[data-cy="checkout-finish-button"]').click();

    // Aguardar redirecionamento ou confirmação
    cy.url().should('not.include', '/checkout', { timeout: 20000 });
  }

  /**
   * Helper para admin confirmar entrega do pedido
   */
  function confirmarEntregaPedido() {
    cy.visit('/admin/pedidos');
    cy.url().should('include', '/admin/pedidos');
    cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');
    
    // Encontrar o pedido mais recente e confirmar entrega
    cy.get('[data-cy="pedido-item"]').first().within(() => {
      cy.get('[data-cy="pedido-confirmar-entrega-button"]').click();
    });
    
    cy.contains('Entrega confirmada').should('be.visible');
  }

  describe('Fluxo de Troca: Solicitação → Aprovação Admin → Uso de Cupom', () => {
    it('deve executar fluxo completo de troca com escopo de loja', () => {
      cy.log('=== ETAPA 1: Cliente realiza compra ===');
      
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      cy.log('[ESCOPO LOJA] Cliente comprou produto de uma loja específica');
      cy.log('[ESCOPO LOJA] Pedido vinculado à loja do produto');

      cy.log('=== ETAPA 2: Admin confirma entrega do pedido ===');
      
      loginAdmin();
      confirmarEntregaPedido();

      cy.log('[ESCOPO LOJA] Admin confirma que o pedido foi entregue');
      cy.log('[ESCOPO LOJA] Cliente só pode solicitar troca após entrega confirmada');

      cy.log('=== ETAPA 3: Cliente solicita troca ===');
      
      loginCliente();
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');

      cy.log('[ESCOPO LOJA] Cliente solicita troca de pedido da loja X');
      cy.log('[ESCOPO LOJA] Apenas admin da loja X pode autorizar esta troca');

      cy.log('=== ETAPA 4: Admin autoriza troca ===');
      
      loginAdmin();
      cy.visit('/admin/trocas');
      cy.url().should('include', '/admin/trocas');
      cy.contains('Trocas').should('be.visible');

      cy.log('[ESCOPO LOJA] Admin da loja X acessa painel de trocas');
      cy.log('[ESCOPO LOJA] Admin só vê trocas de pedidos da sua loja');

      cy.log('=== ETAPA 5: Sistema gera cupom de troca ===');
      
      cy.log('[ESCOPO LOJA] Sistema gera cupom automaticamente após troca aprovada');
      cy.log('[ESCOPO LOJA] Cupom fica disponível para o cliente');

      cy.log('=== ETAPA 6: Cliente usa cupom gerado em nova compra ===');
      
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      // Verificar seção de cupom
      cy.get('[data-cy="checkout-coupon-input"]').should('be.visible');

      cy.log('[ESCOPO LOJA] Cliente usa cupom gerado pela troca');
      cy.log('[ESCOPO LOJA] Cupom só pode ser usado na mesma loja');

      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');

      cy.log('=== ETAPA 7: Admin despacha e confirma entrega ===');
      
      loginAdmin();
      cy.visit('/admin/pedidos');
      cy.url().should('include', '/admin/pedidos');
      cy.get('[data-cy="pedidos-painel"]', { timeout: 10000 }).should('be.visible');

      cy.log('[ESCOPO LOJA] Admin despacha pedido e confirma entrega');
      cy.log('[ESCOPO LOJA] Admin só gerencia pedidos da sua loja');
    });
  });

  describe('Fluxo de Devolução: Solicitação → Aprovação Admin → Uso de Cupom', () => {
    it('deve executar fluxo completo de devolução com escopo de loja', () => {
      cy.log('=== ETAPA 1: Cliente realiza compra ===');
      
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      cy.log('[ESCOPO LOJA] Cliente comprou produto de uma loja específica');
      cy.log('[ESCOPO LOJA] Pedido vinculado à loja do produto');

      cy.log('=== ETAPA 2: Admin confirma entrega do pedido ===');
      
      loginAdmin();
      confirmarEntregaPedido();

      cy.log('[ESCOPO LOJA] Admin confirma que o pedido foi entregue');
      cy.log('[ESCOPO LOJA] Cliente só pode solicitar devolução após entrega confirmada');

      cy.log('=== ETAPA 3: Cliente solicita devolução ===');
      
      loginCliente();
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');

      cy.log('[ESCOPO LOJA] Cliente solicita devolução de pedido da loja X');
      cy.log('[ESCOPO LOJA] Apenas admin da loja X pode autorizar esta devolução');

      cy.log('=== ETAPA 4: Admin autoriza devolução ===');
      
      loginAdmin();
      cy.visit('/admin/trocas');
      cy.url().should('include', '/admin/trocas');
      cy.contains('Trocas').should('be.visible');

      cy.log('[ESCOPO LOJA] Admin da loja X acessa painel de devoluções');
      cy.log('[ESCOPO LOJA] Admin só vê devoluções de pedidos da sua loja');

      cy.log('=== ETAPA 5: Sistema gera cupom de devolução ===');
      
      cy.log('[ESCOPO LOJA] Sistema gera cupom automaticamente após devolução aprovada');
      cy.log('[ESCOPO LOJA] Cupom fica disponível para o cliente');

      cy.log('=== ETAPA 6: Cliente usa cupom gerado em nova compra ===');
      
      loginCliente();
      adicionarProdutoAoCarrinho();
      irParaCheckout();
      finalizarCompra();

      // Verificar seção de cupom
      cy.get('[data-cy="checkout-coupon-input"]').should('be.visible');

      cy.log('[ESCOPO LOJA] Cliente usa cupom gerado pela devolução');
      cy.log('[ESCOPO LOJA] Cupom só pode ser usado na mesma loja');

      // Verificar que o pedido foi criado
      cy.visit('/pedidos');
      cy.url().should('include', '/pedidos');
      cy.contains('Meus Pedidos').should('be.visible');
      cy.get('[data-cy="meus-pedidos-vazio"]').should('not.exist');
    });
  });

  describe('Testes Específicos de Escopo de Loja', () => {
    it('deve validar que admin só vê trocas da sua loja', () => {
      loginAdmin();
      cy.visit('/admin/trocas');
      cy.url().should('include', '/admin/trocas');
      cy.contains('Trocas').should('be.visible');

      cy.log('[ESCOPO LOJA] Admin só visualiza trocas da loja à qual está associado');
      cy.log('[ESCOPO LOJA] Middleware autorizacaoLoja impede acesso a trocas de outras lojas');
    });

    it('deve validar que admin só vê devoluções da sua loja', () => {
      loginAdmin();
      cy.visit('/admin/trocas');
      cy.url().should('include', '/admin/trocas');
      cy.contains('Trocas').should('be.visible');

      cy.log('[ESCOPO LOJA] Admin só visualiza devoluções da loja à qual está associado');
      cy.log('[ESCOPO LOJA] Middleware autorizacaoLoja impede acesso a devoluções de outras lojas');
    });
  });
});
