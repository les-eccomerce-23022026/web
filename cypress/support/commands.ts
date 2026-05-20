// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { registerCheckoutApiAliases } from './intercepts/checkoutApi';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginApi(email: string, password: string): Chainable<void>;
      createCartApi(items: { livroUuid: string; quantidade: number }[]): Chainable<void>;
      loginProgramatico(userType: 'admin' | 'cliente'): Chainable<void>;
      /** Sessão de cliente via API real (banco de testes) — uso em checkout e fluxos autenticados. */
      loginCliente(): Chainable<void>;
      /** Login via API com credenciais de `Cypress.env('cliente')` (seed do banco de testes). */
      loginClienteSeed(): Chainable<void>;
      /** Catálogo → detalhe do 1º livro → Comprar Agora (data-cy de detalhe). */
      adicionarPrimeiroLivroAoCarrinhoPelaTelaDetalhe(): Chainable<void>;
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getNewUser(): Chainable<{ nome: string, cpf: string, email: string, senha: string }>;
      adicionarAoCarrinhoApi(livroUuid: string, quantidade?: number): Chainable<void>;
      limparCarrinhoApi(): Chainable<void>;
      /** Garante pelo menos um endereço via GET /pagamento/info + POST se vazio. */
      garantirEnderecoApi(): Chainable<void>;
      /** Remove todos os cartões salvos do cliente autenticado (API real). */
      removerTodosCartoesSalvosApi(): Chainable<void>;
      /** Primeiro livro do catálogo público GET /livros (dados reais do banco). */
      obterPrimeiroLivroUuidDoCatalogo(): Chainable<string>;
      removerEnderecosUsuarioApi(): Chainable<void>;
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
      checkoutPreencherFretePac(cep: string): Chainable<void>;
      checkoutAplicarCupom(codigo: string): Chainable<void>;
      /** Catálogo UI ou seed via API (createCartApi). */
      prepararCarrinhoComUmLivro(
        opts: { via: 'api'; livroUuid: string; quantidade?: number } | { via: 'ui' },
      ): Chainable<void>;
      /**
       * Monta o carrinho via API + visita ao checkout. Sem `livroUuid`, usa o primeiro livro do GET /livros.
       */
      prepararCarrinhoComUmLivroHidratado(opts?: { livroUuid?: string; quantidade?: number }): Chainable<void>;
      /** Comandos para testes de admin - fluxo de despacho e entrega */
      criarVendaAprovadaApi(): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      despacharPedidoApi(vendaUuid: string): Chainable<void>;
      confirmarEntregaApi(vendaUuid: string): Chainable<void>;
      marcarFalhaEntregaApi(vendaUuid: string, motivo: string): Chainable<void>;
      solicitarTrocaApi(vendaUuid: string, itemVendaUuid: string, motivo: string): Chainable<void>;
      autorizarTrocaApi(vendaUuid: string): Chainable<void>;
      confirmarRecebimentoTrocaApi(vendaUuid: string): Chainable<void>;
      /** Login admin via API para testes de painel */
      loginAdminApi(): Chainable<string>;
    }
  }
}

/**
 * Gera um usuário dinâmico para testes de registro e perfil.
 */
/** CPFs com dígitos verificadores válidos (backend/README — cadastro de cliente). */
const CPFS_CADASTRO_VALIDOS = [
  '245.699.622-46',
  '019.364.721-47',
  '747.200.643-29',
  '371.568.753-37',
  '497.592.260-65',
  '283.323.987-46',
  '206.903.522-04',
  '824.477.504-12',
  '989.888.819-90',
  '267.905.031-29',
  '684.262.887-31',
  '802.563.243-10',
  '087.098.018-12',
  '707.848.056-28',
  '952.426.835-38',
];

Cypress.Commands.add('getNewUser', () => {
  const cpf = CPFS_CADASTRO_VALIDOS[Math.floor(Math.random() * CPFS_CADASTRO_VALIDOS.length)];
  return cy.wrap({
    nome: 'João Silva Teste',
    cpf,
    email: `teste.${Date.now()}.${Math.floor(Math.random() * 1000)}@email.com`,
    senha: 'StrongPass@2026',
  });
});

/**
 * Login via UI - Útil para testar o fluxo completo de login e feedbacks visuais.
 */
