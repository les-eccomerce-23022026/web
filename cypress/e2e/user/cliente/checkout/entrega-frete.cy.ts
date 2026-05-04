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

describe('Entrega/Frete - Checkout', () => {
  beforeEach(() => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' }).as('freteCotar');

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

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-options"]')
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

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });

    it('deve mostrar opções PAC, SEDEX e Retira em Loja', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.wait('@freteCotar', { timeout: 15000 });
      
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

      cy.wait('@freteCotar', { timeout: 15000 });

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

      cy.wait('@freteCotar', { timeout: 15000 });
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

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Selecionar pagamento (para habilitar o botão final)
      cy.get('[data-cy="checkout-card-item-4444"]')
        .scrollIntoView()
        .should('be.visible')
        .click();
      
      // Botão deve estar habilitado
      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled');
    });
  });

  describe('Fluxo Completo de Entrega', () => {
    it('deve completar fluxo de entrega e frete', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      const vendaUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      cy.intercept('POST', `${apiUrl}/vendas`, {
        statusCode: 201,
        body: { id: vendaUuid, status: 'EM PROCESSAMENTO' },
      });

      let selecionarCount = 0;
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`, (req) => {
        selecionarCount += 1;
        const raw = req.body as unknown;
        const body =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
        const tipo = (body?.tipoPagamento as string) ?? 'cartao_credito';
        const valor = typeof body?.valor === 'number' ? body.valor : 0;
        req.reply({
          statusCode: 201,
          body: {
            id: `pay-${selecionarCount}`,
            vendaUuid,
            valor,
            formaPagamento: { tipo, detalhes: 'e2e' },
            status: 'pendente',
            criadoEm: new Date().toISOString(),
          },
        });
      });

      cy.intercept('POST', '**/pagamentos/*/processar', (req) => {
        const id = req.url.split('/pagamentos/')[1]?.split('/')[0] ?? 'pay-proc';
        req.reply({
          statusCode: 200,
          body: {
            id,
            vendaUuid,
            valor: 100,
            formaPagamento: { tipo: 'cartao_credito' },
            status: 'aprovado',
            criadoEm: new Date().toISOString(),
            processadoEm: new Date().toISOString(),
          },
        });
      });

      cy.intercept('POST', `${apiUrl}/entregas`, {
        statusCode: 201,
        body: {
          id: 'entrega-e2e',
          vendaUuid,
          tipoFrete: 'SEDEX',
          custo: 30,
          endereco: { rua: 'Rua', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000000' },
          criadoEm: new Date().toISOString(),
        },
      });

      // 1. Selecionar endereço
      cy.get('[data-cy^="checkout-address-item-"]')
        .first()
        .click();
      
      // 2. Calcular frete
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
      
      // 3. Selecionar frete
      cy.get('[data-cy="checkout-freight-option-SEDEX"]')
        .click();
      
      // 4. Verificar resumo atualizado
      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Frete')
        .and('contain', 'R$ 30,00');
      
      // 5. Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-4444"]')
        .click();
      
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

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-option-PAC"]')
        .click();
      
      // Selecionar pagamento
      cy.get('[data-cy="checkout-card-item-4444"]')
        .click();
      
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
      cy.get('[data-cy="checkout-card-item-4444"]')
        .click();
      
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

    it('deve validar CEP com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('1234567'); // 7 dígitos
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();
      
      cy.get('[data-cy="checkout-freight-error"]')
        .should('exist');
    });

    it('deve permitir CEP válido com 8 dígitos', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000000'); // 8 dígitos sem traço
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.wait('@freteCotar', { timeout: 15000 });
      
      cy.get('[data-cy="checkout-freight-options"]')
        .should('exist');
    });
  });

  describe('Informações de Frete', () => {
    it('deve mostrar prazo de entrega para cada opção', () => {
      cy.get('[data-cy="checkout-freight-zip-input"]')
        .type('01000-000');
      
      cy.get('[data-cy="checkout-freight-calculate-button"]')
        .click();

      cy.wait('@freteCotar', { timeout: 15000 });
      
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

      cy.wait('@freteCotar', { timeout: 15000 });
      
      // Verificar informações adicionais
      cy.get('[data-cy="checkout-freight-options"]')
        .parent()
        .should('contain', 'CEP de Origem');
    });
  });
});
