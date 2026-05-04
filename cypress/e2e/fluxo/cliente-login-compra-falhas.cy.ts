describe('Checkout — Validações e Cenários de Falha (E2E Real)', () => {
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = Cypress.env('clienteSenha') || '@asdfJKL\u00C7123';
  const livroUuid = 'a1b2c3d4-e5f6-7890-1234-56789abcdef0'; // O Senhor dos Anéis (Seed 021)
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.loginApi(email, senha);
    cy.limparCarrinhoApi();
  });

  describe('Validações de Interface (Frontend)', () => {
    it('Deve falhar ao tentar finalizar sem endereço e frete (Validação de Frontend)', () => {
      cy.removerEnderecosUsuarioApi();
      cy.adicionarAoCarrinhoApi(livroUuid);
      cy.visit('/checkout');

      cy.wait('@pagamentoInfo', { timeout: 20000 });

      cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
    });

    it('Deve falhar ao aplicar um cupom inexistente', () => {
      cy.adicionarAoCarrinhoApi(livroUuid);
      cy.visit('/checkout');

      cy.wait('@pagamentoInfo', { timeout: 20000 });
      cy.checkoutAplicarCupom('CUPOM_INVALIDO');

      cy.get('[data-cy="checkout-coupon-error"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Cupom inválido ou expirado');
    });

    it('Deve falhar ao calcular frete para CEP inexistente', () => {
      cy.adicionarAoCarrinhoApi(livroUuid);
      cy.visit('/checkout');

      cy.wait('@pagamentoInfo', { timeout: 20000 });

      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('00000000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').scrollIntoView().click();

      cy.wait('@freteCotar', { timeout: 15000 });
      cy.get('[data-cy="checkout-freight-error"]')
        .should('be.visible')
        .should('contain', 'CEP não encontrado');
    });

    it('Deve recusar o pagamento ao exceder o teto de R$ 1000 do sandbox', () => {
      cy.adicionarAoCarrinhoApi('11223344-5566-7788-9900-aabbccddeeff', 20);
      cy.adicionarAoCarrinhoApi('67890abc-def0-1234-5678-9abcdef01234', 7);
      cy.visit('/checkout');

      cy.wait('@pagamentoInfo', { timeout: 20000 });
      cy.get('[data-cy="checkout-payment-section-title"]').should('be.visible');

      cy.get('[data-cy^="checkout-address-item-"]').first().scrollIntoView().click();

      cy.get('[data-cy="checkout-freight-zip-input"]').scrollIntoView().clear().type('01310100');
      cy.get('[data-cy="checkout-freight-calculate-button"]').scrollIntoView().should('be.visible').click();
      cy.wait('@freteCotar', { timeout: 15000 });

      cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 })
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();

      cy.get('[data-cy^="checkout-card-item-"]', { timeout: 10000 }).eq(1).scrollIntoView().click();

      cy.on('window:alert', (text) => {
        expect(text).to.include('recusado');
      });

      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').scrollIntoView().click();

      cy.get('[data-cy="notification-toast"]', { timeout: 15000 })
        .should('be.visible')
        .should('contain', 'recusado');

      cy.url().should('include', '/checkout');
    });
  });
});