Cypress.Commands.add('loginCliente', () => {
  cy.loginProgramatico('cliente');
});

Cypress.Commands.add('loginClienteSeed', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  /** Mesmas credenciais do `005_seed_usuarios_teste.sql` (senha com Ç como U+00C7). */
  const email =
    (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
  const senha =
    (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers,
    body: { email, senha },
    encoding: 'utf8',
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200 || !res.body?.dados?.user) {
      throw new Error(
        `Login seed falhou (${res.status}): ${JSON.stringify(res.body)} — rode o seed 005 no Postgres do backend. Response body: ${JSON.stringify(res.body, null, 2)}`,
      );
    }
  });
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
  // Aguarda o login ser processado
  cy.url().should('not.include', '/minha-conta');
});

/**
 * Registra um usuário dinamicamente via API e realiza o login programático.
 * Extremamente rápido e isola o estado entre os testes usando cy.session.
 * Sessão via cookie HttpOnly (mesma origem `apiUrl` = Vite + proxy).
 */
Cypress.Commands.add('loginProgramatico', (userType: 'admin' | 'cliente') => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  if (userType === 'cliente') {
    cy.getNewUser().then((newUser) => {
      cy.session(`session-cliente-${newUser.email}`, () => {
        // Passo 1: Registrar o cliente via API
        cy.request({
          method: 'POST',
          url: `${apiUrl}/clientes/registro`,
          headers: { 'x-use-test-db': 'true' },
          body: {
            nome: newUser.nome,
            cpf: newUser.cpf,
            email: newUser.email,
            senha: newUser.senha,
            confirmacaoSenha: newUser.senha,
            genero: 'Prefiro não informar',
            dataNascimento: '1990-01-01',
            telefone: { tipo: 'Celular', ddd: '11', numero: '999999999' }
          },
          failOnStatusCode: false
        }).then((registroResponse) => {
          if (registroResponse.status !== 201 && registroResponse.status !== 200) {
            throw new Error(`Falha no registro programático: ${registroResponse.body.mensagem || 'Erro desconhecido'}. Response body: ${JSON.stringify(registroResponse.body, null, 2)}`);
          }

          // Passo 2: Login — cookie HttpOnly associado à origem do Vite
          cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/login`,
            headers: { 'x-use-test-db': 'true' },
            body: { email: newUser.email, senha: newUser.senha },
            failOnStatusCode: false
          }).then((loginResponse) => {
            if (loginResponse.status !== 200 || !loginResponse.body?.dados?.user) {
              throw new Error(`Falha no login programático (cliente): ${loginResponse.body?.mensagem || 'Erro desconhecido'}. Response body: ${JSON.stringify(loginResponse.body, null, 2)}`);
            }
          });
        });
      }, {
        cacheAcrossSpecs: false
      });
    });
  } else {
    const user = Cypress.env('admin') || { email: 'admin@livraria.com.br', senha: 'Admin@123' };
    
    cy.session(`session-admin`, () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/bootstrap`,
        headers: { 'x-use-test-db': 'true' },
        failOnStatusCode: false
      }).then((bootstrapResponse) => {
        if (bootstrapResponse.status !== 200 && bootstrapResponse.status !== 201) {
          throw new Error(`Falha no bootstrap do admin: ${bootstrapResponse.body?.mensagem || 'Erro'}. Response body: ${JSON.stringify(bootstrapResponse.body, null, 2)}`);
        }

        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          headers: { 'x-use-test-db': 'true' },
          body: { email: user.email, senha: user.senha },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status !== 200 || !response.body?.dados?.user) {
            throw new Error(`Falha no login programático (admin): ${response.body?.mensagem || 'Erro desconhecido'}. Response body: ${JSON.stringify(response.body, null, 2)}`);
          }
        });
      });
    }, {
      cacheAcrossSpecs: false
    });
  }
});

