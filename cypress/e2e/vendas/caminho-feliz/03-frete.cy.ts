/**
 * Teste 3: Cotação de Frete
 * Etapa: Checkout → Seleção de Endereço → Cotação de Frete
 */
describe('Vendas — Caminho Feliz — Etapa 3: Frete', () => {
  const apiUrl = (Cypress.env('apiUrl');
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  it('Deve cotar frete com CEP válido', () => {
    Cypress.env('injectTestDbHeader', true);
    // Usar autenticação via API (UI de login não existe em Next.js)
    cy.autenticarViaApi(email, senha);
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');

    cy.log('**Etapa: Preparar carrinho via API**');
    cy.prepararCarrinhoSincronizado();
    cy.garantirEnderecoViaApi();

    cy.log('**Etapa: Navegar para checkout**');
    cy.visit('/carrinho');
    // Lock: aguarda o botão estar estável e clicável
    cy.contains('Finalizar Compra', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    cy.log('**Etapa: Selecionar endereço**');
    // Lock: aguarda os itens de endereço estarem visíveis e estáveis
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.log('**Etapa: Preencher CEP e cotar frete**');
    cy.checkoutPreencherFretePadrao('01310100');

    cy.log('**Validação: API de frete chamada**');
    // checkoutPreencherFretePadrao já espera por @freteCotar internamente

    cy.log('**Validação: opções de frete exibidas**');
    cy.contains('PAC', { timeout: 10000 }).should('be.visible');
    cy.contains('SEDEX', { timeout: 10000 }).should('be.visible');

    cy.log('✅ Frete cotado com sucesso');
  });

  it('Deve selecionar opção de frete', () => {
    cy.log('**Etapa: Preparar checkout e cotar frete**');
    Cypress.env('injectTestDbHeader', true);
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.autenticarViaApi(email, senha);
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

    cy.log('**Etapa: Selecionar opção de frete**');
    // Lock: aguarda as opções de frete estarem visíveis e estáveis
    cy.get('[data-cy="checkout-freight-option-PAC"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.log('**Validação: opção de frete selecionada**');
    cy.get('[data-cy="checkout-freight-option-PAC"]').should('have.attr', 'data-selected', 'true');

    cy.log('✅ Opção de frete selecionada com sucesso');
  });

  it('Deve exibir erro com CEP inválido', () => {
    cy.log('**Etapa: Preparar checkout**');
    Cypress.env('injectTestDbHeader', true);
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.autenticarViaApi(email, senha);
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

    cy.log('**Etapa: Preencher CEP inválido**');
    // Lock: aguarda o input estar estável antes de digitar
    cy.get('[data-cy="checkout-freight-zip-input"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .scrollIntoView()
      .clear()
      .type('00000000', { delay: 50 });

    // Lock: aguarda o botão estar estável e clicável
    cy.get('[data-cy="checkout-freight-calculate-button"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .scrollIntoView()
      .click();

    cy.log('**Validação: mensagem de erro**');
    cy.get('[data-cy="checkout-freight-error"]', { timeout: 10000 }).should('be.visible');

    cy.log('✅ Validação de CEP inválido funcionando');
  });
});
