describe('Checkout (Finalização de Compra)', () => {
  beforeEach(() => {
    // Fazer login como cliente para evitar redirecionamento
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: "fake-token-checkout",
        user: { uuid: "user-1", nome: "Teste", role: "cliente" }
      }
    }).as('loginCheckout');

    cy.login('teste@email.com', '123456');
    cy.wait('@loginCheckout');

    // Garantir que o login foi processado (Header deve mudar)
    cy.getDataCy('header-user-profile').should('be.visible').and('contain', 'Teste');

    // Garantir que a página base home foi carregada
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Navegar para checkout via UI para preservar o estado do Redux
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

  it('deve listar o endereço de entrega do mock', () => {
    // Baseado no checkoutMock.json ("Rua Bela Vista")
    cy.contains('Endereço de Entrega').should('be.visible');
    cy.contains('Rua Bela Vista').should('exist');
    cy.contains('a', 'Alterar endereço').should('be.visible');
  });

  it('deve oferecer componentes para a etapa de pagamento (múltiplos cartões, cupons)', () => {
    cy.contains('Forma de Pagamento (Cartões)').should('be.visible');
    cy.getDataCy('checkout-card-select').find('option').contains('Selecionar Cartão Salvo').should('exist');
    cy.getDataCy('checkout-add-card-button').should('be.visible');
    
    // Pagamento com múltiplos cartões
    cy.contains('label', 'Pagar valor parcial com este cartão (Múltiplos Cartões)').should('be.visible');
    cy.getDataCy('checkout-add-payment-button').should('exist');
    
    // Cupons promocionais
    cy.contains('Cupons de Troca / Promocional').should('be.visible');
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
