/**
 * Teste 6: Pedido Confirmado
 * Etapa: Finalização → Navegação para /pedido-confirmado → Validação da tela de sucesso
 */
describe('Vendas — Caminho Feliz — Etapa 6: Pedido Confirmado', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
    cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
    cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
    cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
  });

  /** Checkout completo até pagamento PIX válido e clique em finalizar. */
  function finalizarCompraAteConfirmacao() {
    cy.garantirEnderecoViaApi();
    cy.garantirCartoesViaApi();
    cy.prepararCarrinhoSincronizado();

    cy.checkoutIrFinalizarCompra();

    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.checkoutPreencherFretePadrao('01310100');
    cy.checkoutAplicarCupom('DESCONTO10');
    cy.checkoutSelecionarCartaoSalvoPreferido('Mastercard');
    cy.get('[data-cy="checkout-split-restante"]', { timeout: 10000 }).should('contain', 'OK');

    cy.get('[data-cy="checkout-finish-button"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .scrollIntoView()
      .click();

    cy.wait('@criarVenda', { timeout: 20000 });
    cy.wait('@selecionarPagamento', { timeout: 20000 });
    cy.wait('@selecionarPagamento', { timeout: 20000 });
    cy.wait('@processarPagamento', { timeout: 20000 });
    cy.wait('@cadastrarEntrega', { timeout: 20000 });
    cy.checkoutConfirmarPixSePendente();
    cy.url({ timeout: 30000 }).should('include', '/pedido-confirmado');
  }

  it('Deve navegar para página de pedido confirmado após finalização', () => {
    cy.log('**Etapa: Preparar e finalizar compra completa**');
    finalizarCompraAteConfirmacao();

    cy.log('**Validação: navegação para pedido-confirmado**');
    cy.url({ timeout: 30000 }).should('include', '/pedido-confirmado');
    cy.url().should('match', /[?&]pedido=/);

    cy.log('**Validação: elementos da página de sucesso**');
    cy.contains('h1', 'Pedido Realizado com Sucesso!', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');

    cy.log('✅ Pedido confirmado e página de sucesso exibida');
  });

  it('Deve exibir UUID do pedido na URL', () => {
    cy.log('**Etapa: Finalizar compra**');
    finalizarCompraAteConfirmacao();

    cy.log('**Validação: UUID do pedido na URL**');
    cy.url().should('include', '/pedido-confirmado');
    cy.url().then((url) => {
      const pedidoUuid = url.match(/[?&]pedido=([^&]+)/)?.[1];
      expect(pedidoUuid, 'UUID do pedido deve estar na URL').to.exist;
      expect(pedidoUuid?.length, 'UUID deve ter formato válido').to.be.greaterThan(30);
      cy.log(`[E2E] Pedido UUID: ${pedidoUuid}`);
    });

    cy.log('✅ UUID do pedido validado');
  });

  it('Deve permitir voltar para home após confirmação', () => {
    cy.log('**Etapa: Finalizar compra e chegar em pedido-confirmado**');
    finalizarCompraAteConfirmacao();

    cy.url({ timeout: 30000 }).should('include', '/pedido-confirmado');

    cy.log('**Etapa: Clicar em voltar para home**');
    cy.get('[data-cy="confirmado-btn-home"]').should('be.visible').click();

    cy.log('**Validação: redirecionado para home**');
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');

    cy.log('✅ Navegação de volta para home funcionando');
  });
});
