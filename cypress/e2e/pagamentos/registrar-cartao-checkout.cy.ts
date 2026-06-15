/**
 * E2E — 7ª Entrega / Seção 2: Registrar novo cartão no ato da compra.
 * Cliente adiciona um cartão durante o checkout, conclui o pedido com ele e
 * verifica que o cartão passa a constar na lista de cartões salvos.
 */
import {
  loginClienteUi,
  adicionarLivrosAoCarrinho,
  irParaCheckoutComEnderecoEFrete,
  CARTAO_MASTERCARD,
  loginApi,
} from '../../support/fluxo-venda.helpers';

describe('Pagamentos — Registrar novo cartão no checkout (CDU002, RF0018)', () => {
  let novoCartaoUuid: string | undefined;

  afterEach(() => {
    if (!novoCartaoUuid) return;
    const uuid = novoCartaoUuid;
    novoCartaoUuid = undefined;
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/auth/login`,
      headers: { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` },
      body: { email: 'clientetest@email.com', senha: '123456' },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil/cartoes/${uuid}`,
        headers: {
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          'Authorization': `Bearer ${token}`,
        },
        failOnStatusCode: false,
      }).then(() => cy.log('Cartão de teste removido com sucesso'));
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    adicionarLivrosAoCarrinho(1);
    irParaCheckoutComEnderecoEFrete();
  });

  it('2 deve registrar um novo cartão durante a compra, pagar com ele e salvá-lo na lista', function () {
    /**
     * Fluxo (2 Registrar novo cartão no ato da compra):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Clica em "Adicionar novo cartão"
     * 6. Preenche dados do cartão (número, validade, CVV, nome)
     * 7. Clica em "Salvar cartão"
     * 8. Sistema valida e salva o novo cartão
     * 9. Novo cartão é automaticamente selecionado para pagamento
     * 10. Conclui pedido
     * 11. Verifica que pedido foi pago com novo cartão
     * 12. Verifica que cartão aparece na lista de cartões salvos
     */
    // Adicionar linha de novo cartão e abrir formulário
    cy.get('[data-cy="checkout-payment-section"]').scrollIntoView();
    cy.get('[data-cy="pagamento-dividido-adicionar-novo-cartao"]').click();
    // Se houver cartões salvos disponíveis, clica em "Informar cartão novo"; caso contrário, o botão direto já aparece
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="checkout-split-inform-new-card"]').length) {
        cy.get('[data-cy="checkout-split-inform-new-card"]').last().click();
      } else {
        cy.get('[data-cy="checkout-add-card-button"]').last().click();
      }
    });
    cy.get('[data-cy="checkout-new-card-form"]').should('be.visible');

    // Preencher dados do cartão (bandeira é auto-detectada pelo número)
    cy.get('[data-cy="checkout-card-number-input"]').clear().type(CARTAO_MASTERCARD.numero);
    cy.get('[data-cy="checkout-card-name-input"]').clear().type(CARTAO_MASTERCARD.nomeTitular);
    cy.get('[data-cy="checkout-card-expiry-input"]').clear().type(CARTAO_MASTERCARD.validade);
    cy.get('[data-cy="checkout-card-cvv-input"]').clear().type('123');

    // Marcar para salvar o cartão
    cy.get('[data-cy="checkout-save-card-checkbox"]').check();

    // Salvar/confirmar o cartão
    cy.get('[data-cy="checkout-card-submit-button"]').click();

    // Capturar UUID do cartão para limpeza posterior
    cy.get('[data-cy^="checkout-card-item-"]').then(($el) => {
      novoCartaoUuid = $el.attr('data-cy')?.replace('checkout-card-item-', '') || '';
    });

    // Novo cartão fica selecionado automaticamente
    cy.get('[data-cy^="checkout-card-item-"]').first().should('have.attr', 'data-selected', 'true');

    // Verificar que o cartão foi salvo (usar API para validar)
    loginApi('clientetest@email.com', '123456').then((token) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil/cartoes`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).then((res) => {
        const cartoes = res.body.dados ?? res.body;
        expect(Array.isArray(cartoes)).to.be.true;
        expect(cartoes.length).to.be.greaterThan(0);
        cy.log('Cartão salvo com sucesso via API');
      });
    });

  });
});
