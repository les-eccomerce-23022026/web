/**
 * Checkout — falhas e validações (E2E real).
 * Maioria dos cenários usa o primeiro livro do catálogo (`obterPrimeiroLivroCatalogo`).
 *
 * Teto do sandbox (R$ 1000): `LIVRO_TETO_A` / `LIVRO_TETO_B` vêm de
 * `backend/sql/migrations/021_seed_livros_catalogo_mock.sql` (ISBN 978-85-325-2963-1 e 978-85-325-1078-3).
 * Quantidades fixas (20 + 7) assumem preços/estoque do seed — ajustar se o catálogo de teste mudar.
 */
describe('Vendas — Falhas Recuperáveis na Compra', () => {
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = Cypress.env('clienteSenha') || '@asdfJKL\u00C7123';
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';

  /** Seed 021 — valores escolhidos para ultrapassar R$ 1000 com estoque estável no banco de teste. */
  const LIVRO_TETO_A = '11223344-5566-7788-9900-aabbccddeeff';
  const LIVRO_TETO_B = '67890abc-def0-1234-5678-9abcdef01234';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
  });

  describe('Validações de Interface (Frontend)', () => {
    it('Deve falhar ao tentar finalizar sem endereço e frete (Validação de Frontend)', () => {
      cy.removerEnderecosUsuarioViaApi();
      cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
        cy.adicionarAoCarrinhoViaApi(livroUuid);
        cy.visit('/checkout');

        /** GET /carrinho hidrata Redux; sem ele `useFinalizarCompra` não chama GET /pagamento/info. */
        cy.log(
          '[E2E] Ordem rede: @carrinhoGet → @pagamentoInfo (ver setupCheckoutNetworkSpies / checkoutApi.ts)',
        );
        cy.wait('@carrinhoGet', { timeout: 20000 });
        cy.logCheckoutDiagnosticContext('checkout após GET carrinho (sem endereço)');
        cy.wait('@pagamentoInfo', { timeout: 20000 });

        cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
      });
    });

    it('Deve falhar ao aplicar um cupom inexistente', () => {
      cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
        cy.adicionarAoCarrinhoViaApi(livroUuid);
        cy.visit('/checkout');

        cy.wait('@pagamentoInfo', { timeout: 20000 });
        cy.checkoutAplicarCupom('CUPOM_INVALIDO');

        cy.get('[data-cy="checkout-coupon-error"]', { timeout: 10000 })
          .should('be.visible')
          .should('contain', 'Cupom inválido ou expirado');
      });
    });

    it('Deve falhar ao calcular frete para CEP inexistente', () => {
      cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
        cy.adicionarAoCarrinhoViaApi(livroUuid);
        cy.visit('/checkout');

        cy.wait('@pagamentoInfo', { timeout: 20000 });

        cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('00000000');
        cy.get('[data-cy="checkout-freight-calculate-button"]').scrollIntoView().click();

        cy.wait('@freteCotar', { timeout: 15000 });
        cy.get('[data-cy="checkout-freight-error"]')
          .should('be.visible')
          .should('contain', 'CEP não encontrado');
      });
    });

    it('Deve recusar o pagamento ao exceder o teto de R$ 1000 do sandbox', () => {
      cy.criarCarrinhoViaApi([
        { livroUuid: LIVRO_TETO_A, quantidade: 20 },
        { livroUuid: LIVRO_TETO_B, quantidade: 7 },
      ]);
      cy.visit('/checkout');

      cy.wait('@carrinhoGet', { timeout: 20000 });
      cy.wait('@pagamentoInfo', { timeout: 20000 });
      cy.get('[data-cy="checkout-payment-section-title"]').should('be.visible');

      cy.get('[data-cy^="checkout-address-item-"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .scrollIntoView()
        .click();

      cy.get('[data-cy="checkout-freight-zip-input"]')
        .should('be.visible')
        .scrollIntoView()
        .clear()
        .type('01310100');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .should('be.visible')
        .scrollIntoView()
        .click();
      
      cy.wait('@freteCotar', { timeout: 15000 });

      cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .scrollIntoView()
        .click();

      cy.get('[data-cy^="checkout-card-item-"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .scrollIntoView()
        .click();

      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled')
        .scrollIntoView()
        .click();

      cy.get('[data-cy="notification-toast"]', { timeout: 15000 })
        .should('be.visible')
        .should('contain', 'recusado');

      cy.url().should('include', '/checkout');
    });
  });
});
