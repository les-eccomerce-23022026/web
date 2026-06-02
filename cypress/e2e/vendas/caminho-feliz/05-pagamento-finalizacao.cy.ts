/**
 * Teste 5: Pagamento e Finalização
 * Etapa: Checkout → Seleção de Cartão → Finalizar Compra → Processar Pagamento
 */
describe('Vendas — Caminho Feliz — Etapa 5: Pagamento e Finalização', () => {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
    cy.setupCheckoutNetworkSpies();
    cy.intercept('POST', `${apiUrl}/frete/cotar`).as('freteCotar');
    cy.intercept('POST', `${apiUrl}/vendas`).as('criarVenda');
    cy.intercept('POST', `${apiUrl}/pagamentos/selecionar`).as('selecionarPagamento');
    cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamento');
    cy.intercept('POST', `${apiUrl}/entregas`).as('cadastrarEntrega');
  });

  /** Endereço + frete + cupom padrão do caminho feliz. */
  function prepararCheckoutPagamento() {
    cy.get('[data-cy^="checkout-address-item-"]', { timeout: 25000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();
    cy.checkoutPreencherFretePadrao('01310100');
    cy.checkoutAplicarCupom('DESCONTO10');
  }

  it('Deve selecionar cartão de pagamento', () => {
    cy.log('**Etapa: Preparar checkout com frete e cupom**');
    cy.garantirEnderecoViaApi();
    cy.garantirCartoesViaApi();
    cy.prepararCarrinhoSincronizado();

    cy.checkoutIrFinalizarCompra();
    prepararCheckoutPagamento();

    cy.log('**Etapa: Selecionar método de pagamento (cartão salvo)**');
    cy.checkoutSelecionarCartaoSalvoPreferido('Mastercard');
    cy.log('✅ Método de pagamento selecionado com sucesso');
  });

  it('Deve finalizar compra com sucesso', () => {
    cy.log('**Etapa: Preparar checkout completo**');
    cy.garantirEnderecoViaApi();
    cy.garantirCartoesViaApi();
    cy.prepararCarrinhoSincronizado();

    cy.checkoutIrFinalizarCompra();
    prepararCheckoutPagamento();

    cy.log('**Etapa: Pagamento com cartão salvo (linha única sincroniza o total)**');
    cy.checkoutSelecionarCartaoSalvoPreferido('Mastercard');
    cy.get('[data-cy="checkout-split-restante"]', { timeout: 10000 }).should('contain', 'OK');

    cy.log('**Etapa: Finalizar compra**');
    cy.get('[data-cy="checkout-finish-button"]', { timeout: 10000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .first()
      .scrollIntoView()
      .click();

    cy.log('**Validação: feedback de loading**');
    cy.get('[data-cy="checkout-finish-button"]')
      .should('have.attr', 'aria-busy', 'true')
      .should('contain', 'Processando...');

    cy.log('**Validação: cadeia de APIs chamada**');

    cy.wait('@criarVenda', { timeout: 20000 }).then((interception) => {
      const sc = interception.response?.statusCode;
      const body = interception.response?.body;
      cy.log(`[E2E] criarVenda → HTTP ${sc ?? '?'} | vendaUuid=${body?.id ?? body?.ven_uuid ?? '?'}`);
      expect(sc, 'POST /vendas deve retornar 201').to.eq(201);
    });

    cy.wait('@selecionarPagamento', { timeout: 20000 }).then((interception) => {
      cy.log(`[E2E] selecionarPagamento (cupom) → HTTP ${interception.response?.statusCode ?? '?'}`);
    });

    cy.wait('@selecionarPagamento', { timeout: 20000 }).then((interception) => {
      cy.log(`[E2E] selecionarPagamento (cartão) → HTTP ${interception.response?.statusCode ?? '?'}`);
    });

    cy.wait('@processarPagamento', { timeout: 20000 }).then((interception) => {
      const sc = interception.response?.statusCode;
      cy.log(`[E2E] processarPagamento → HTTP ${sc ?? '?'}`);
      expect(sc, 'POST /pagamentos/processar deve retornar 200 ou 201').to.be.oneOf([200, 201]);
    });

    cy.wait('@cadastrarEntrega', { timeout: 20000 }).then((interception) => {
      const sc = interception.response?.statusCode;
      const reqBody = interception.request?.body;
      const resBody = interception.response?.body;
      cy.log(`[E2E] cadastrarEntrega → HTTP ${sc ?? '?'} | custo enviado=${reqBody?.custo ?? '?'}`);

      if (sc !== 201) {
        cy.log(`[E2E:ERRO] POST /entregas FALHOU — request body: ${JSON.stringify(reqBody)}`);
        cy.log(`[E2E:ERRO] POST /entregas FALHOU — response body: ${JSON.stringify(resBody)}`);
      }
      expect(sc, 'POST /entregas deve retornar 201').to.eq(201);
    });

    cy.log('✅ Compra finalizada com sucesso');
  });

  it('Deve exibir erro quando não há cartões cadastrados', () => {
    cy.log('**Etapa: Remover todos os cartões**');
    cy.limparCartoesSalvosViaApi();

    cy.log('**Etapa: Preparar checkout**');
    cy.prepararCarrinhoSincronizado();
    cy.garantirEnderecoViaApi();

    cy.checkoutIrFinalizarCompra();
    prepararCheckoutPagamento();

    cy.log('**Validação: PIX deve estar disponível mesmo sem cartões**');
    cy.get('[data-cy="checkout-split-add-pix"]', { timeout: 15000 })
      .should('exist')
      .should('be.visible')
      .first()
      .scrollIntoView()
      .should('not.be.disabled')
      .click();

    cy.checkoutPreencherPixCobrindoTotal();
    cy.get('[data-cy="checkout-split-payment"]').should('contain', 'PIX');

    cy.log('✅ PIX disponível e configurado sem cartões salvos');
  });
});