/** Headers padrão para requests autenticados com banco de testes. */
export function apiHeadersTestDb(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

/** Loja padrão do seed (multi-tenancy — evita `loj_id` null no carrinho). */
export function apiHeadersTestDbComLoja(lojId = 1): Record<string, string> {
  return {
    ...apiHeadersTestDb(),
    'x-loja-id': String(lojId),
  };
}

interface PagamentoInfoResponse {
  enderecosCliente: unknown[];
  cartoesCliente?: unknown[];
}

Cypress.Commands.add('garantirEnderecoApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDb();

  cy.request<PagamentoInfoResponse>({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`GET /pagamento/info falhou: ${response.status} — ${JSON.stringify(response.body)}`);
    }
    if (response.body.enderecosCliente.length === 0) {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers,
        body: {
          logradouro: 'Rua de Teste',
          numero: '123',
          complemento: 'Apto 1',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
          tipo: 'entrega',
          principal: true,
          apelido: 'Casa',
        },
      }).then((postRes) => {
        if (postRes.status !== 201 && postRes.status !== 200) {
          throw new Error(`POST endereço falhou: ${postRes.status}`);
        }
      });
    }
  });
});

Cypress.Commands.add('adicionarPrimeiroLivroAoCarrinhoPelaTelaDetalhe', () => {
  cy.log('**Navegando para Home para selecionar livro**');
  cy.visit('/');
  
  // Aumenta timeout para 30s e garante que a página carregou
  cy.get('body').should('not.be.empty');
  
  cy.get('[data-cy="livro-card"]', { timeout: 30000 })
    .should('be.visible')
    .first()
    .scrollIntoView()
    .click();
  
  cy.log('**Na tela de detalhes, adicionando ao carrinho**');
  cy.get('[data-cy="adicionar-carrinho-button"]', { timeout: 15000 })
    .should('be.visible')
    .click();
});

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('loginApi', (email, senha) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers,
    body: { email, senha },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const masked = email.includes('@') ? `${email[0]}***@${email.split('@')[1]}` : '***';
    cy.log(`[loginApi] sessão API OK (${masked}) — cookie deve espelhar no browser no próximo visit`);
  });
});

Cypress.Commands.add('createCartApi', (items) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();
  
  // Limpa o carrinho primeiro para garantir estado puro
  cy.request({
    method: 'DELETE',
    url: `${apiUrl}/carrinho`,
    headers,
    failOnStatusCode: false
  });

  // Adiciona cada item
  items.forEach((item) => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/carrinho/itens`,
      headers,
      body: { livroUuid: item.livroUuid, quantidade: item.quantidade },
    });
  });
});

Cypress.Commands.add('adicionarAoCarrinhoApi', (livroUuid, quantidade = 1) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/carrinho/itens`,
    headers,
    body: { livroUuid, quantidade },
  });
});

Cypress.Commands.add('limparCarrinhoApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.request({
    method: 'DELETE',
    url: `${apiUrl}/carrinho`,
    headers,
    failOnStatusCode: false
  });
});

Cypress.Commands.add('removerTodosCartoesSalvosApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'GET',
    url: `${apiUrl}/clientes/perfil/cartoes`,
    headers,
  })
    .its('body.dados')
    .then((cartoes: { uuid: string }[]) => {
      if (!Array.isArray(cartoes) || cartoes.length === 0) return;
      cy.wrap(cartoes).each((c: { uuid: string }) => {
        cy.request({
          method: 'DELETE',
          url: `${apiUrl}/clientes/perfil/cartoes/${c.uuid}`,
          headers,
          failOnStatusCode: false,
        });
      });
    });
});

export interface LivroResponse {
  uuid: string;
  titulo: string;
  preco: number;
}

export interface CatalogoResponse {
  livros: LivroResponse[];
}

Cypress.Commands.add('obterPrimeiroLivroUuidDoCatalogo', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDb();

  return cy
    .request<CatalogoResponse>({
      method: 'GET',
      url: `${apiUrl}/livros`,
      qs: { pagina: 1, itensPorPagina: 1, ordenacao: 'recentes' },
      headers,
      failOnStatusCode: false,
    })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error(`GET /livros falhou: ${res.status} — rode seed/migração do catálogo. Response: ${JSON.stringify(res.body)}`);
      }
      expect(res.body.livros, 'catálogo não vazio').to.be.an('array').with.length.greaterThan(0);
      return res.body.livros[0].uuid;
    });
});

Cypress.Commands.add('removerEnderecosUsuarioApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  // Primeiro busca os endereços do usuário
  cy.request({
    method: 'GET',
    url: `${apiUrl}/clientes/perfil/enderecos`,
    headers,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body?.enderecos && response.body.enderecos.length > 0) {
      // Deleta cada endereço individualmente pelo UUID
      response.body.enderecos.forEach((endereco: { uuid: string }) => {
        cy.request({
          method: 'DELETE',
          url: `${apiUrl}/clientes/perfil/enderecos/${endereco.uuid}`,
          headers,
          failOnStatusCode: false
        });
      });
    }
  });
});

