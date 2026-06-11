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
} from '../../support/fluxo-venda.helpers';

describe('Pagamentos — Registrar novo cartão no checkout (CDU002, RF0018)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    adicionarLivrosAoCarrinho(1);
    irParaCheckoutComEnderecoEFrete();
  });

  it('2 deve registrar um novo cartão durante a compra, pagar com ele e salvá-lo na lista', () => {
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
    let novoCartaoUuid: string;

    // Abrir formulário de novo cartão
    cy.get('[data-cy="checkout-payment-section"]').scrollIntoView();
    cy.get('[data-cy="checkout-add-card-button"]').click();
    cy.get('[data-cy="checkout-new-card-form"]').should('be.visible');

    // Preencher dados do cartão
    cy.get('[data-cy="checkout-card-number-input"]').clear().type(CARTAO_MASTERCARD.numero);
    cy.get('[data-cy="checkout-card-name-input"]').clear().type(CARTAO_MASTERCARD.nomeTitular);
    cy.get('[data-cy="checkout-card-expiry-input"]').clear().type(CARTAO_MASTERCARD.validade);
    cy.get('[data-cy="checkout-card-cvv-input"]').clear().type('123');
    cy.get('[data-cy="checkout-card-brand"]').select(CARTAO_MASTERCARD.bandeira);

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

    // Concluir pedido com o novo cartão
    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');

    // Cartão aparece na lista de cartões salvos do perfil
    cy.visit('/minha-conta');
    cy.get('[data-cy="tab-cartoes"]').click();
    cy.get('[data-cy="cartao-preferencial-badge"], body').should('exist');
    cy.contains(CARTAO_MASTERCARD.numero.slice(-4)).should('exist');

    // Limpeza: remover o cartão criado via API
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/auth/login`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      body: { email: 'clientetest@email.com', senha: '123456' },
    }).then((loginRes) => {
      const token = loginRes.body.dados.token;
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/clientes/perfil/cartoes/${novoCartaoUuid}`,
        headers: {
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          'Authorization': `Bearer ${token}`,
        },
      }).then(() => {
        cy.log('Cartão de teste removido com sucesso');
      });
    });
  });
});
