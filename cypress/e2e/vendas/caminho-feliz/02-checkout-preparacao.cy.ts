/**
 * Teste 2: Preparação do Checkout
 * Etapa: Carrinho → Checkout → Seleção de Endereço
 */
describe('Vendas — Caminho Feliz — Etapa 2: Checkout Preparação', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  it('Deve acessar o checkout com carrinho preparado via API', () => {
    Cypress.env('injectTestDbHeader', true);
    cy.autenticarViaApi(email, senha);
    cy.setupCheckoutNetworkSpies();

    cy.log('**Etapa: Limpar carrinho**');
    cy.limparCarrinhoViaApi();

    cy.log('**Etapa: Preparar carrinho via API**');
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.adicionarAoCarrinhoViaApi(livroUuid, 1);
    });

    cy.log('**Etapa: Navegar diretamente para checkout**');
    cy.visit('/checkout');

    cy.log('**Validação: página de checkout carregada**');
    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.logCheckoutDiagnosticContext('checkout montado');

    cy.log('**Validação: pagamento info carregado**');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    cy.log('✅ Checkout acessado com sucesso');
  });

  it('Deve selecionar um endereço no checkout', () => {
    Cypress.env('injectTestDbHeader', true);
    cy.autenticarViaApi(email, senha);
    cy.setupCheckoutNetworkSpies();

    cy.log('**Etapa: Limpar carrinho**');
    cy.limparCarrinhoViaApi();

    cy.log('**Etapa: Preparar carrinho e garantir endereço**');
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.adicionarAoCarrinhoViaApi(livroUuid, 1);
    });
    cy.garantirEnderecoViaApi();

    cy.log('**Etapa: Navegar diretamente para checkout**');
    cy.visit('/checkout');

    cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 20000 });

    cy.log('**Etapa: Selecionar endereço**');
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('be.visible')
      .first()
      .scrollIntoView()
      .click();

    cy.log('**Validação: endereço selecionado**');
    cy.get('[data-cy^="checkout-address-item-"]').first().should('have.attr', 'aria-checked', 'true');

    cy.log('✅ Endereço selecionado com sucesso');
  });

});
