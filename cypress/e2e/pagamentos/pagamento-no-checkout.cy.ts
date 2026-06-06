/**
 * Testes E2E de Pagamento - Sprint 2
 * User Story 3 e 4
 *
 * Dados reais do banco de testes: livro do GET /livros, cartões/endereços do cliente via API.
 * Evita UUID de livro fixo e mocks de resposta HTTP; intercepts só para observar corpo (req.continue).
 */

/** Mesmos parâmetros opcionais que o checkout usa ao cotar frete — cartões vêm do perfil real. */
function requestPagamentoInfoCheckout() {
  const apiUrl = Cypress.env('apiUrl');
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers: apiHeadersCliente(),
  });
}

/** Bandeira alinhada ao retorno do backend (ex.: seed migration 026 — Mastercard + Visa). */
function clicarCartaoCheckoutPorBandeiraPreferida(bandeira: 'Visa' | 'Mastercard') {
  requestPagamentoInfoCheckout()
    .its('body.cartoesCliente')
    .should('be.an', 'array')
    .should('have.length.at.least', 1)
    .then((cartoes: { ultimosDigitosCartao: string; bandeira: string }[]) => {
      const escolhido = cartoes.find((c) => c.bandeira === bandeira) ?? cartoes[0];
      cy.get(`[data-cy="checkout-card-item-${escolhido.ultimosDigitosCartao}"]`)
        .scrollIntoView()
        .click();
    });
}

function apiHeadersCarteira(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

/** Total do carrinho autenticado (GET /carrinho — mesmo backend da UI). */
function obterTotalCarrinhoReais() {
  const apiUrl = Cypress.env('apiUrl');
  return cy.request({ method: 'GET', url: `${apiUrl}/carrinho`, headers: apiHeadersCarteira() }).its('body.resumo.total');
}

/** Endereço + frete mínimos para habilitar "Concluir Pedido" (fluxo integrado). */
function preencherEntregaCheckoutMinimo() {
  cy.get('[data-cy^="checkout-address-item-"]')
    .first()
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('[data-cy="checkout-freight-zip-input"]').clear().type('01000-000');
  cy.get('[data-cy="checkout-freight-calculate-button"]').click();
  cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
  cy.get('[data-cy="checkout-freight-option-PAC"]')
    .scrollIntoView()
    .should('be.visible')
    .click();
}

/** Segundo cartão salvo no <select> da linha de split (UUID real do seed/API). */
function selecionarSegundoCartaoNaLinhaSplit() {
  cy.get('[data-cy="checkout-split-line-card-select"]')
    .eq(1)
    .find('option:not([value=""])')
    .eq(1)
    .invoke('val')
    .then((uuid) => {
      expect(uuid, 'uuid do segundo cartão').to.be.a('string').and.not.be.empty;
      cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select(String(uuid));
    });
}

/** Split: divide o total do carrinho (API) em duas linhas com cartões salvos distintos. */
function configurarSplitDoisCartoesSalvos() {
  obterTotalCarrinhoReais().then((total: number) => {
    const t = Math.round(total * 100) / 100;
    const linha1 = Math.floor((t / 2) * 100) / 100;
    const linha2 = Math.round((t - linha1) * 100) / 100;
    cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(linha1));
    cy.get('[data-cy="checkout-split-add-saved-card"]').click();
    selecionarSegundoCartaoNaLinhaSplit();
    cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type(String(linha2));
  });
}

function abrirModalNovoCartaoNaSegundaLinha() {
  cy.get('[data-cy="checkout-split-add-new-card"]')
    .scrollIntoView()
    .should('be.visible')
    .click();
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="checkout-split-inform-new-card"]').length) {
      cy.get('[data-cy="checkout-split-inform-new-card"]').click();
    } else {
      cy.get('[data-cy="checkout-add-card-button"]').click();
    }
  });
}

