describe('Vendas — Finalização de Pedido', () => {
  const apiUrl = Cypress.env('apiUrl');
  const { email, senha } = Cypress.env('cliente') || { email: '', senha: '' };

  /**
   * Helper para preparar estado mínimo para testes de checkout.
   * Autentica, garante endereço/cartões e limpa carrinho.
   */
  function prepararEstadoCheckout() {
    Cypress.env('injectTestDbHeader', true);
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'x-use-test-db': 'true' },
      body: { email, senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const nome = response.body.dados?.user?.nome;
      expect(nome).to.be.a('string');
    });
    cy.garantirEnderecoViaApi();
    cy.garantirCartoesViaApi();
    cy.limparCarrinhoViaApi();
  }

  /**
   * Helper para navegar até o checkout com carrinho preparado.
   * Navega da home até o checkout selecionando endereço e frete.
   */
  function navegarAteCheckoutComFrete() {
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.visit('/');
    cy.getDataCy('header-user-profile').should('be.visible');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-cy="livro-card"]', { timeout: 30000 }).should('be.visible').first().contains('Ver Detalhes').click();
    cy.url().should('include', '/livro/');
    cy.contains('Adicionar ao Carrinho', { timeout: 10000 }).should('be.visible').click({ force: true });
    cy.getDataCy('header-cart-link').click();
    cy.url().should('include', '/carrinho');
    cy.contains('button', 'Finalizar Compra').click();
    cy.url().should('include', '/checkout');
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('be.visible')
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
  }

  beforeEach(() => {
    prepararEstadoCheckout();
    navegarAteCheckoutComFrete();
  });

  it('deve exibir as etapas do checkout na barra de progresso', () => {
    cy.contains('h1', 'Finalizar Compra').should('be.visible');
    cy.contains('1. Identificação').should('exist');
    cy.contains('2. Entrega').should('exist');
    cy.contains('3. Pagamento').should('exist');
  });

  it('deve listar o endereço de entrega do cliente', () => {
    // Usa endereços reais do cliente via GET /pagamento/info
    cy.get('[data-cy^="checkout-address-item-"]').should('be.visible');
  });

  it('deve oferecer componentes para a etapa de pagamento (múltiplos cartões, cupons)', () => {
    cy.getDataCy('checkout-payment-section-title').should('be.visible').and('contain', 'Como você quer pagar');
    cy.getDataCy('checkout-saved-cards').should('exist');
    
    // Cupons promocionais
    cy.contains('Cupons de Desconto').should('be.visible');
    cy.getDataCy('checkout-coupon-input').should('exist');
    cy.getDataCy('checkout-apply-coupon-button').should('be.visible');
  });

  it('deve possuir resumo do pedido e botão de finalizar', () => {
    cy.contains('h3', 'Resumo do Pedido').scrollIntoView().should('be.visible');
    cy.contains('Subtotal').should('exist');
    cy.contains('Frete:').should('exist');
    
    cy.getDataCy('checkout-finish-button').scrollIntoView().should('be.visible');
  });
});