Cypress.Commands.add('setupCheckoutNetworkSpies', () => {
  registerCheckoutApiAliases();
});

/**
 * Snapshot legível no Command Log / terminal-report quando há timeout em URL ou em `@pagamentoInfo`.
 * Não substitui assert; só correlaciona “checkout em branco”, toast de erro e botão desabilitado.
 */
Cypress.Commands.add('logCheckoutDiagnosticContext', (label = 'checkout') => {
  const tag = `[E2E:${label}]`;
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  cy.url().then((href) => {
    cy.log(`${tag} url=${href}`);
  });

  cy.get('body').then(($body) => {
    const emptyish = $body.text().trim().length < 80;
    const toast = $body.find('[data-cy="notification-toast"]');
    const toastVisible = toast.filter(':visible');
    const toastText =
      toastVisible.length > 0
        ? toastVisible.first().text().trim().slice(0, 280)
        : toast.length > 0
          ? '(toast no DOM, não visível)'
          : '(sem toast)';

    const pay = $body.find('[data-cy="checkout-payment-section-title"]');
    const finish = $body.find('[data-cy="checkout-finish-button"]');
    const h1 = $body.find('h1').first().text().trim().slice(0, 120);

    const line = [
      `body≈vazio=${emptyish}`,
      `h1="${h1}"`,
      `paymentSection=${pay.filter(':visible').length ? 'visível' : 'ausente'}`,
      `finishDisabled=${finish.length ? finish.is(':disabled') : 'sem-botão'}`,
      `toast=${toastText}`,
    ].join(' | ');

    cy.log(`${tag} ${line}`);
    // Ajuda a comparar env do runner vs proxy Vite (mesma origem).
    cy.log(`${tag} Cypress.env(apiUrl)=${apiUrl}`);
  });
});

Cypress.Commands.add('checkoutPreencherFretePac', (cep: string) => {
  cy.get('[data-cy="checkout-freight-zip-input"]').scrollIntoView().clear().type(cep);
  cy.get('[data-cy="checkout-freight-calculate-button"]').scrollIntoView().should('be.visible').click();
  cy.wait('@freteCotar', { timeout: 15000 });
  cy.get('[data-cy="checkout-freight-option-PAC"]', { timeout: 10000 })
    .scrollIntoView()
    .should('be.visible')
    .click();
});

Cypress.Commands.add('checkoutAplicarCupom', (codigo: string) => {
  cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().should('be.visible').type(codigo);
  cy.get('[data-cy="checkout-apply-coupon-button"]').scrollIntoView().should('be.visible').click();
});

Cypress.Commands.add(
  'prepararCarrinhoComUmLivro',
  (opts: { via: 'api'; livroUuid: string; quantidade?: number } | { via: 'ui' }) => {
    if (opts.via === 'api') {
      cy.createCartApi([{ livroUuid: opts.livroUuid, quantidade: opts.quantidade ?? 1 }]);
    } else {
      cy.adicionarPrimeiroLivroAoCarrinhoPelaTelaDetalhe();
    }
  },
);

/**
 * Versão hidratada de prepararCarrinhoComUmLivro para suítes que precisam de estado Redux sincronizado.
 * Após createCart via API, visita o checkout e sincroniza pela UI.
 * `livroUuid` opcional: quando omitido, usa o primeiro título retornado por GET /livros (banco real).
 */
Cypress.Commands.add('prepararCarrinhoComUmLivroHidratado', (opts?: { livroUuid?: string; quantidade?: number }) => {
  const quantidade = opts?.quantidade ?? 1;
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDb();
  const checkoutTimeout = Cypress.env('checkoutTimeout') ? Number(Cypress.env('checkoutTimeout')) : 20000;

  const montar = (livroUuid: string) => {
    cy.createCartApi([{ livroUuid, quantidade }]);
    cy.visit('/checkout');
    cy.get('[data-cy="checkout-payment-section-title"]', { timeout: checkoutTimeout }).should('be.visible');
    cy.get('[data-cy="checkout-coupon-input"]', { timeout: checkoutTimeout }).scrollIntoView().should('be.visible');
  };

  if (opts?.livroUuid) {
    montar(opts.livroUuid);
    return;
  }

  cy.request<CatalogoResponse>({
    method: 'GET',
    url: `${apiUrl}/livros`,
    qs: { pagina: 1, itensPorPagina: 1, ordenacao: 'recentes' },
    headers,
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200) {
      throw new Error(`GET /livros falhou ao preparar carrinho: ${res.status}. Rode seed/migração do catálogo.`);
    }
    expect(res.body.livros, 'pelo menos um livro no catálogo').to.be.an('array').with.length.greaterThan(0);
    const uuid = res.body.livros[0].uuid;
    montar(uuid);
  });
});

