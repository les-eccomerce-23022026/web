// Comandos de checkout Cypress

import { getApiUrl, getTestDbHeaders } from './utils';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Garante pelo menos um endereço via GET /pagamento/info + POST se vazio. */
      garantirEnderecoViaApi(): Chainable<void>;
      /** Remove todos os cartões salvos do cliente autenticado (API real). */
      limparCartoesSalvosViaApi(): Chainable<void>;
      /** Cria um cartão de teste via API para o cliente autenticado. */
      criarCartaoViaApi(opts?: { ultimosDigitos?: string; bandeira?: string }): Chainable<void>;
      /** Garante ≥1 cartão salvo (GET /pagamento/info ou POST /clientes/perfil/cartoes). Retorna true se criou cartão novo. */
      garantirCartoesViaApi(): Chainable<boolean>;
      /** Carrinho → Finalizar Compra com locks de UI e @pagamentoInfo. */
      checkoutIrFinalizarCompra(): Chainable<void>;
      /** Seleciona cartão salvo (API + lista) ou PIX se não houver cartões. */
      checkoutSelecionarCartaoSalvoPreferido(bandeira?: 'Visa' | 'Mastercard'): Chainable<void>;
      /** Split PIX cobrindo o total (remove linha cartão padrão; valida restante OK). */
      checkoutPreencherPixCobrindoTotal(): Chainable<void>;
      /** Se a URL for `/pagamento-pix`, simula webhook e aguarda `/pedido-confirmado`. */
      checkoutConfirmarPixSePendente(): Chainable<void>;
      removerEnderecosUsuarioViaApi(): Chainable<void>;
      /** Aliases GET pagamento/info, POST/GET carrinho — chamar no beforeEach antes das ações. */
      setupCheckoutNetworkSpies(): Chainable<void>;
      /**
       * Diagnóstico E2E: URL atual + toast + seção de pagamento + estado do botão finalizar (não falha o teste).
       * Usar antes/depois de `cy.wait('@pagamentoInfo')` ou quando a URL não chega em `/pedido-confirmado`.
       */
      logCheckoutDiagnosticContext(label?: string): Chainable<void>;
      /**
       * Exige intercept `freteCotar` no spec. CEP só dígitos ou formatado como a UI aceita.
       * Evita `force: true` com scroll + espera de rede.
       */
      checkoutPreencherFretePadrao(cep: string): Chainable<void>;
      checkoutAplicarCupom(codigo: string): Chainable<void>;
      /** Catálogo UI ou seed via API (criarCarrinhoViaApi). */
      prepararCarrinhoComUmLivro(
        opts: { via: 'api'; livroUuid: string; quantidade?: number } | { via: 'ui' },
      ): Chainable<void>;
      /**
       * Monta o carrinho via API + visita ao checkout. Sem `livroUuid`, usa o primeiro livro do GET /livros.
       */
      prepararCarrinhoSincronizado(opts?: { livroUuid?: string; quantidade?: number }): Chainable<void>;
    }
  }
}

Cypress.Commands.add('garantirEnderecoViaApi', () => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const enderecos = response.body?.enderecosCliente || [];
    if (enderecos.length === 0) {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: getTestDbHeaders(),
        body: {
          logradouro: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310100',
        },
      });
    }
  });
});

Cypress.Commands.add('limparCartoesSalvosViaApi', () => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const cartoes = response.body?.cartoesCliente || [];
    cartoes.forEach((cartao: any) => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/clientes/perfil/cartoes/${cartao.cartao_uuid}`,
        headers: getTestDbHeaders(),
        failOnStatusCode: false,
      });
    });
  });
});

Cypress.Commands.add('criarCartaoViaApi', (opts = {}) => {
  const apiUrl = getApiUrl();
  const ultimosDigitos = opts.ultimosDigitos || '4242';
  const bandeira = opts.bandeira || 'Visa';
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/clientes/perfil/cartoes`,
    headers: getTestDbHeaders(),
    body: {
      numero: `424242424242${ultimosDigitos}`,
      nomeTitular: 'Teste Cypress',
      validade: '12/28',
      cvv: '123',
      bandeira,
    },
  });
});

