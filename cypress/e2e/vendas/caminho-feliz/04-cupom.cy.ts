/**
 * Teste 4: Aplicação de Cupom
 * Etapa: Checkout → Aplicar Cupom de Desconto
 */
describe('Vendas — Caminho Feliz — Etapa 4: Cupom', () => {
  const apiUrl = (Cypress.env('apiUrl');
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
  });

  it('Deve aplicar cupom de desconto válido', () => {
    cy.log('**Etapa: Preparar checkout com frete**');
    cy.prepararCarrinhoSincronizado();
    cy.garantirEnderecoViaApi();

    cy.visit('/carrinho');
    // Lock: aguarda o botão estar estável e clicável
    cy.contains('Finalizar Compra', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    // Lock: aguarda os itens de endereço estarem visíveis e estáveis
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.checkoutPreencherFretePadrao('01310100');
    // checkoutPreencherFretePadrao já espera por @freteCotar internamente

    cy.log('**Etapa: Aplicar cupom DESCONTO10**');
    cy.checkoutAplicarCupom('DESCONTO10');

    cy.log('**Validação: cupom aplicado e exibido**');
    cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 })
      .should('be.visible');

    cy.log('**Validação: desconto aplicado no total**');
    cy.contains('Desconto', { timeout: 10000 }).should('be.visible');

    cy.log('✅ Cupom aplicado com sucesso');
  });

  it('Deve exibir erro com cupom inválido', () => {
    cy.log('**Etapa: Preparar checkout**');
    cy.prepararCarrinhoSincronizado();
    cy.garantirEnderecoViaApi();

    cy.visit('/carrinho');
    // Lock: aguarda o botão estar estável e clicável
    cy.contains('Finalizar Compra', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    // Lock: aguarda os itens de endereço estarem visíveis e estáveis
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.checkoutPreencherFretePadrao('01310100');
    // checkoutPreencherFretePadrao já espera por @freteCotar internamente

    cy.log('**Etapa: Tentar aplicar cupom inválido**');
    // Lock: aguarda o input estar estável antes de digitar
    cy.get('[data-cy="checkout-coupon-input"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type('CUPOM_INVALIDO', { delay: 50 });

    // Lock: aguarda o botão estar estável e clicável
    cy.get('[data-cy="checkout-apply-coupon-button"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .scrollIntoView()
      .click();

    cy.log('**Validação: mensagem de erro**');
    cy.contains('Cupom inválido', { timeout: 10000 }).should('be.visible');

    cy.log('✅ Validação de cupom inválido funcionando');
  });

  it('Deve remover cupom aplicado', () => {
    cy.log('**Etapa: Preparar checkout e aplicar cupom**');
    cy.prepararCarrinhoSincronizado();
    cy.garantirEnderecoViaApi();

    cy.visit('/carrinho');
    // Lock: aguarda o botão estar estável e clicável
    cy.contains('Finalizar Compra', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    // Lock: aguarda os itens de endereço estarem visíveis e estáveis
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.checkoutPreencherFretePadrao('01310100');
    // checkoutPreencherFretePadrao já espera por @freteCotar internamente

    cy.checkoutAplicarCupom('DESCONTO10');
    cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 })
      .should('be.visible');

    cy.log('**Etapa: Remover cupom**');
    // Lock: aguarda o botão remover estar estável e clicável
    cy.get('[data-cy="checkout-coupon-remove-DESCONTO10"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .scrollIntoView()
      .click();

    cy.log('**Validação: cupom removido**');
    cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 })
      .should('not.exist');

    cy.log('✅ Cupom removido com sucesso');
  });
});