/**
 * Comandos reutilizáveis para testes de admin - fluxo de despacho, entrega e trocas
 */

Cypress.Commands.add('loginAdminApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  /** Alinhado ao seed `005_seed_usuarios_teste.sql` (mesmo par do BDD 7ª entrega). */
  const emailAdmin =
    (Cypress.env('adminEmail') as string | undefined) ??
    (Cypress.env('admin') as { email?: string } | undefined)?.email ??
    'admintest@email.com';
  const senhaAdmin =
    (Cypress.env('adminSenha') as string | undefined) ??
    (Cypress.env('admin') as { senha?: string } | undefined)?.senha ??
    '@asdfJKL\u00C7123';
  const headers = apiHeadersTestDb();

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: {
      email: emailAdmin,
      senha: senhaAdmin,
    },
  }).then((res) => {
    expect(res.status).to.equal(200);
    return res.body.token;
  });
});

Cypress.Commands.add('criarVendaAprovadaApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  return cy.loginAdminApi().then(() => {
    return cy.loginClienteSeed().then(() => {
      return cy.obterPrimeiroLivroUuidDoCatalogo().then((livroUuid) => {
        // Adicionar ao carrinho
        cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers,
          body: {
            livroUuid,
            quantidade: 1,
          },
        });

        // Criar venda
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        }).then((res) => {
          const vendaUuid = res.body.id;

          // Aprovar pagamento
          cy.request({
            method: 'POST',
            url: `${apiUrl}/pagamentos/selecionar`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...headers,
            },
            body: {
              vendaUuid,
              valor: 40,
              tipoPagamento: 'cartao_credito',
              cartao: {
                numero: '4111111111111111',
                nomeTitular: 'Cliente Teste',
                validade: '12/30',
                bandeira: 'Visa',
              },
            },
          }).then((selRes) => {
            const pagamentoUuid = selRes.body.id;

            cy.request({
              method: 'POST',
              url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
              headers,
            });
          });

          // Obter item UUID
          return cy.request({
            method: 'GET',
            url: `${apiUrl}/vendas/${vendaUuid}`,
            headers,
          }).then((vendaRes) => {
            return {
              vendaUuid,
              itemVendaUuid: vendaRes.body.itens[0].id,
            };
          });
        });
      });
    });
  });
});

Cypress.Commands.add('despacharPedidoApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.loginAdminApi();
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
    headers,
  });
});

Cypress.Commands.add('confirmarEntregaApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.loginAdminApi();
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
    headers,
  });
});

Cypress.Commands.add('marcarFalhaEntregaApi', (vendaUuid: string, motivo: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.loginAdminApi();
  cy.request({
    method: 'PUT',
    url: `${apiUrl}/admin/pedidos/${vendaUuid}/falha-entrega`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: {
      motivo,
    },
  });
});

Cypress.Commands.add('solicitarTrocaApi', (vendaUuid: string, itemVendaUuid: string, motivo: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/vendas/${vendaUuid}/troca`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
    body: {
      motivo,
      itensUuids: [itemVendaUuid],
    },
  });
});

Cypress.Commands.add('autorizarTrocaApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.loginAdminApi();
  cy.request({
    method: 'POST',
    url: `${apiUrl}/vendas/${vendaUuid}/troca/autorizar`,
    headers,
  });
});

Cypress.Commands.add('confirmarRecebimentoTrocaApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersTestDbComLoja();

  cy.loginAdminApi();
  cy.request({
    method: 'PUT',
    url: `${apiUrl}/vendas/${vendaUuid}/troca/confirmar-recebimento`,
    headers,
  });
});

export {};