Cypress.Commands.add('garantirCartoesViaApi', () => {
  const apiUrl = getApiUrl();
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const cartoes = response.body?.cartoesCliente || [];
    if (cartoes.length === 0) {
      cy.criarCartaoViaApi();
      return cy.wrap(true);
    }
    return cy.wrap(false);
  });
});

Cypress.Commands.add('checkoutIrFinalizarCompra', () => {
  cy.visit('/carrinho');
  cy.contains('button', 'Finalizar Compra').click();
  cy.url().should('include', '/checkout');
});

Cypress.Commands.add('checkoutSelecionarCartaoSalvoPreferido', (bandeira) => {
  cy.get('[data-cy="checkout-saved-cards"]').should('exist');
  if (bandeira) {
    cy.contains(bandeira).click();
  } else {
    cy.get('[data-cy="checkout-saved-cards"]').first().click();
  }
});

Cypress.Commands.add('checkoutPreencherPixCobrindoTotal', () => {
  cy.get('[data-cy="checkout-payment-pix"]').click();
});

Cypress.Commands.add('checkoutConfirmarPixSePendente', () => {
  const apiUrl = getApiUrl();
  cy.url().then((url) => {
    if (url.includes('/pagamento-pix')) {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/pagamentos/pix/webhook`,
        body: { status: 'aprovado' },
      });
      cy.url().should('include', '/pedido-confirmado');
    }
  });
});

Cypress.Commands.add('removerEnderecosUsuarioViaApi', () => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const enderecos = response.body?.enderecosCliente || [];
    enderecos.forEach((endereco: any) => {
      cy.request({
        method: 'DELETE',
        url: `${apiUrl}/clientes/perfil/enderecos/${endereco.endereco_uuid}`,
        headers: getTestDbHeaders(),
        failOnStatusCode: false,
      });
    });
  });
});

Cypress.Commands.add('setupCheckoutNetworkSpies', () => {
  cy.intercept('GET', '/api/pagamento/info').as('pagamentoInfo');
  cy.intercept('POST', '/api/carrinho').as('carrinhoPost');
  cy.intercept('GET', '/api/carrinho').as('carrinhoGet');
});

Cypress.Commands.add('logCheckoutDiagnosticContext', (label) => {
  const prefix = label ? `[${label}] ` : '';
  cy.url().then((url) => cy.log(`${prefix}URL atual: ${url}`));
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="toast-message"]').length > 0) {
      cy.get('[data-cy="toast-message"]').then(($toast) => {
        cy.log(`${prefix}Toast visível: ${$toast.text()}`);
      });
    }
  });
});

Cypress.Commands.add('checkoutPreencherFretePadrao', (cep) => {
  cy.get('[data-cy="checkout-freight-zip-input"]').clear().type(cep);
  cy.get('[data-cy="checkout-freight-calculate-button"]').click();
  cy.wait('@freteCotar', { timeout: 15000 });
});

Cypress.Commands.add('checkoutAplicarCupom', (codigo) => {
  cy.get('[data-cy="checkout-coupon-input"]').type(codigo);
  cy.get('[data-cy="checkout-apply-coupon-button"]').click();
});

Cypress.Commands.add('prepararCarrinhoComUmLivro', (opts) => {
  if (opts.via === 'api') {
    cy.criarCarrinhoViaApi([{ livroUuid: opts.livroUuid, quantidade: opts.quantidade || 1 }]);
  } else {
    cy.visit('/');
    cy.get('[data-cy="livro-card"]').first().contains('Ver Detalhes').click();
    cy.get('[data-cy="detalhe-livro-comprar-agora"]').click();
  }
});

Cypress.Commands.add('prepararCarrinhoSincronizado', (opts = {}) => {
  const livroUuid = opts.livroUuid;
  const quantidade = opts.quantidade || 1;
  
  if (livroUuid) {
    cy.criarCarrinhoViaApi([{ livroUuid, quantidade }]);
  } else {
    cy.obterPrimeiroLivroCatalogo().then((uuid) => {
      cy.criarCarrinhoViaApi([{ livroUuid: uuid, quantidade }]);
    });
  }
  cy.visit('/checkout');
});