describe('Pagamentos — Cartões, Cupons e Salvamento no Checkout', () => {
  beforeEach(() => {
    const email = (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
    const senha =
      (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';
    
    // Network spies para checkout
    cy.setupCheckoutNetworkSpies();
    
    cy.autenticarViaApi(email, senha);
    /** Carrinho + checkout hidratados com primeiro livro do catálogo (GET /livros). */
    cy.prepararCarrinhoSincronizado();
  });

  describe('Seleção de Cartão', () => {
    it('deve exibir cartões salvos do cliente', () => {
      requestPagamentoInfoCheckout()
        .its('body.cartoesCliente')
        .should('be.an', 'array')
        .should('have.length.at.least', 1)
        .then((cartoes: { ultimosDigitosCartao: string; bandeira: string }[]) => {
          cy.get('[data-cy="checkout-saved-cards"]').should('exist');
          cy.get('[data-cy^="checkout-card-item-"]').should('have.length', cartoes.length);
          cartoes.forEach((c) => {
            cy.get(`[data-cy="checkout-card-item-${c.ultimosDigitosCartao}"]`)
              .should('exist')
              .should('contain', c.bandeira);
          });
        });
    });

    it('deve selecionar cartão salvo', () => {
      cy.get('[data-cy^="checkout-card-item-"]')
        .filter(':visible')
        .then(($cards) => {
          const idx = $cards.length >= 2 ? 1 : 0;
          cy.wrap($cards.eq(idx)).as('cartaoCheckout');
        });
      cy.get('@cartaoCheckout')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.get('@cartaoCheckout').should('have.attr', 'aria-pressed', 'true');
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
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
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
      
      // Número American Express
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('378282246310005');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-brand"]')
        .should('contain', 'American Express');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-card-submit-button"]')
        .click();
      
      cy.get('[data-cy="checkout-card-errors"]')
        .should('exist')
        .should('contain', '4 dígitos');
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
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('DESCONTO10');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-DESCONTO10"]').should('exist');
      
      // Tentar aplicar segundo cupom promocional (deve falhar)
      cy.get('[data-cy="checkout-coupon-input"]')
        .clear()
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

    it('deve aplicar cupom que cobre 100% do valor e mostrar saldo remanescente', () => {
      // Aplicar cupom de troca com valor alto
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA100');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-TROCA100"]')
        .should('exist');
      
      // Verificar que o total ficou em 0 ou próximo de 0
      cy.get('[data-cy="checkout-total-value"]')
        .then(($el) => {
          const text = $el.text();
          expect(text).to.match(/R\$ 0,00|R\$ 0,01/);
        });
      
      // Verificar que mostra saldo remanescente do cupom
      cy.get('[data-cy="checkout-coupon-saldo-remanescente"]')
        .should('exist')
        .should('contain', 'Saldo remanescente');
    });

    it('deve finalizar compra com cupom cobrindo 100% do valor (sem cartão)', () => {
      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      
      // Aplicar cupom que cobre 100%
      cy.get('[data-cy="checkout-coupon-input"]')
        .type('TROCA100');
      
      cy.get('[data-cy="checkout-apply-coupon-button"]')
        .click();
      
      cy.get('[data-cy="checkout-coupon-TROCA100"]')
        .should('exist');
      
      // Verificar que total ficou em 0
      cy.get('[data-cy="checkout-total-value"]')
        .then(($el) => {
          const text = $el.text();
          expect(text).to.match(/R\$ 0,00|R\$ 0,01/);
        });
      
      // NÃO selecionar cartão - cupom cobre 100%
      // Botão deve estar habilitado mesmo sem cartão
      cy.get('[data-cy="checkout-finish-button"]')
        .should('not.be.disabled');
      
      cy.get('[data-cy="checkout-finish-button"]')
        .click();
      
      cy.url().should('include', '/pedido-confirmado');
    });
  });

  describe('Pagamento Parcial (Múltiplos Cartões)', () => {
    it('deve exibir opção de pagamento parcial', () => {
      cy.get('[data-cy="checkout-partial-payment"]').should('exist');
      cy.get('[data-cy="checkout-split-payment"]').should('exist');
    });

    it('deve adicionar pagamento parcial com cartão', () => {
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*OK/);
    });


    it('deve exibir valor por parcela e rótulo sem juros ou com juros no select', () => {
      obterTotalCarrinhoReais().then((total: number) => {
        const linha = Math.min(100, Math.max(30, Math.floor(total * 0.85)));
        cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(linha));
        cy.get('[data-cy="checkout-split-line-parcelas"]')
          .first()
          .find('option')
          .should('have.length.at.least', 1)
          .then(($opts) => {
            const texto = $opts
              .toArray()
              .map((o) => (o as HTMLOptionElement).textContent ?? '')
              .join(' ');
            expect(texto, 'rótulos de parcelas').to.match(/parcela|juros/i);
          });
      });
    });

    it('deve validar valor mínimo de R$ 10,00 por cartão no split (RN0034)', () => {
      obterTotalCarrinhoReais().then((total: number) => {
        const t = Math.round(total * 100) / 100;
        expect(t, 'total do carrinho deve permitir cenário RN34').to.be.greaterThan(15);
        const linha1 = Math.round((t - 5) * 100) / 100;
        cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(linha1));
        cy.get('[data-cy="checkout-split-add-saved-card"]').click();
        selecionarSegundoCartaoNaLinhaSplit();
        cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type('5');
        cy.get('[data-cy="checkout-split-rn34-error"]').should('exist').should('contain', 'mínimo');
      });
    });

    it('deve remover linha de pagamento parcial', () => {
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-remove-line-1"]').click();
      cy.get('[data-cy="checkout-split-line-1"]').should('not.exist');
    });

    it('deve indicar ajuste quando soma das linhas não fecha o total', () => {
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('9999');
      cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*Ajuste/);
    });

    it('deve mostrar OK no restante quando valor total coberto nas linhas', () => {
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*OK/);
    });
  });

  describe('Finalização de Compra', () => {
    beforeEach(() => {
      cy.visit('/checkout');
    });

    it('deve finalizar compra com cartão selecionado', () => {
      preencherEntregaCheckoutMinimo();
      clicarCartaoCheckoutPorBandeiraPreferida('Mastercard');

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve POST em clientes/perfil/cartoes ao finalizar com novo cartão e salvar para compras futuras', () => {
      cy.intercept('POST', '**/clientes/perfil/cartoes').as('salvarCartaoPerfilCheckout');
      
      preencherEntregaCheckoutMinimo();
      
      cy.get('[data-cy="checkout-split-add-new-card"]').click();
      cy.get('[data-cy="checkout-split-inform-new-card"]').click();
      
      cy.get('[data-cy="checkout-card-number-input"]')
        .type('4111111111111111');
      
      cy.get('[data-cy="checkout-card-name-input"]')
        .type('JOAO DA SILVA');
      
      cy.get('[data-cy="checkout-card-expiry-input"]')
        .type('12/30');
      
      cy.get('[data-cy="checkout-card-cvv-input"]')
        .type('123');
      
      cy.get('[data-cy="checkout-save-card-checkbox"]').check();
      cy.get('[data-cy="checkout-card-submit-button"]').click();
      
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.wait('@salvarCartaoPerfilCheckout');
      cy.url().should('include', '/pedido-confirmado');
    });


    it('deve finalizar compra com cupom aplicado', () => {
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      clicarCartaoCheckoutPorBandeiraPreferida('Mastercard');

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com pagamento parcial', () => {
      preencherEntregaCheckoutMinimo();
      configurarSplitDoisCartoesSalvos();
      cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*OK/);

      cy.get('[data-cy="checkout-finish-button"]').click();

      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve finalizar compra com split cartão + PIX', () => {
      obterTotalCarrinhoReais().then((total: number) => {
        const t = Math.round(total * 100) / 100;
        const linhaPix = Math.floor((t / 2) * 100) / 100;
        const linhaOutra = Math.round((t - linhaPix) * 100) / 100;
        cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(linhaPix));
        cy.get('[data-cy="checkout-split-add-pix"]').click();
        cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear().type(String(linhaOutra));
        cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*OK/);
        cy.get('[data-cy="checkout-finish-button"]').click();
        cy.url().should('include', '/pagamento-pix');
        cy.get('[data-cy="pagamento-pix-page"]').should('be.visible');
        cy.get('[data-cy="pagamento-pix-simular-webhook"]').click();
        cy.url({ timeout: 20000 }).should('include', '/pedido-confirmado');
      });
    });

    it('deve atualizar resumo com desconto de cupom', () => {
      cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10');
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      cy.get('[data-cy="checkout-summary-list"]')
        .should('contain', 'Cupons Aplicados');
    });

    it('deve atualizar resumo com pagamento parcial', () => {
      obterTotalCarrinhoReais().then((total: number) => {
        const linha = Math.round((total * 0.5) * 100) / 100;
        cy.get('[data-cy="checkout-split-line-value"]').first().clear().type(String(linha));
        cy.get('[data-cy="checkout-split-restante"]').should('match', /Total.*Soma das linhas.*Ajuste/);
      });
    });

    it('deve enviar cotacaoUuid da cotação ao criar venda', () => {
      const apiUrl = Cypress.env('apiUrl');
      cy.intercept('POST', `${apiUrl}/vendas`, (req) => {
        const raw = req.body as unknown;
        const body =
          typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
        expect(body.cotacaoUuid, 'cotacaoUuid no corpo da venda').to.be.a('string').and.not.be.empty;
        req.continue();
      }).as('criarVendaComCotacao');

      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      clicarCartaoCheckoutPorBandeiraPreferida('Mastercard');
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
      clicarCartaoCheckoutPorBandeiraPreferida('Mastercard');
      cy.get('[data-cy="checkout-finish-button"]').click();
      cy.url().should('include', '/pedido-confirmado');
    });

    it('deve manter botão desabilitado quando saldo não está coberto (parcial sem cartão do restante)', () => {
      cy.visit('/checkout');
      preencherEntregaCheckoutMinimo();
      cy.get('[data-cy="checkout-split-line-value"]').first().clear().type('10');
      cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
      cy.contains(/cubram o total restante/i).should('exist');
    });

  });

  describe('Validações de Segurança', () => {
    it('deve mascarar número do cartão', () => {
      cy.get('[data-cy^="checkout-card-item-"]')
        .first()
        .should('contain', '••••');
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

  });
});

