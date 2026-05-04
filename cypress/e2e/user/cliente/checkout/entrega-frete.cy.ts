/**
 * Testes E2E de Entrega/Frete - Sprint 3
 * User Story 5 e 6
 *
 * Testa o fluxo completo de cálculo de frete e seleção de entrega
 *
 * NOTA: Esta suíte mantém o fluxo completo pela UI (catálogo → carrinho → checkout)
 * em vez de usar API-only para preparar o carrinho. Isso é intencional porque:
 * - A suíte usa intercept mock de frete + ordem complexa de describe/beforeEach aninhados
 * - Testes de "atualizar total com frete" são sensíveis ao estado de Redux
 * - O custo-benefício de refatorar 20+ testes não compensa
 * - O tempo de execução adicional é aceitável para cobertura de edge cases críticos
 *
 * Para suítes que podem se beneficiar de API + hidratação controlada,
 * veja o comando `prepararCarrinhoComUmLivroHidratado` em commands.ts
 */

interface CartaoCliente {
  ultimosDigitosCartao: string;
  bandeira: string;
}

interface PagamentoInfoResponse {
  enderecosCliente: unknown[];
  cartoesCliente: CartaoCliente[];
}

/** Headers para requests autenticados com banco de testes */
function apiHeadersTestDb(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

/** Obtém cartões do cliente via API para seleção dinâmica no checkout */
function obterCartoesCliente() {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  return cy.request<PagamentoInfoResponse>({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers: apiHeadersTestDb(),
  }).its('body.cartoesCliente');
}

/** Seleciona o primeiro cartão disponível do cliente no checkout */
function selecionarPrimeiroCartaoCheckout() {
  obterCartoesCliente().should('be.an', 'array').should('have.length.at.least', 1).then((cartoes) => {
    const primeiro = cartoes[0];
    cy.get(`[data-cy="checkout-card-item-${primeiro.ultimosDigitosCartao}"]`)
      .scrollIntoView()
      .should('be.visible')
      .click();
  });
}

describe('Entrega/Frete - Checkout', () => {
  beforeEach(() => {
    const email = (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
    const senha =
      (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';
    
    // Login primeiro para ter permissão de limpar o carrinho
    cy.loginApi(email, senha);
    cy.limparCarrinhoApi();
    cy.garantirEnderecoApi();
    
    cy.adicionarPrimeiroLivroAoCarrinhoPelaTelaDetalhe();

    cy.url().should('include', '/carrinho');
    cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');

    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');
  });

  describe('Cálculo de Frete', () => {
    it('deve exibir campo de CEP para cálculo', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .should('exist');
    });

    it('deve formatar CEP automaticamente', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000000')
        .should('have.value', '01000-000');
    });

    it('deve calcular frete ao clicar em calcular', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
    });

    it('deve mostrar erro para CEP inválido', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('12345');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it('deve calcular frete ao pressionar Enter', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000{enter}');

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
    });

    it('deve mostrar opções PAC, SEDEX e Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('exist');
    });

    it('deve mostrar frete grátis para Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');

      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('contain', 'Grátis');
    });
  });

  describe('Seleção de Frete', () => {
    beforeEach(() => {
      // Calcular frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
    });

    it('deve selecionar opção de frete PAC', () => {
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('have.attr', 'data-selected', 'true');
    });

    it('deve selecionar opção de frete SEDEX', () => {
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('have.attr', 'data-selected', 'true');
    });

    it('deve selecionar opção Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-RETIRA_EM_LOJA"]')
        .should('have.attr', 'data-selected', 'true');
    });

    it('deve atualizar resumo com valor do frete', () => {
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Frete')
        .and('contain', 'R$ 30,00');
    });

    it('deve atualizar total com frete', () => {
      // Pega o subtotal atual da tela antes de somar o frete
      cy.get('[data-cy="checkout-summary-list"]')
        .contains(/Subtotal/)
        .invoke('text')
        .then((text) => {
          // Extrai apenas o valor numérico (ex: R$ 49,90 -> 49.90)
          const match = text.match(/R\$\s*([\d,.]+)/);
          if (!match) throw new Error(`Não foi possível encontrar valor em: ${text}`);
          
          const subtotalValue = parseFloat(match[1].replace(',', '.'));
          const freteSedex = 30.00;
          const totalEsperado = subtotalValue + freteSedex;
          
          cy.get('[data-cy="checkout-freight-option-SEDEX"]')
            .scrollIntoView()
            .should('be.visible')
            .click();
          
          cy.get('[data-cy="checkout-total-value"]')
            .should('contain', `R$ ${totalEsperado.toFixed(2).replace('.', ',')}`);
        });
    });

    it('deve permitir trocar seleção de frete', () => {
      // Selecionar PAC
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('have.attr', 'data-selected', 'true');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('have.attr', 'data-selected', 'false');
      
      // Trocar para SEDEX
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('have.attr', 'data-selected', 'true');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('have.attr', 'data-selected', 'false');
    });
  });

  describe('Endereço de Entrega', () => {
    it('deve exibir endereços disponíveis do cliente', () => {
      cy.get('[data-cy="checkout-addresses"]')
        .should('exist');
    });

    it('deve selecionar endereço de entrega', () => {
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .should('have.attr', 'data-selected', 'true');
    });

    it('deve mostrar confirmação de endereço selecionado', () => {
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      cy.get('[data-cy="checkout-addresses"]')
        .parent()
        .should('contain', 'Endereço selecionado para entrega');
    });

    it('deve habilitar botão de finalizar apenas com endereço selecionado', () => {
      // Sem endereço nem frete, botão deve estar desabilitado (ou sem pagamento)
      // Nota: o sistema pode exigir Endereço + Frete + Pagamento
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
      
      // Selecionar endereço
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Selecionar frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .clear()
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Selecionar pagamento (para habilitar o botão final)
      selecionarPrimeiroCartaoCheckout();
      
      // Botão deve estar habilitado
      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled');
    });
  });

  describe('Fluxo Completo de Entrega', () => {
    it.skip('deve completar fluxo de entrega e frete', () => {
      /* Fluxo completo de finalização requer backend real (POST /vendas, /pagamentos, /entregas).
       * Este teste foi marcado como skip porque depende de mocks que foram removidos.
       * Para reativar, as rotas do backend devem estar funcionando com dados reais do seed.
       */

      // 1. Selecionar endereço
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .click();
      
      // 2. Calcular frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      // 3. Selecionar frete
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .click();
      
      // 4. Verificar resumo atualizado
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Frete')
        .and('contain', 'R$ 30,00');
      
      // 5. Selecionar pagamento
      selecionarPrimeiroCartaoCheckout();
      
      // 6. Verificar mensagem de confirmação
      cy.get('[data-cy="checkout-addresses"]')
        .parent()
        .should('contain', 'Endereço selecionado para entrega');
      
      cy.get('[data-cy="checkout-freight-options"]')
        .parent()
        .should('contain', 'Frete SEDEX selecionado');
      
      // 7. Finalizar compra
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      // 8. Redirecionar para confirmação
      cy.url()
        .should('include', '/pedido-confirmado');
    });

    it('deve mostrar erro se tentar finalizar sem endereço', () => {
      // Calcular e selecionar frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .click();
      
      // Selecionar pagamento
      selecionarPrimeiroCartaoCheckout();
      
      // Botão deve estar desabilitado sem endereço
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
    });

    it('deve mostrar erro se tentar finalizar sem frete', () => {
      // Selecionar endereço
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .click();
      
      // Selecionar pagamento
      selecionarPrimeiroCartaoCheckout();
      
      // Botão deve estar desabilitado sem frete
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
    });
  });

  describe('Validações de Segurança', () => {
    it('deve validar formato do CEP', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('abcde-fgh');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it.skip('deve validar CEP com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('1234567'); // 7 dígitos
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });

    it('deve permitir CEP válido com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000000'); // 8 dígitos sem traço
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
    });
  });

  describe('Informações de Frete', () => {
    it('deve mostrar prazo de entrega para cada opção', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .should('contain', '5-7 dias');
      
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .should('contain', '1-2 dias');
    });

    it('deve mostrar informações adicionais de frete', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 })
        .should('exist');
      
      // Verificar informações adicionais
      cy.get('[data-cy="checkout-freight-options"]')
        .parent()
        .should('contain', 'CEP de Origem');
    });
  });
});
