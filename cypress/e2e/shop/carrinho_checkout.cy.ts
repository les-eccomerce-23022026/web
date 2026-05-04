import { LIVRO_UUID_PRIMEIRO_CATALOGO } from '../../support/e2eSeedConstants';

describe('Carrinho de Compras e Cálculo de Frete', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';

  beforeEach(() => {
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.loginClienteSeed();
    cy.limparCarrinhoApi();
  });

  it('deve listar os produtos adicionados, permitindo ver a foto e subtotal', () => {
    cy.prepararCarrinhoComUmLivro({ via: 'api', livroUuid: LIVRO_UUID_PRIMEIRO_CATALOGO });
    cy.visit('/carrinho');
    cy.wait('@carrinhoGet', { timeout: 15000 });

    cy.url().should('include', '/carrinho');
    cy.contains('Carrinho de Compras').should('be.visible');

    cy.contains('Produto').should('be.visible');
    cy.contains('Preço Unit.').should('be.visible');
    cy.contains('Quant.').should('be.visible');
    cy.contains('Subtotal').should('be.visible');

    cy.get('[data-cy="carrinho-linha-item"]').should('be.visible');
    cy.contains('Remover').should('be.visible');
  });

  it('deve possuir módulo de cálculo de frete via CEP', () => {
    cy.prepararCarrinhoComUmLivro({ via: 'api', livroUuid: LIVRO_UUID_PRIMEIRO_CATALOGO });
    cy.visit('/carrinho');
    cy.wait('@carrinhoGet', { timeout: 15000 });

    cy.url().should('include', '/carrinho');

    cy.contains('Cálculo de Frete', { timeout: 15000 }).should('be.visible');

    cy.get('[data-cy="checkout-freight-zip-input"]').should('be.visible');
    cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01001-000');
    cy.get('[data-cy="checkout-freight-calculate-button"]').scrollIntoView().click();

    cy.wait('@freteCotar', { timeout: 15000 });
    cy.get('[data-cy="checkout-freight-options"]').should('be.visible');
  });

  it('deve permitir ir para a etapa de finalização de compra', () => {
    cy.prepararCarrinhoComUmLivro({ via: 'api', livroUuid: LIVRO_UUID_PRIMEIRO_CATALOGO });
    cy.visit('/carrinho');
    cy.wait('@carrinhoGet', { timeout: 15000 });

    cy.url().should('include', '/carrinho');
    cy.contains('Finalizar Compra').should('be.visible');
    cy.contains('Finalizar Compra').click();

    cy.url().should('include', '/checkout');
    cy.wait('@pagamentoInfo', { timeout: 20000 });
  });

  /**
   * Reutilização do frete cotado no carrinho ao abrir o checkout (Redux + hidratação).
   * Requer sessão de cliente e API real (sem mock).
   */
  describe('frete carrinho → checkout', () => {
    beforeEach(() => {
      cy.loginClienteSeed();
    });

    it('não deve chamar POST /frete/cotar novamente se o frete já foi cotado no carrinho', () => {
      cy.prepararCarrinhoComUmLivro({ via: 'api', livroUuid: LIVRO_UUID_PRIMEIRO_CATALOGO });
      cy.visit('/carrinho');
      cy.wait('@carrinhoGet', { timeout: 15000 });

      cy.url().should('include', '/carrinho');
      cy.contains('Carrinho de Compras').should('be.visible');

      cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01001-000');
      cy.get('[data-cy="checkout-freight-calculate-button"]').click();
      cy.wait('@freteCotar', { timeout: 15000 });
      cy.get('[data-cy="checkout-freight-option-PAC"]').scrollIntoView().should('be.visible').click();

      cy.contains('Finalizar Compra').click();

      cy.url().should('include', '/checkout');
      cy.contains('h1', 'Finalizar Compra', { timeout: 20000 }).should('be.visible');
      cy.wait('@pagamentoInfo', { timeout: 20000 });

      cy.get('@freteCotar.all').should('have.length', 1);
      cy.get('[data-cy="checkout-freight-options"]', { timeout: 10000 }).should('be.visible');
      cy.contains(/Frete PAC selecionado/).should('be.visible');
    });
  });
});
