/**
 * Testes E2E de Pagamento - Sprint 2
 * User Story 3 e 4
 * 
 * Testa o fluxo completo de pagamento no checkout
 */

/** Endereço + frete mínimos para habilitar "Concluir Pedido" (fluxo integrado). */
function preencherEntregaCheckoutMinimo() {
  cy.get('[data-cy^="checkout-address-item-"]').first().click({ force: true });
  cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
  cy.get('[data-cy="checkout-freight-calculate-button"]').click();
  cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
  cy.get('[data-cy="checkout-freight-option-PAC"]').click({ force: true });
}

/** Split: segunda linha com cartão salvo (fixture card-002) e valores que fecham o total (~94,90). */
function configurarSplitDoisCartoesSalvos() {
  cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('50');
  cy.get('[data-cy="checkout-split-add-saved-card"]').click();
  cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select('card-002');
  cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type('44.90');
}

function abrirModalNovoCartaoNaSegundaLinha() {
  cy.get('[data-cy="checkout-split-add-new-card"]').click();
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="checkout-split-inform-new-card"]').length) {
      cy.get('[data-cy="checkout-split-inform-new-card"]').click();
    } else {
      cy.get('[data-cy="checkout-add-card-button"]').click();
    }
  });
}

describe('Pagamento - Checkout', () => {
  beforeEach(() => {
    // Login como cliente
    cy.loginCliente();
    
    // Adicionar item ao carrinho
    cy.visit('/');
    cy.get('[data-cy="livro-card"]').first().click();
    cy.get('[data-cy="adicionar-carrinho-button"]').click();
    
    // Ir para checkout
    cy.visit('/checkout');
  });

  describe('Seleção de Cartão', () => {
    it('deve exibir cartões salvos do cliente', () => {
      cy.get('[data-cy="checkout-saved-cards"]')
        .should('exist');
      
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('exist')
        .should('contain', 'Mastercard');
    });

    it('deve selecionar cartão salvo', () => {
      cy.get('[data-cy="checkout-card-item-1234"]')
        .click();
      
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('have.class', 'selecionado');
    });

    it('deve abrir modal para novo cartão', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      cy.get('[data-cy="checkout-new-card-form"]').should('be.visible');
    });

    it('deve preencher e validar novo cartão', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      // Preencher dados do cartão Visa válido (número de teste)
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111111');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      // Verificar se bandeira foi detectada
      cy.get('[data-cy="checkout-card-brand"]')
        .should('contain', 'Visa');
      
      // Salvar cartão
      cy.get('[data-cy="checkout-save-card-checkbox"]')
        .check();
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Verificar que cartão foi adicionado
      cy.get('[data-cy="checkout-new-card-form"]')
        .should('not.exist');
    });

    it('deve validar número de cartão com Luhn', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      // Número inválido (falha no Luhn)
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111112');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist')
        .should('contain', 'inválido');
    });

    it('deve validar cartão expirado', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111111');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      // Data expirada
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('01/20');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist')
        .should('contain', 'expirado');
    });

    it('deve detectar bandeira American Express e validar CVV de 4 dígitos', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      // Amex número
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('378282246310005');
      
      cy.get('[data-cy="checkout-card-brand"]')
        .should('contain', 'American Express');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('1234');
      
      // CVV de 4 dígitos deve ser aceito
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro de CVV se tentar com 3 dígitos
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .clear()
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist');
    });
  });

  describe('Cupons de Desconto', () => {
    it('deve aplicar cupom promocional', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('exist');
    });

    it('deve aplicar cupom de troca', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA50');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-TROCA50"]')
        .should('exist');
    });

    it('deve remover cupom aplicado', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-remove-DESCONTO10"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('not.exist');
    });

    it('deve validar limite de 1 cupom promocional', () => {
      // Aplicar primeiro cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      // Tentar aplicar segundo cupom promocional
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO20');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-error"]')
        .should('exist')
        .should('contain', 'Apenas um cupom promocional');
    });

    it('deve permitir múltiplos cupons de troca', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA50');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA30');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      // Ambos devem estar aplicados
      cy.get('[data-cy="checkout-coupon-TROCA50"]')
        .should('exist');
    });

    it('deve mostrar sugestões de cupons disponíveis', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .focus();
      
      cy.get('[data-cy="checkout-coupon-suggestions"]')
        .should('be.visible');
      
      cy.get('[data-cy="checkout-coupon-suggestion-DESCONTO10"]')
        .should('exist');
    });

    it('deve aplicar cupom da sugestão', () => {
      cy.get('[data-cy="checkout-coupon-input"]')
        .focus();
      
      cy.get('[data-cy="checkout-coupon-suggestion-DESCONTO10"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]')
        .should('exist');
    });
  });

  describe('Pagamento Parcial (Múltiplos Cartões)', () => {
    it('deve exibir opção de pagamento parcial', () => {
      cy.get('[data-cy="checkout-partial-payment"]').should('exist');
      cy.get('[data-cy="checkout-split-payment"]').should('exist');
    });

    it('deve adicionar pagamento parcial com cartão', () => {
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');
    });

    it('deve exibir valor por parcela e rótulo sem juros ou com juros no select', () => {
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('100');
      cy.get('[data-cy="checkout-split-line-parcelas"]')
        .first()
        .find('option[value="3"]')
        .should('contain', '3x de R$ 33,33')
        .should('contain', 'sem juros');
      cy.get('[data-cy="checkout-split-line-parcelas"]')
        .first()
        .find('option[value="10"]')
        .should('contain', '10x de R$ 10,00')
        .should('contain', 'com juros');
    });

    it('deve validar valor mínimo de R$ 10,00 por cartão no split (RN0034)', () => {
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('85');
      cy.get('[data-cy="checkout-split-add-saved-card"]').click();
      cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select('card-002');
      cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type('5');
      cy.get('[data-cy="checkout-split-rn34-error"]').should('exist').should('contain', 'mínimo');
    });

    it('deve remover linha de pagamento parcial', () => {
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-remove-line-1"]').click();
      cy.get('[data-cy="checkout-split-line-1"]').should('not.exist');
    });

    it('deve indicar ajuste quando soma das linhas não fecha o total', () => {
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('9999');
      cy.get('[data-cy="checkout-split-restante"]').should('contain', 'Ajuste');
    });

    it('deve mostrar OK no restante quando valor total coberto nas linhas', () => {
      cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');
    });
  });

  describe('Finalização de Compra', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('GET', `${apiUrl}/pagamento/info`, { fixture: 'pagamento-info-checkout.json' });
      cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' });
      cy.intercept('POST', `${apiUrl}/vendas`, {
        statusCode: 201,
        body: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', status: 'EM PROCESSAMENTO' },
      }).as('criarVendaCheckout');

      let selecionarCount = 0;
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`, (req) => {
        selecionarCount += 1;
        const raw = req.body as unknown;
        const body =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
        const tipo = (body?.tipoPagamento as string) ?? 'cupom_promocional';
        const valor = typeof body?.valor === 'number' ? body.valor : 0;
        req.reply({
          statusCode: 201,
          body: {
            id: `pay-selecionar-${selecionarCount}`,
            vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            valor,
            formaPagamento: {
              tipo,
              detalhes: tipo === 'cupom_promocional' ? 'DESCONTO10' : 'cartão',
            },
            status: 'pendente',
            criadoEm: new Date().toISOString(),
          },
        });
      });

      cy.intercept('POST', '**/pagamentos/*/processar', (req) => {
        const id = req.url.split('/pagamentos/')[1]?.split('/')[0] ?? 'pay-processado';
        req.reply({
          statusCode: 200,
          body: {
            id,
            vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            valor: 60,
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
          id: 'entrega-e2e-1',
          vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          tipoFrete: 'PAC',
          custo: 15,
          endereco: { rua: 'Rua', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000000' },
          criadoEm: new Date().toISOString(),
        },
      }).as('cadastrarEntregaCheckout');

      cy.visit('/checkout');
    });

    it('deve finalizar compra com cartão selecionado', () => {
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-card-item-1234"]').click();

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve POST em clientes/perfil/cartoes ao finalizar com novo cartão e salvar para compras futuras', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('POST', `${apiUrl}/clientes/perfil/cartoes`, (req) => {
        const body =
          typeof req.body === 'string'
            ? (JSON.parse(req.body) as Record<string, unknown>)
            : (req.body as Record<string, unknown>);
        expect(body.ultimosDigitosCartao).to.eq('1111');
        req.reply({
          statusCode: 201,
          body: {
            uuid: 'cartao-e2e-checkout-salvar',
            ultimosDigitosCartao: '1111',
            nomeImpresso: 'JOAO DA SILVA',
            bandeira: 'Visa',
            validade: '2030-12',
            principal: false,
          },
        });
      }).as('salvarCartaoPerfilCheckout');

      preencherEntregaCheckoutMinimo();
      abrirModalNovoCartaoNaSegundaLinha();
      cy.get('[data-cy="checkout-card-number-input"]').type('4111111111111111');
      cy.get('[data-cy="checkout-card-name-input"]').type('JOAO DA SILVA');
      cy.get('[data-cy="checkout-card-expiry-input"]').type('12/30');
      cy.get('[data-cy="checkout-card-cvv-input"]').type('123');
      cy.get('[data-cy="checkout-save-card-checkbox"]').check();
      cy.get('[data-cy="checkout-card-submit-button"]').click();
      cy.get('[data-cy="checkout-new-card-form"]').should('not.exist');

      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.wait('@salvarCartaoPerfilCheckout');
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve concluir pedido mesmo se salvar cartão no perfil falhar (aviso sem bloquear)', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('POST', `${apiUrl}/clientes/perfil/cartoes`, {
        statusCode: 500,
        body: { mensagem: 'Erro ao cadastrar cartão' },
      }).as('salvarCartaoPerfilFalha');

      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertSalvarCartao');
      });

      preencherEntregaCheckoutMinimo();
      abrirModalNovoCartaoNaSegundaLinha();
      cy.get('[data-cy="checkout-card-number-input"]').type('4111111111111111');
      cy.get('[data-cy="checkout-card-name-input"]').type('JOAO DA SILVA');
      cy.get('[data-cy="checkout-card-expiry-input"]').type('12/30');
      cy.get('[data-cy="checkout-card-cvv-input"]').type('123');
      cy.get('[data-cy="checkout-save-card-checkbox"]').check();
      cy.get('[data-cy="checkout-card-submit-button"]').click();
      cy.get('[data-cy="checkout-new-card-form"]').should('not.exist');

      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.wait('@salvarCartaoPerfilFalha');
      cy.get('@alertSalvarCartao').should('have.been.called');
      cy.get('@alertSalvarCartao').should('have.been.calledWithMatch', /não foi salvo no perfil/);
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com cupom aplicado', () => {
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      cy.get('[data-cy="checkout-card-item-1234"]').click();

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com pagamento parcial', () => {
      preencherEntregaCheckoutMinimo();
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com split cartão + PIX', () => {
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('50');
      cy.get('[data-cy="checkout-split-add-pix"]').click();
      cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type('44.90');
      cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.url().should('include', '/pagamento-pix');
      cy.get('[data-cy="pagamento-pix-page"]').should('be.visible');
      cy.get('[data-cy="pagamento-pix-simular-webhook"]').click();
      cy.url({ timeout: 20000 }).should('include', '/pedido-confirmado');
    });

    it('deve manter botão desabilitado sem forma de pagamento (com entrega ok)', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('GET', `${apiUrl}/pagamento/info`, { fixture: 'pagamento-info-checkout-sem-cartoes.json' });
      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
    });

    it('deve atualizar resumo com desconto de cupom', () => {
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      cy.get('[data-cy="checkout-summary-list"]').should('contain', 'Cupons Aplicados');
    });

    it('deve atualizar resumo com pagamento parcial', () => {
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('50');

      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Pago com Cartões')
        .and('contain', 'R$ 50,00');
    });

    it('deve enviar cotacaoUuid da cotação ao criar venda', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('POST', `${apiUrl}/vendas`, (req) => {
        const raw = req.body as unknown;
        const body =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
        expect(body.cotacaoUuid).to.eq('cot-pac-1');
        req.reply({
          statusCode: 201,
          body: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', status: 'EM PROCESSAMENTO' },
        });
      }).as('criarVendaComCotacao');

      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-card-item-1234"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.wait('@criarVendaComCotacao');
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve permitir cupom promocional e cupom de troca e finalizar', () => {
      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]').should('exist');
      cy.get('[data-cy="checkout-coupon-input"]').type('TROCA50');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();
      cy.get('[data-cy="checkout-coupon-TROCA50"]').should('exist');
      cy.get('[data-cy="checkout-card-item-1234"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve manter botão desabilitado quando saldo não está coberto (parcial sem cartão do restante)', () => {
      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('10');
      cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
      cy.contains('cubram o total restante').should('exist');
    });

    it('deve alertar erro quando POST /vendas falha', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      cy.intercept('POST', `${apiUrl}/vendas`, {
        statusCode: 400,
        body: { mensagem: 'Cotação inválida ou expirada' },
      }).as('vendaFalha');

      cy.visit('/checkout');
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertVenda');
      });
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-card-item-1234"]').click();
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.wait('@vendaFalha');
      cy.get('@alertVenda').should('have.been.called');
      cy.url().should('not.include', '/pedido-confirmado');
    });
  });

  describe('Validações de Segurança', () => {
    it('deve mascarar número do cartão na UI', () => {
      cy.get('[data-cy="checkout-card-item-1234"]')
        .should('contain', '•••• 1234');
    });

    it('deve permitir visualizar CVV', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      // Clicar no botão de visualizar
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .parent()
        .find('button')
        .click();
      
      // CVV deve estar visível (type="text")
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .should('have.attr', 'type', 'text');
    });

    it('deve validar bandeiras permitidas', () => {
      abrirModalNovoCartaoNaSegundaLinha();
      
      // Tentar cartão com bandeira não suportada
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('6011111111111117'); // Discover (não suportada)
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      // Deve mostrar erro ou não permitir
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist');
    });
  });
});
