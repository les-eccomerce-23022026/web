describe('Vendas — Etapas do Checkout', () => {
  beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    const email = 'clientetest@email.com';
    const senha = '@asdfJKL\u00C7123';

    // Login real via API
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { email, senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const nome = response.body.dados?.user?.nome;
      expect(nome).to.be.a('string');
    });

    cy.login(email, senha);

    // Garantir que o login foi processado (Header deve mudar)
    cy.getDataCy('header-user-profile').should('be.visible');

    // Garantir que a página base home foi carregada
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Navegar para checkout para preservar o estado do Redux
    cy.getDataCy('header-cart-link').click();
    cy.url().should('include', '/carrinho');
    cy.contains('button', 'Finalizar Compra').click();
    cy.url().should('include', '/checkout');
  });

  it('deve exibir as etapas do checkout na barra de progresso', () => {
    cy.contains('h1', 'Finalizar Compra').should('be.visible');
    cy.contains('1. Identificação').should('exist');
    cy.contains('2. Entrega').should('exist');
    cy.contains('3. Pagamento').should('exist');
  });

  it('deve listar o endereço de entrega do cliente', () => {
    // Usa endereços reais do cliente via GET /pagamento/info
    cy.contains('Endereço de Entrega').should('be.visible');
    cy.get('[data-cy="checkout-addresses"]').should('be.visible');
  });

  it('deve oferecer componentes para a etapa de pagamento (múltiplos cartões, cupons)', () => {
    cy.getDataCy('checkout-payment-section-title').should('be.visible').and('contain', 'Como você quer pagar');
    cy.getDataCy('checkout-saved-cards').should('exist');
    cy.getDataCy('checkout-add-card-button').should('be.visible');
    
    // Pagamento com múltiplos cartões
    cy.contains('label', 'Pagar valor parcial com este cartão (Múltiplos Cartões)').should('be.visible');
    cy.getDataCy('checkout-add-payment-button').should('exist');
    
    // Cupons promocionais
    cy.contains('Cupons de Desconto').should('be.visible');
    cy.getDataCy('checkout-coupon-input').should('exist');
    cy.getDataCy('checkout-apply-coupon-button').should('be.visible');
  });

  it('deve possuir resumo do pedido e botão de finalizar', () => {
    cy.contains('h3', 'Resumo do Pedido').scrollIntoView().should('be.visible');
    cy.contains('Subtotal').should('exist');
    cy.contains('Frete:').should('exist');
    cy.contains('Cupons Aplicados:').should('exist');
    cy.contains('span', 'Total a Pagar:').scrollIntoView().should('be.visible');
    
    cy.getDataCy('checkout-finish-button').scrollIntoView().should('be.visible');
  });
});
