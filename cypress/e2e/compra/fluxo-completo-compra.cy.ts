/**
 * E2E Test - Fluxo Completo de Compra
 * 
 * Teste que simula o fluxo completo de compra realizado manualmente:
 * 1. Login como cliente
 * 2. Adicionar 2+ livros ao carrinho
 * 3. Navegar para checkout
 * 4. Selecionar endereço existente
 * 5. Calcular frete com CEP específico
 * 6. Selecionar opção de frete
 * 7. Selecionar cartão (sem cupom)
 * 8. Concluir pedido
 * 
 * Baseado no fluxo manual executado em 09/06/2026
 */

describe('Fluxo Completo de Compra', () => {
  const clienteEmail = 'clientetest@email.com';
  const clienteSenha = 'Teste@123456';
  const cepTeste = '08720-510';

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
    cy.limparCarrinhoViaApi();
  }

  /**
   * Helper para adicionar livros ao carrinho
   * Adiciona os mesmos livros do fluxo manual: Orgulho e Preconceito, O Poder do Hábito
   */
  function adicionarLivrosAoCarrinho() {
    cy.visit('/');
    cy.get('[data-cy="adicionar-carrinho-card-button"]').eq(0).click();
    cy.get('[data-cy="header-cart-link"]').should('be.visible');

    cy.visit('/');
    cy.get('[data-cy="adicionar-carrinho-card-button"]').eq(1).click();
    cy.get('[data-cy="header-cart-link"]').should('be.visible');
  }

  /**
   * Helper para navegar para checkout
   */
  function navegarParaCheckout() {
    cy.visit('/carrinho', { timeout: 15000 });
    cy.url().should('include', '/carrinho');
    
    // Clicar em Finalizar Compra (se carrinho vazio, botão não existe e teste falha corretamente)
    cy.get('[data-cy="carrinho-finalizar-compra"]', { timeout: 10000 }).click({ force: true });
    cy.url().should('include', '/checkout');
  }

  /**
   * Helper para selecionar endereço existente
   * Seleciona o endereço "Rua das Flores, 123, São Paulo/SP"
   */
  function selecionarEnderecoExistente() {
    // Selecionar o primeiro endereço existente
    cy.get('[data-cy^="checkout-address-item-"]').first().click();
    
    // Verificar que endereço foi selecionado
    cy.get('[data-cy="checkout-address-selected"]').should('be.visible');
  }

  /**
   * Helper para calcular frete com CEP específico
   */
  function calcularFrete() {
    // Preencher CEP de destino
    cy.get('[data-cy="checkout-freight-zip-input"]').scrollIntoView().clear({force: true}).type(cepTeste);
    
    // Clicar em Calcular
    cy.get('[data-cy="checkout-freight-calculate-button"]').click();
    
    // Aguardar opções de frete aparecerem
    cy.get('[data-cy="checkout-freight-options"]').should('be.visible');
  }

  /**
   * Helper para selecionar opção de frete PAC
   */
  function selecionarFretePAC() {
    // Selecionar PAC com scrollIntoView para evitar "center hidden from view"
    cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().click();
    
    // Verificar que frete foi selecionado
    cy.get('[data-cy="checkout-freight-selected-info"]').should('be.visible');
  }

  /**
   * Helper para verificar que cartão Visa está selecionado
   * O cartão principal já vem selecionado por padrão
   */
  function verificarCartaoSelecionado() {
    // Verificar que há cartões salvos e o primeiro está selecionado
    cy.get('[data-cy="checkout-saved-cards"]').should('be.visible');
    cy.get('[data-cy^="checkout-card-item-"]').first().should('have.attr', 'data-selected', 'true');
    
    // Sem cupom aplicado: elemento não deve existir no DOM
    cy.get('[data-cy="checkout-applied-coupons"]').should('not.exist');
  }

  /**
   * Helper para concluir pedido
   */
  function concluirPedido() {
    // Verificar que botão Concluir Pedido está habilitado
    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled');
    
    // Clicar em Concluir Pedido
    cy.get('[data-cy="checkout-finish-button"]').click();
    
    // Verificar redirecionamento para página de confirmação (aumentado timeout)
    cy.url({ timeout: 20000 }).should('include', '/pedido-confirmado');
  }

  /**
   * Helper para verificar confirmação do pedido
   */
  function verificarConfirmacaoPedido() {
    cy.get('[data-cy="confirmado-page"]').should('be.visible');
    cy.get('[data-cy="confirmado-card"]').should('be.visible');
    cy.get('[data-cy="confirmado-status-badge"]').should('be.visible');
    cy.get('[data-cy="confirmado-info"]').should('be.visible');
  }

  /**
   * Helper para verificar pedido na página Meus Pedidos
   */
  function verificarPedidoEmMeusPedidos() {
    cy.visit('/pedidos');
    cy.url().should('include', '/pedidos');
    
    // Verificar que a página de pedidos carregou
    cy.get('[data-cy="pedidos-lista"]').should('be.visible');
    
    // Verificar que há pelo menos um pedido na lista
    cy.get('[data-cy^="pedido-"]').should('have.length.at.least', 1);
    
    // Verificar que o primeiro pedido tem status
    cy.get('[data-cy^="pedido-"]').first().within(() => {
      cy.get('[data-cy="pedido-status"]').should('be.visible');
    });
  }

  describe('Fluxo Completo - Compra com 2 Livros', () => {
    it('deve completar fluxo de compra com 2 livros, endereço existente, frete PAC e cartão Visa', () => {
      /**
       * Fluxo (Cliente realizar compra):
       * 1. Cliente faz login
       * 2. Adiciona livros ao carrinho
       * 3. Navega para checkout
       * 4. Seleciona endereço existente
       * 5. Calcula e seleciona frete
       * 6. Seleciona cartão salvo
       * 7. Conclui pedido
       * 8. Verifica que pedido foi criado com sucesso
       * 9. Verifica que pedido aparece em Meus Pedidos
       */
      cy.log('=== ETAPA 1: Login do Cliente ===');
      loginCliente();

      cy.log('=== ETAPA 2: Adicionar 2 livros ao carrinho ===');
      adicionarLivrosAoCarrinho();

      cy.log('=== ETAPA 3: Navegar para checkout ===');
      navegarParaCheckout();

      cy.log('=== ETAPA 4: Selecionar endereço existente ===');
      selecionarEnderecoExistente();

      cy.log('=== ETAPA 5: Calcular frete com CEP 08720-510 ===');
      calcularFrete();

      cy.log('=== ETAPA 6: Selecionar opção de frete PAC ===');
      selecionarFretePAC();

      cy.log('=== ETAPA 7: Verificar cartão Visa selecionado (sem cupom) ===');
      verificarCartaoSelecionado();

      cy.log('=== ETAPA 8: Concluir pedido ===');
      concluirPedido();

      cy.log('=== ETAPA 9: Verificar confirmação do pedido ===');
      verificarConfirmacaoPedido();

      cy.log('=== ETAPA 10: Verificar pedido em Meus Pedidos ===');
      verificarPedidoEmMeusPedidos();

      cy.log('[FLUXO COMPLETO] Compra realizada com sucesso e pedido confirmado em Meus Pedidos');
    });
  });

  describe('Validação de Backend Routes', () => {
    it('deve chamar as rotas corretas durante o fluxo de compra', () => {
      // Intercept para verificar chamadas de API
      cy.intercept('GET', '/api/auth/me').as('getAuthMe');
      cy.intercept('GET', '/api/carrinho').as('getCarrinho');
      cy.intercept('GET', '/api/categorias/catalogo').as('getCategorias');
      cy.intercept('GET', '/api/pagamento/info').as('getPagamentoInfo');
      cy.intercept('POST', '/api/frete/cotar').as('cotarFrete');
      cy.intercept('POST', '/api/vendas').as('criarVenda');
      cy.intercept('POST', '/api/pagamentos/selecionar').as('selecionarPagamento');
      cy.intercept('POST', '/api/pagamentos/*/processar').as('processarPagamento');
      cy.intercept('POST', '/api/entregas').as('criarEntrega');
      cy.intercept('DELETE', '/api/carrinho').as('limparCarrinho');

      loginCliente();
      adicionarLivrosAoCarrinho();
      navegarParaCheckout();
      selecionarEnderecoExistente();
      
      // Calcular frete e verificar rota
      calcularFrete();
      cy.wait('@cotarFrete').its('response.statusCode').should('eq', 200);
      
      selecionarFretePAC();
      verificarCartaoSelecionado();
      
      // Concluir pedido e verificar rotas
      concluirPedido();
      
      // Verificar que as rotas foram chamadas
      cy.wait('@criarVenda').its('response.statusCode').should('eq', 201);
      cy.wait('@selecionarPagamento').its('response.statusCode').should('eq', 201);
      cy.wait('@processarPagamento').its('response.statusCode').should('eq', 200);
      cy.wait('@criarEntrega').its('response.statusCode').should('eq', 201);
      cy.wait('@limparCarrinho').its('response.statusCode').should('eq', 200);

      verificarConfirmacaoPedido();

      cy.log('[BACKEND ROUTES] Todas as rotas foram chamadas corretamente');
    });
  });

  describe('Validação de Dados do Pedido', () => {
    it('deve exibir dados corretos no resumo do pedido', () => {
      loginCliente();
      adicionarLivrosAoCarrinho();
      navegarParaCheckout();
      selecionarEnderecoExistente();
      calcularFrete();
      selecionarFretePAC();
      verificarCartaoSelecionado();

      // Verificar resumo do pedido antes de concluir
      cy.get('[data-cy="checkout-resumo-pedido"]').should('be.visible');
      cy.get('[data-cy="checkout-subtotal"]').should('be.visible');
      cy.get('[data-cy="checkout-frete"]').should('be.visible');
      cy.get('[data-cy="checkout-total-pagamento"]').should('be.visible');

      concluirPedido();
      verificarConfirmacaoPedido();

      cy.log('[DADOS PEDIDO] Resumo do pedido exibido corretamente');
    });
  });

  describe('Validação de Seletores e UI', () => {
    it('deve encontrar todos os elementos necessários no fluxo', () => {
      loginCliente();
      
      // Verificar elementos na home
      cy.visit('/');
      cy.get('[data-cy="adicionar-carrinho-card-button"]').should('have.length.at.least', 1);
      
      adicionarLivrosAoCarrinho();
      
      // Verificar elementos no carrinho
      cy.visit('/carrinho');
      cy.get('[data-cy="carrinho-page"]').should('be.visible');
      cy.get('[data-cy="carrinho-finalizar-compra"]', { timeout: 10000 }).should('be.visible');
      
      navegarParaCheckout();
      
      // Verificar elementos no checkout
      cy.get('[data-cy="checkout-addresses"]').should('be.visible');
      cy.get('[data-cy^="checkout-address-item-"]').should('have.length.at.least', 1);
      cy.get('[data-cy="checkout-freight-section"]').should('be.visible');
      cy.get('[data-cy="checkout-freight-zip-input"]').should('be.visible');
      cy.get('[data-cy="checkout-freight-calculate-button"]').should('be.visible');
      cy.get('[data-cy="checkout-payment-section"]').should('be.visible');
      cy.get('[data-cy="checkout-saved-cards"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-section"]').should('be.visible');
      cy.get('[data-cy="checkout-total-value"]').should('be.visible');
      cy.get('[data-cy="checkout-finish-button"]').should('be.visible');

      cy.log('[UI SELETORES] Todos os elementos encontrados corretamente');
    });
  });
});