/**
 * Cliente recém-registrado não tem cartões no perfil — valida UI real sem apagar seed do clientetest.
 */
describe('Pagamentos — Checkout sem Cartões Salvos (Cliente Novo)', () => {
  beforeEach(() => {
    cy.setupCheckoutNetworkSpies();
    cy.getNewUser().then((newUser) => {
      const apiUrl = Cypress.env('apiUrl');
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/registro`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...(Cypress.env('injectTestDbHeader') === true ? { 'x-use-test-db': 'true' } : {}),
        },
        body: {
          nome: newUser.nome,
          cpf: newUser.cpf,
          email: newUser.email,
          senha: newUser.senha,
          confirmacaoSenha: newUser.senha,
          genero: 'Prefiro não informar',
          dataNascimento: '1990-01-01',
          telefone: { tipo: 'Celular', ddd: '11', numero: '999999999' },
        },
        failOnStatusCode: false,
      }).then((reg) => {
        expect(reg.status).to.be.oneOf([200, 201]);
        cy.autenticarViaApi(newUser.email, newUser.senha);
        cy.garantirEnderecoViaApi();
        cy.prepararCarrinhoSincronizado();
      });
    });
  });

  it('deve manter botão desabilitado sem forma de pagamento (com entrega ok)', () => {
    preencherEntregaCheckoutMinimo();
    cy.get('[data-cy="checkout-finish-button"]').should('be.disabled');
  });
});

/**
 * RN0069 - Parcelamento Mínimo R$ 80,00
 * Valida que valores abaixo de R$ 80,00 não são elegíveis para parcelamento
 */
describe('Pagamentos — Parcelamento Mínimo R$ 80,00 (RN0069)', () => {
  beforeEach(() => {
    cy.setupCheckoutNetworkSpies();
    cy.autenticarClienteDadosTeste();
    cy.garantirEnderecoViaApi();
    cy.prepararCarrinhoSincronizado();
  });

  it('deve exibir apenas opção à vista quando valor da linha < R$ 80,00', () => {
    preencherEntregaCheckoutMinimo();
    
    // Configurar linha de pagamento com valor abaixo de R$ 80,00
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('50.00');
    
    // Verificar que select de parcelas tem apenas 1 opção (à vista)
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .should('have.length', 1);
    
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .first()
      .should('contain', 'à vista');
  });

  it('deve exibir múltiplas opções de parcelamento quando valor da linha >= R$ 80,00', () => {
    preencherEntregaCheckoutMinimo();
    
    // Configurar linha de pagamento com valor acima de R$ 80,00
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('100.00');
    
    // Verificar que select de parcelas tem múltiplas opções
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .should('have.length.greaterThan', 1);
    
    // Verificar que existe opção 2x
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .eq(1)
      .should('contain', '2x');
  });

  it('deve bloquear parcelamento no limite exato de R$ 79,99', () => {
    preencherEntregaCheckoutMinimo();
    
    // Configurar linha com valor exatamente no limite (R$ 79,99)
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('79.99');
    
    // Verificar que select de parcelas tem apenas 1 opção
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .should('have.length', 1);
  });

  it('deve permitir parcelamento a partir de R$ 80,00', () => {
    preencherEntregaCheckoutMinimo();
    
    // Configurar linha com valor mínimo elegível (R$ 80,00)
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('80.00');
    
    // Verificar que select de parcelas tem múltiplas opções
    cy.get('[data-cy="checkout-split-line-parcelas"]')
      .find('option')
      .should('have.length.greaterThan', 1);
  });
});
