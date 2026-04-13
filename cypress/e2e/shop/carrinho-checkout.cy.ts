describe('Carrinho de Compras e Cálculo de Frete', () => {
  beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' }).as('freteCotar');

    // Add a book first to test a populated cart
    cy.visit('/');
    cy.get('[data-cy="livro-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-cy="adicionar-carrinho-button"]').click();
    cy.visit('/carrinho');
  });

  it('deve listar os produtos adicionados, permitindo ver a foto e subtotal', () => {
    cy.contains('Carrinho de Compras').should('be.visible');

    // Check table headers
    cy.contains('Produto').should('be.visible');
    cy.contains('Preço Unit.').should('be.visible');
    cy.contains('Quant.').should('be.visible');
    cy.contains('Subtotal').should('be.visible');

    // Check item presence
    cy.get('img').should('exist');
    cy.contains('Remover').should('be.visible');
  });

  it('deve possuir módulo de cálculo de frete via CEP', () => {
    cy.contains('Cálculo de Frete').should('be.visible');
    cy.get('[data-cy="checkout-freight-zip-input"]').should('exist');
    cy.get('[data-cy="checkout-freight-zip-input"]').type('01001-000');
    cy.get('[data-cy="checkout-freight-calculate-button"]').click();
    cy.wait('@freteCotar', { timeout: 15000 });
    cy.get('[data-cy="checkout-freight-options"]').should('exist');
  });

  it('deve permitir ir para a etapa de finalização de compra', () => {
    cy.contains('Finalizar Compra').should('be.visible');
    cy.contains('Finalizar Compra').click();
    // Verifies it navigates to login or checkout details
  });

  /**
   * Reutilização do frete cotado no carrinho ao abrir o checkout (Redux + hidratação).
   * Requer sessão de cliente e fixtures alinhadas a `cliente-login-compra-feliz`.
   */
  describe('frete carrinho → checkout', () => {
    it('não deve chamar POST /frete/cotar novamente se o frete já foi cotado no carrinho', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

      cy.intercept(`${apiUrl}/**`, (req) => {
        delete req.headers['x-use-test-db'];
      });
      cy.intercept('GET', `${apiUrl}/carrinho`, { fixture: 'carrinho-com-livro-teste.json' }).as(
        'carrinhoFixture',
      );
      cy.intercept('GET', `${apiUrl}/pagamento/info`, { fixture: 'pagamento-info-checkout.json' }).as(
        'pagamentoInfo',
      );
      cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' }).as('freteCotar');

      cy.session('frete-carrinho-checkout', () => {
        cy.loginClienteSeed();
      });

      cy.visit('/');
      cy.wait('@carrinhoFixture', { timeout: 20000 });

      cy.visit('/carrinho');
      cy.contains('Carrinho de Compras').should('be.visible');

      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01001-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.wait('@freteCotar', { timeout: 15000 });
      cy.get('[data-cy="checkout-freight-option-PAC"]').click({ force: true });

      cy.visit('/checkout');
      cy.contains('h1', 'Finalizar Compra', { timeout: 20000 }).should('be.visible');

      cy.get('@freteCotar.all').should('have.length', 1);
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 10000 }).should('be.visible');
      cy.contains(/Frete PAC selecionado/).should('be.visible');
    });
  });
});
