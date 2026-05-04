/**
 * Capturas do fluxo de venda (entrega / slides).
 *
 * Login: clientetest@email.com / @asdfJKLÇ123 (seed 005).
 * Requer: Vite :5173 + backend com catálogo (≥3 livros no grid) e proxy /api.
 *
 * Carrinho: API real (DELETE /carrinho + catálogo). Frete e dados de checkout (endereços,
 * cartões, política de parcelas): fixture para resposta estável. Finalização do pedido
 * (último cenário): mocks alinhados ao fluxo "compra feliz".
 */
describe('Fluxo de venda — capturas de tela (entrega 4)', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  const EMAIL_CLIENTE = 'clientetest@email.com';
  /** Mesmo caractere Ç do seed (U+00C7). */
  const SENHA_CLIENTE = '@asdfJKL\u00C7123';

  const limparCarrinhoApi = () => {
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/carrinho`,
      failOnStatusCode: false,
    });
  };

  const loginClienteEntrega4 = () => {
    cy.session('clientetest-entrega4-screens', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: { email: EMAIL_CLIENTE, senha: SENHA_CLIENTE },
        encoding: 'utf8',
        failOnStatusCode: false,
      }).then((res) => {
        if (res.status !== 200 || !res.body?.dados?.user) {
          throw new Error(
            `Login falhou (${res.status}): use o seed 005 e as credenciais ${EMAIL_CLIENTE}`,
          );
        }
      });
    });
  };

  const setupInterceptorsBase = () => {
    cy.intercept(`${apiUrl}/**`, (req) => {
      delete req.headers['x-use-test-db'];
    });
    cy.intercept('GET', `${apiUrl}/pagamento/info`, { fixture: 'pagamento-info-checkout.json' }).as(
      'pagamentoInfo',
    );
    cy.intercept('POST', `${apiUrl}/frete/cotar`, { fixture: 'frete-cotar-checkout.json' }).as(
      'freteCotar',
    );
  };

  const setupInterceptorsFinalizarPedido = () => {
    cy.intercept('POST', '**/vendas', {
      statusCode: 201,
      fixture: 'venda-criada-resposta.json',
    }).as('criarVenda');

    let selecionarCount = 0;
    cy.intercept('POST', '**/pagamentos/selecionar', (req) => {
      selecionarCount += 1;
      const raw = req.body as unknown;
      const body =
        typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : (raw as Record<string, unknown>);
      const tipo = (body?.tipoPagamento as string) ?? 'cartao_credito';
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
    }).as('selecionarPagamento');

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
    }).as('processarPagamento');

    cy.intercept('POST', '**/entregas', {
      statusCode: 201,
      body: {
        id: 'entrega-mock-1',
        vendaUuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        tipoFrete: 'PAC',
        custo: 15,
        endereco: {
          rua: 'Bela Vista',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000000',
        },
        criadoEm: new Date().toISOString(),
      },
    }).as('cadastrarEntrega');
  };

  /** Abre o n-ésimo livro do grid e usa "Comprar Agora" (vai ao carrinho). */
  const comprarLivroDoCatalogo = (indiceZeroBased: number) => {
    cy.visit('/', { timeout: 120000 });
    cy.get('.cartao-livro', { timeout: 90000 }).should('have.length.at.least', indiceZeroBased + 1);
    cy.get('.cartao-livro').eq(indiceZeroBased).contains('Ver Detalhes').click();
    cy.url({ timeout: 20000 }).should('include', '/livro/');
    cy.get('[data-cy="adicionar-carrinho-button"]', { timeout: 20000 }).click();
    cy.url({ timeout: 20000 }).should('include', '/carrinho');
  };

  const adicionarUmLivroIrParaCarrinho = () => {
    comprarLivroDoCatalogo(0);
  };

  const adicionarTresLivrosDistintos = () => {
    comprarLivroDoCatalogo(0);
    comprarLivroDoCatalogo(1);
    comprarLivroDoCatalogo(2);
  };

  const calcularFreteTelaAtual = () => {
    cy.get('[data-cy="checkout-freight-zip-input"]', { timeout: 20000 }).should('be.visible');
    cy.get('[data-cy="checkout-freight-zip-input"]').clear({ force: true });
    cy.get('[data-cy="checkout-freight-zip-input"]').type('01310100', { force: true });
    cy.get('[data-cy="checkout-freight-calculate-button"]').click();
    cy.wait('@freteCotar', { timeout: 20000 });
    cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="checkout-freight-option-PAC"]').click({ force: true });
  };

  const prepararCheckoutComEnderecoEFrete = () => {
    cy.visit('/checkout');
    cy.contains('h1', 'Finalizar Compra', { timeout: 25000 }).should('be.visible');
    cy.wait('@pagamentoInfo', { timeout: 25000 });
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 20000 }).first().click({ force: true });
    calcularFreteTelaAtual();
  };

  beforeEach(() => {
    cy.viewport(1920, 1080);
    loginClienteEntrega4();
    setupInterceptorsBase();
    limparCarrinhoApi();
  });

  it('01 — carrinho com 1 livro', () => {
    adicionarUmLivroIrParaCarrinho();
    cy.contains('h1', 'Carrinho', { matchCase: false }).should('be.visible');
    cy.screenshot('01-carrinho-1-livro', { capture: 'viewport' });
  });

  it('02 — carrinho com 1 livro e frete calculado', () => {
    adicionarUmLivroIrParaCarrinho();
    calcularFreteTelaAtual();
    cy.contains('Frete PAC selecionado', { matchCase: false }).should('be.visible');
    cy.screenshot('02-carrinho-1-livro-frete', { capture: 'viewport' });
  });

  it('03 — carrinho com 3 livros', () => {
    adicionarTresLivrosDistintos();
    cy.get('table tbody tr', { timeout: 20000 }).should('have.length', 3);
    cy.screenshot('03-carrinho-3-livros', { capture: 'viewport' });
  });

  it('04 — carrinho com 3 livros e frete calculado', () => {
    adicionarTresLivrosDistintos();
    calcularFreteTelaAtual();
    cy.contains('Frete PAC selecionado', { matchCase: false }).should('be.visible');
    cy.screenshot('04-carrinho-3-livros-frete', { capture: 'viewport' });
  });

  it('05 — checkout com endereço e frete calculado', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-freight-options"]', { timeout: 15000 }).should('be.visible');
    cy.screenshot('05-checkout-frete', { capture: 'viewport' });
  });

  it('06 — pagamento: cartão salvo e parcelamento', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-split-payment"]', { timeout: 20000 }).scrollIntoView();
    cy.get('[data-cy="checkout-split-line-parcelas"]').should('be.visible');
    cy.get('[data-cy="checkout-split-line-parcelas"]').first().select(3);
    cy.screenshot('06-pagamento-cartao-salvo-parcelas', { capture: 'viewport' });
  });

  it('07 — pagamento: linha de cartão novo (informar dados)', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-split-toolbar"]', { timeout: 20000 }).scrollIntoView();
    cy.get('[data-cy="checkout-split-add-new-card"]', { timeout: 20000 }).click({ force: true });
    cy.get('[data-cy="checkout-split-remove-line-0"]', { timeout: 10000 }).click();
    cy.get('[data-cy="checkout-split-payment"]').scrollIntoView();
    cy.get('[data-cy="checkout-add-card-button"], [data-cy="checkout-split-inform-new-card"]', {
      timeout: 15000,
    })
      .first()
      .should('be.visible');
    cy.screenshot('07-pagamento-cartao-novo', { capture: 'viewport' });
  });

  it('08 — pagamento: somente PIX', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-split-toolbar"]', { timeout: 20000 }).scrollIntoView();
    cy.get('[data-cy="checkout-split-add-pix"]', { timeout: 20000 }).click({ force: true });
    cy.get('[data-cy="checkout-split-remove-line-0"]', { timeout: 10000 }).click();
    cy.get('[data-cy="checkout-split-payment"]').scrollIntoView();
    cy.get('[data-cy="checkout-split-restante"]', { timeout: 10000 })
      .invoke('text')
      .then((t) => {
        const m = t.match(/Total[^R]*R\$\s*([\d.,]+)/i);
        const br = m?.[1]?.trim() ?? '0';
        const num = parseFloat(br.replace(/\./g, '').replace(',', '.'));
        if (Number.isFinite(num) && num > 0) {
          cy.get('[data-cy="checkout-split-line-value"]').clear({ force: true }).type(String(num), {
            force: true,
          });
        }
      });
    cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');
    cy.contains('PIX', { matchCase: false }).should('be.visible');
    cy.screenshot('08-pagamento-pix', { capture: 'viewport' });
  });

  it('09 — pagamento: dividido cartão salvo + PIX', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-split-toolbar"]', { timeout: 20000 }).scrollIntoView();
    cy.get('[data-cy="checkout-split-add-pix"]', { timeout: 20000 }).click({ force: true });
    cy.get('[data-cy="checkout-split-payment"]').scrollIntoView();
    cy.get('[data-cy="checkout-split-line-value"]')
      .eq(0)
      .invoke('val')
      .then((v0) => {
        const raw = String(v0 ?? '').replace(/\./g, '').replace(',', '.');
        const total = parseFloat(raw);
        expect(total, 'total do pedido (mín. R$ 20 para dividir PIX + cartão com R$ 10 cada)').to.be.gte(
          20,
        );
        let a = Math.max(10, Math.round((total / 2) * 100) / 100);
        let b = Math.round((total - a) * 100) / 100;
        if (b < 10) {
          b = 10;
          a = Math.round((total - b) * 100) / 100;
        }
        cy.get('[data-cy="checkout-split-line-value"]').eq(0).clear({ force: true }).type(String(a), {
          force: true,
        });
        cy.get('[data-cy="checkout-split-line-value"]').eq(1).clear({ force: true }).type(String(b), {
          force: true,
        });
      });
    cy.get('[data-cy="checkout-split-restante"]', { timeout: 10000 }).should('contain', 'OK');
    cy.screenshot('09-pagamento-dividido-cartao-e-pix', { capture: 'viewport' });
  });

  it('10 — pagamento: cupom aplicado + cartão (parcelas)', () => {
    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();
    cy.get('[data-cy="checkout-coupon-input"]', { timeout: 20000 }).scrollIntoView().should('be.visible');
    cy.get('[data-cy="checkout-coupon-input"]').clear({ force: true });
    cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10', { force: true });
    cy.get('[data-cy="checkout-apply-coupon-button"]').scrollIntoView().click({ force: true });
    cy.get('[data-cy="checkout-applied-coupons"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="checkout-split-payment"]', { timeout: 15000 }).scrollIntoView();
    cy.get('[data-cy="checkout-split-line-parcelas"]').first().select(2);
    cy.screenshot('10-pagamento-com-cupom-e-parcelas', { capture: 'viewport' });
  });

  it('11 — pedido confirmado e 12 — meus pedidos', () => {
    setupInterceptorsFinalizarPedido();
    cy.intercept('GET', '**/minhas-vendas', { fixture: 'minhas-vendas-mock.json' }).as('minhasVendas');

    adicionarUmLivroIrParaCarrinho();
    prepararCheckoutComEnderecoEFrete();

    cy.get('[data-cy="checkout-coupon-input"]', { timeout: 20000 }).scrollIntoView();
    cy.get('[data-cy="checkout-coupon-input"]').clear({ force: true });
    cy.get('[data-cy="checkout-coupon-input"]').type('DESCONTO10', { force: true });
    cy.get('[data-cy="checkout-apply-coupon-button"]').click({ force: true });
    cy.wait(500);
    cy.get('[data-cy="checkout-applied-coupons"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="checkout-split-restante"]', { timeout: 15000 }).should('contain', 'OK');

    cy.get('[data-cy="checkout-split-payment"]').scrollIntoView();
    cy.contains('✓ Pagamento pronto', { timeout: 30000 }).should('be.visible');
    cy.get('[data-cy="checkout-finish-button"]', { timeout: 30000 }).should('not.be.disabled');
    cy.get('[data-cy="checkout-finish-button"]').scrollIntoView().click({ force: true });

    cy.wait('@criarVenda', { timeout: 30000 });
    cy.wait('@selecionarPagamento', { timeout: 30000 });
    cy.wait('@selecionarPagamento', { timeout: 30000 });
    cy.wait('@processarPagamento', { timeout: 30000 });
    cy.wait('@cadastrarEntrega', { timeout: 30000 });
    cy.url({ timeout: 15000 }).should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-btn-pedidos"]', { timeout: 20000 }).should('be.visible');
    cy.screenshot('11-pedido-confirmado', { capture: 'viewport' });

    cy.visit('/pedidos');
    cy.wait('@minhasVendas', { timeout: 20000 });
    cy.contains('h1', 'Meus Pedidos', { timeout: 20000 }).should('be.visible');
    cy.screenshot('12-meus-pedidos', { capture: 'viewport' });
  });
});
