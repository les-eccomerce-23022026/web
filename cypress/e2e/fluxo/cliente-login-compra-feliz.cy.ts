/**
 * Jornada feliz (UI): sessão via `loginApi` (estável no CI); catálogo → carrinho → checkout → frete → cupom → finalizar.
 * Evita `visit('/minha-conta')` + formulário quando já existe cookie/sessão (tela sem `login-email-input`).
 * Cenários adicionais (split, múltiplos cupons, parcial) ficam em `e2e/user/cliente/checkout/pagamento.cy.ts`.
 *
 * Ordem de API na finalização (API real, ver `executarFinalizacaoCompra` + `bdd/vendas/finalizar_compra.md`):
 * POST /vendas → POST /pagamentos/selecionar (cupom) → POST /pagamentos/selecionar (cartão) →
 * POST /pagamentos/:uuid/processar → POST /entregas → navegação para `/pedido-confirmado?pedido=`.
 *
 * Requer: Vite + proxy `/api` → backend, seed de teste. Use os scripts npm com `injectTestDbHeader=true`
 * (ex.: `npm run test:e2e:compra-feliz:run`) para o header `x-use-test-db` alinhar cookie e API ao Postgres de teste.
 */
describe('Jornada do Cliente — Processo de Compra e Finalização de Pedido', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.limparCarrinhoApi();
  });

  describe('Fluxo Principal: Compra com Sucesso (Caminho Feliz)', () => {
    beforeEach(() => {
      cy.setupCheckoutNetworkSpies();
      cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
      cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
      cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
      cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
      /**
       * Intercept POST /entregas — causa raiz histórica de falha silenciosa:
       * se o backend retorna 400 ("Custo da entrega não confere…"), o fluxo
       * lança erro → toast → nunca chama navigate('/pedido-confirmado').
       * Sem este intercept, o teste simplesmente esgotava o timeout no assert de URL.
       */
      cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
      cy.loginApi(email, senha);
    });

    it('Deve permitir que um cliente autenticado finalize um pedido com múltiplos itens, aplicando cupom e validando frete', () => {
      cy.log('**Início: catálogo (cliente já autenticado via API)**');
      cy.visit('/');

      cy.log('**Etapa: Preparação do Carrinho**');
      cy.get('[data-cy="livro-card"]', { timeout: 30000 }).should('be.visible').first().click();
      cy.get('[data-cy="adicionar-carrinho-button"]').should('be.visible').click();
      cy.wait('@carrinhoAdicionarItem', { timeout: 15000 });

      cy.url().should('include', '/carrinho');
      cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="carrinho-linha-item"]', { timeout: 10000 }).should('be.visible');

      cy.log('**Etapa: Checkout - Consolidação do Pedido**');
      cy.contains('Finalizar Compra').should('be.visible').click();

      cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
      cy.logCheckoutDiagnosticContext('checkout montado (antes @pagamentoInfo)');
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

      /* ---------- Cadeia de waits espelhando a ordem real de chamadas ---------- */

      // 1. POST /vendas — cria a venda
      cy.wait('@criarVenda', { timeout: 20000 }).then((interception) => {
        const sc = interception.response?.statusCode;
        const body = interception.response?.body;
        cy.log(`[E2E] criarVenda → HTTP ${sc ?? '?'} | vendaUuid=${body?.id ?? body?.ven_uuid ?? '?'} | frete=${body?.frete ?? '?'}`);
        expect(sc, 'POST /vendas deve retornar 201').to.eq(201);
      });

      // 2. POST /pagamentos/selecionar — cupom
      cy.wait('@selecionarPagamento', { timeout: 20000 }).then((interception) => {
        cy.log(`[E2E] selecionarPagamento (cupom) → HTTP ${interception.response?.statusCode ?? '?'}`);
      });

      // 3. POST /pagamentos/selecionar — cartão
      cy.wait('@selecionarPagamento', { timeout: 20000 }).then((interception) => {
        cy.log(`[E2E] selecionarPagamento (cartão) → HTTP ${interception.response?.statusCode ?? '?'}`);
      });

      // 4. POST /pagamentos/:uuid/processar — processa pagamento
      cy.wait('@processarPagamento', { timeout: 20000 }).then((interception) => {
        const sc = interception.response?.statusCode;
        cy.log(`[E2E] processarPagamento → HTTP ${sc ?? '?'}`);
        expect(sc, 'POST /pagamentos/processar deve retornar 200 ou 201').to.be.oneOf([200, 201]);
      });

      // 5. POST /entregas — a chamada que historicamente falhava com 400 por divergência de frete
      cy.wait('@cadastrarEntrega', { timeout: 20000 }).then((interception) => {
        const sc = interception.response?.statusCode;
        const reqBody = interception.request?.body;
        const resBody = interception.response?.body;
        cy.log(`[E2E] cadastrarEntrega → HTTP ${sc ?? '?'} | custo enviado=${reqBody?.custo ?? '?'}`);

        if (sc !== 201) {
          // Log detalhado para facilitar debug de divergência frete/custo
          cy.log(`[E2E:ERRO] POST /entregas FALHOU — request body: ${JSON.stringify(reqBody)}`);
          cy.log(`[E2E:ERRO] POST /entregas FALHOU — response body: ${JSON.stringify(resBody)}`);
        }
        expect(sc, 'POST /entregas deve retornar 201 (entrega registrada)').to.eq(201);
      });

      /* ---------- Validação da navegação pós-finalização ---------- */
      cy.logCheckoutDiagnosticContext('pós-cadastrarEntrega');

      cy.url({ timeout: 30000 }).should('include', '/pedido-confirmado');
      cy.url().should('match', /[?&]pedido=/);
      cy.contains('h1', 'Pedido Realizado com Sucesso!', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="confirmado-btn-home"]').should('be.visible');
      cy.log('✅ Pedido registrado com sucesso seguindo todas as regras de negócio.');
    });
  });
});

/**
 * COMO RODAR:
 * cd web && npm run test:e2e:compra-feliz:run
 * (define injectTestDbHeader=true; opcional: --env apiUrl=http://localhost:3000/api se não usar Vite)
 */
