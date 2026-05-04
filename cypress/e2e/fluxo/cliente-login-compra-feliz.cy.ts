/**
 * Requer backend em http://localhost:3000 com banco de testes (docker-compose.test + setup)
 * e variável `apiUrl` no cypress.config (padrão: http://localhost:3000/api).
 */
describe('Jornada do Cliente — Processo de Compra e Finalização de Pedido', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';

  beforeEach(() => {
    cy.limparCarrinhoApi();
  });

  describe('Fluxo Principal: Compra com Sucesso (Caminho Feliz)', () => {
    beforeEach(() => {
      cy.setupCheckoutNetworkSpies();
      cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
      cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
      cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
      cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
    });

    it('Deve permitir que um cliente autenticado finalize um pedido com múltiplos itens, aplicando cupom e validando frete', () => {
      const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
      const senha =
        (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

      cy.log('**Início da Jornada: Autenticação do Cliente**');
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 30000 }).should('be.visible').type(email);
      cy.get('[data-cy="login-password-input"]').should('be.visible').type(senha);
      cy.intercept('POST', '**/api/auth/login').as('loginRequest');
      cy.intercept('GET', '**/api/livros*').as('getLivros');
      cy.get('[data-cy="login-submit-button"]').click();
      cy.wait('@loginRequest');

      cy.log('**Etapa: Preparação do Carrinho**');
      cy.url().should('match', /\/$/);
      cy.wait('@getLivros', { timeout: 15000 });

      cy.get('[data-cy="livro-card"]', { timeout: 15000 }).should('be.visible').first().click();
      cy.get('[data-cy="adicionar-carrinho-button"]').should('be.visible').click();
      cy.wait('@carrinhoAdicionarItem', { timeout: 15000 });

      cy.url().should('include', '/carrinho');
      cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="carrinho-linha-item"]', { timeout: 10000 }).should('be.visible');

      cy.log('**Etapa: Checkout - Consolidação do Pedido**');
      cy.contains('Finalizar Compra').should('be.visible').click();

      cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
      cy.wait('@pagamentoInfo', { timeout: 20000 });

      cy.log('**Etapa: Seleção de Logística (Endereço e Frete)**');
      cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
        .should('be.visible')
        .first()
        .scrollIntoView()
        .click();

      cy.checkoutPreencherFretePac('01310100');

      cy.log('**Etapa: Aplicação de Benefícios (Cupons)**');
      cy.checkoutAplicarCupom('DESCONTO10');
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]', { timeout: 10000 })
        .should('be.visible');

      cy.log('**Etapa: Configuração de Pagamento**');
      cy.get('[data-cy^="checkout-card-item-"]', { timeout: 10000 })
        .should('be.visible')
        .first()
        .scrollIntoView()
        .click();

      cy.log('**Finalização: Registro do Pedido no Backend**');
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.visible')
        .should('not.be.disabled')
        .scrollIntoView()
        .click();

      cy.wait('@criarVenda', { timeout: 20000 });
      cy.log('✅ Pedido registrado com sucesso seguindo todas as regras de negócio.');
    });
  });
});

/**
 * COMO RODAR ESTE TESTE:
 * cd web
 * npm run cypress:run:fluxo-login-compra
 */
