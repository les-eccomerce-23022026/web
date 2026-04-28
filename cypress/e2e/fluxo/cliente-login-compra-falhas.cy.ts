describe('Checkout — Validações e Cenários de Falha (E2E Real)', () => {
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = Cypress.env('clienteSenha') || '@asdfJKL\u00C7123';
  const livroUuid = 'a1b2c3d4-e5f6-7890-1234-56789abcdef0'; // O Senhor dos Anéis (Seed 021)

  beforeEach(() => {
    // Força o frontend a enviar o header x-use-test-db em todas as requisições via interceptor
    Cypress.env('injectTestDbHeader', true);
    cy.loginApi(email, senha);
  });

  describe('Validações de Interface (Frontend)', () => {
    it('Deve falhar ao tentar finalizar sem endereço e frete (Validação de Frontend)', () => {
        cy.adicionarAoCarrinhoApi(livroUuid);
        cy.visit('/checkout');
 
        // Espera sair do estado de loading e garantir que a página renderizou
        cy.get('[data-cy="loading-state"]', { timeout: 15000 }).should('not.exist');
        cy.get('[data-cy="checkout-payment-section-title"]').should('be.visible');

        // Tenta finalizar sem calcular frete (o endereço já vem pré-selecionado se existir)
        cy.get('[data-cy="checkout-finish-button"]').click();
        
        // Deve mostrar validação de frete (que é a próxima após o endereço automático)
        cy.get('[data-cy="checkout-validation-error"]').should('contain', 'Selecione uma opção de frete');
    });

    it('Deve falhar ao aplicar um cupom inexistente', () => {
        cy.adicionarAoCarrinhoApi(livroUuid);
        cy.visit('/checkout');

        // Cupom inexistente
        cy.get('[data-cy="checkout-coupon-input"]').type('CUPOM_INVALIDO', { force: true });
        cy.get('[data-cy="checkout-apply-coupon-button"]').click({ force: true });
        
        // Deve mostrar erro (timeout maior para processamento)
        cy.get('[data-cy="checkout-coupon-error"]', { timeout: 10000 }).should('be.visible').should('contain', 'Cupom inválido ou expirado');
    });

    it('Deve falhar ao calcular frete para CEP inexistente', () => {
        cy.adicionarAoCarrinhoApi(livroUuid);
        cy.visit('/checkout');

        // O componente de frete geralmente permite digitar um CEP novo para simular
        // Vamos forçar um CEP que o ProvedorFreteSimulado lançará erro
        cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('00000000');
        cy.get('[data-cy="checkout-freight-calculate-button"]').click();

        cy.get('body').should('contain', 'CEP não encontrado');
    });

    it('Deve recusar o pagamento ao exceder o teto de R$ 1000 do sandbox', () => {
        cy.adicionarAoCarrinhoApi('11223344-5566-7788-9900-aabbccddeeff', 20);
        cy.adicionarAoCarrinhoApi('67890abc-def0-1234-5678-9abcdef01234', 20);
        cy.visit('/checkout');
        
        cy.get('[data-cy="loading-state"]', { timeout: 15000 }).should('not.exist');
        cy.get('[data-cy="checkout-payment-section-title"]').should('be.visible');

        // Seleciona o endereço que semeamos (UUID do seed 025)
        cy.get('[data-cy^="checkout-address-item-"]').first().click({ force: true });
        
        // Calcula o frete manualmente (necessário na UI)
        cy.get('[data-cy="checkout-freight-zip-input"]').clear({ force: true }).type('01310100');
        cy.get('[data-cy="checkout-freight-calculate-button"]').click({ force: true });

        // Seleciona uma opção de frete (espera aparecer)
        cy.get('[data-cy^="checkout-freight-option-"]', { timeout: 10000 }).first().click({ force: true });

        // Usa o botão de informar cartão que já deve estar presente na linha inicial
        // (visto que o usuário de teste não possui cartões salvos)
        cy.get('[data-cy="checkout-add-card-button"]').first().click({ force: true });
        
        // Preenche dados do cartão (Luhn válido)
        cy.get('[data-cy="checkout-card-number-input"]', { timeout: 10000 }).should('be.visible').type('4000000000000000', { force: true });
        cy.get('[data-cy="checkout-card-name-input"]').type('CLIENTE RECUSA', { force: true });
        cy.get('[data-cy="checkout-card-expiry-input"]').type('12/28', { force: true });
        cy.get('[data-cy="checkout-card-cvv-input"]').type('123', { force: true });
        cy.get('[data-cy="checkout-card-submit-button"]').click({ force: true });

        // Sincronização: Espera o modal fechar e o resumo do novo cartão aparecer
        // Isso garante que o estado do React (novosCartoesPorLinha) foi atualizado
        // e o botão de finalização está habilitado.
        cy.get('[data-cy="checkout-novo-cartao-resumo"]').should('be.visible').and('contain', '•••• 0000');

        // Tenta finalizar
        cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click({ force: true });

        // Deve exibir a mensagem de erro vinda do backend (propagada pelo useFinalizarCompra)
        cy.get('body', { timeout: 15000 }).should('contain', 'Pagamento recusado');
        // A URL não deve ter mudado para sucesso
        cy.url().should('include', '/checkout');
    });
  });
});
