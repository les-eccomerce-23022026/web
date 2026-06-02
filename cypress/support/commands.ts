// Comandos customizados Cypress para testes E2E do e-commerce de livros

import {
  apiHeadersBancoTestes,
  apiHeadersBancoTestesComLoja,
  aplicarCookieAuthNoBrowser,
  aplicarSessaoAuthCompletaNoBrowser,
  armazenarTokenAuth,
  extrairTokenJwtLoginResponse,
  extrairTotalAposCuponsDoRestante,
  limparSessaoAuthBrowser,
  parseMoedaBrParaNumero,
  resolverUuidLojaPadraoNasLojas,
} from './helpers/checkoutHelpers';
import { registerCheckoutApiAliases } from './intercepts/checkoutApi';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      autenticarViaApi(email: string, password: string): Chainable<void>;
      criarCarrinhoViaApi(items: { livroUuid: string; quantidade: number }[]): Chainable<void>;
      loginProgramatico(userType: 'admin' | 'cliente'): Chainable<void>;
      /** Sessão de cliente via API real (banco de testes) — uso em checkout e fluxos autenticados. */
      loginCliente(): Chainable<void>;
      /** Autenticação via API com credenciais de dados de teste. */
      autenticarClienteDadosTeste(): Chainable<void>;
      /** Catálogo → detalhe do 1º livro → Comprar Agora (data-cy de detalhe). */
      adicionarPrimeiroLivroCarrinhoDetalhe(): Chainable<void>;
      getDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      getNewUser(): Chainable<{ nome: string, cpf: string, email: string, senha: string }>;
      adicionarAoCarrinhoViaApi(livroUuid: string, quantidade?: number): Chainable<void>;
      limparCarrinhoViaApi(): Chainable<void>;
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
      /** Primeiro livro do catálogo público GET /livros (dados reais do banco). */
      obterPrimeiroLivroCatalogo(): Chainable<string>;
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
      /** Comandos para testes de admin - fluxo de despacho e entrega */
      criarVendaAprovadaViaApi(): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      despacharPedidoViaApi(vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }): Chainable<void>;
      confirmarEntregaViaApi(vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }): Chainable<void>;
      marcarFalhaEntregaViaApi(vendaUuid: string, motivo: string): Chainable<void>;
      solicitarTrocaViaApi(vendaUuid: string, itemVendaUuid: string, motivo: string): Chainable<void>;
      autorizarTrocaViaApi(vendaUuid: string): Chainable<void>;
      confirmarRecebimentoTrocaViaApi(vendaUuid: string): Chainable<void>;
      /** Login admin via API para testes de painel */
      autenticarAdministradorViaApi(): Chainable<Cypress.Response<any>>;
      /** Aguarda GET /auth/me 200 após visit (sessão browser estabilizada). */
      aguardarSessaoBrowserViaAuthMe(opts?: { role?: 'admin' | 'cliente' }): Chainable<void>;
      /** Comandos para testes de multi-tenancy por loja */
      obterLojaPadraoUuid(): Chainable<string>;
      criarAmbienteMultiLoja(): Chainable<void>;
      autenticarAdminLojaA(): Chainable<void>;
      autenticarAdminLojaB(): Chainable<void>;
      autenticarAdminMultiLoja(): Chainable<void>;
      criarVendaLojaA(livroUuid: string): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      criarVendaLojaB(livroUuid: string): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      /** Logout do usuário atual. */
      logout(): Chainable<void>;
    }
  }
}

// ============================================
// CONSTANTES E UTILITÁRIOS
// ============================================

const API_URL = Cypress.env('apiUrl') || 'http://localhost:5173/api';
const USE_TEST_DB = Cypress.env('injectTestDbHeader') === true;

const getHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => ({
  'Content-Type': 'application/json; charset=utf-8',
  ...extraHeaders,
});

const getTestDbHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json; charset=utf-8',
  ...(USE_TEST_DB ? { 'x-use-test-db': 'true' } : {}),
});

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

// ============================================
// DECLARAÇÃO DE TIPOS
// ============================================

interface PagamentoInfoResponse {
  enderecosCliente: unknown[];
  cartoesCliente?: unknown[];
}

// ============================================
// COMANDOS DE UTILIDADE
// ============================================

Cypress.Commands.add('getNewUser', () => {
  const timestamp = Date.now();
  // Gerar CPF único baseado em timestamp para evitar conflitos no banco de testes
  // Usar últimos 9 dígitos do timestamp + dígito verificador
  const baseCpf = String(timestamp).slice(-9);
  const cpf = gerarCpfValido(baseCpf);
  return cy.wrap({
    nome: 'João Silva Teste',
    cpf,
    email: `teste.${timestamp}.${Math.floor(Math.random() * 1000)}@email.com`,
    senha: 'StrongPass@2026',
  });
});

// Função auxiliar para gerar CPF válido a partir de 9 dígitos base
function gerarCpfValido(base: string): string {
  // Garantir que temos exatamente 9 dígitos
  const cpfBase = base.padStart(9, '0').slice(0, 9);
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfBase[i]) * (10 - i);
  }
  const resto1 = soma % 11;
  const digito1 = resto1 < 2 ? 0 : 11 - resto1;
  
  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfBase[i]) * (11 - i);
  }
  soma += digito1 * 2;
  const resto2 = soma % 11;
  const digito2 = resto2 < 2 ? 0 : 11 - resto2;
  
  // Formatar CPF
  const cpfCompleto = cpfBase + digito1 + digito2;
  return `${cpfCompleto.slice(0, 3)}.${cpfCompleto.slice(3, 6)}.${cpfCompleto.slice(6, 9)}-${cpfCompleto.slice(9)}`;
}

Cypress.Commands.add('getDataCy', (value) => {
  return cy.get(`[data-cy="${value}"]`);
});

// ============================================
// COMANDOS DE AUTENTICAÇÃO
// ============================================

Cypress.Commands.add('loginCliente', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const email = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senha = Cypress.env('clienteSenha') || '@asdfJKL\u00C7123';

  cy.session('session-cliente-teste', () => {
    limparSessaoAuthBrowser();
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email, senha },
    }).then((response) => {
      const token = extrairTokenJwtLoginResponse(response);
      const user = response.body?.dados?.user;
      aplicarSessaoAuthCompletaNoBrowser(user, token);
      if (token) {
        cy.log('[loginCliente] token JWT extraído e armazenado para chamadas API');
      }
    });
  });
  cy.visit('/');
});

Cypress.Commands.add('autenticarClienteDadosTeste', () => {
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

  limparSessaoAuthBrowser();

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
    const token = extrairTokenJwtLoginResponse(res);
    aplicarSessaoAuthCompletaNoBrowser(res.body.dados.user, token);
    if (token) {
      cy.log('[autenticarClienteDadosTeste] token JWT extraído e armazenado para chamadas API');
    }
    // Ensure sessionStorage write completes before visit to avoid restoreSession seeing stale snapshot
    cy.window().then(() => {
      cy.visit('/');
      // Aguarda o header de perfil aparecer indicando que a sessão foi restaurada
      cy.get('[data-cy="header-user-profile"]', { timeout: 30000 }).should('be.visible');
    });
  });
});

Cypress.Commands.add('autenticarViaApi', (email, senha) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  limparSessaoAuthBrowser();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers,
    body: { email, senha },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const masked = email.includes('@') ? `${email[0]}***@${email.split('@')[1]}` : '***';
    cy.log(`[autenticarViaApi] sessão API OK (${masked})`);
    const token = extrairTokenJwtLoginResponse(response);
    aplicarSessaoAuthCompletaNoBrowser(response.body?.dados?.user, token);
    if (token) {
      cy.log('[autenticarViaApi] token JWT extraído e armazenado para chamadas API');
    }
    // Ensure sessionStorage write from apply completes before visiting (prevents restoreSession race)
    cy.window().then(() => {
      cy.visit('/');
    });
  });
});

Cypress.Commands.add('login', (email, password) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  
  // Interceptar a resposta de login para extrair o token
  cy.intercept('POST', `${apiUrl}/auth/login`).as('loginRequest');
  
  cy.visit('/minha-conta');
  cy.getDataCy('login-email-input').type(email);
  cy.getDataCy('login-password-input').type(password);
  cy.getDataCy('login-submit-button').click();
  
  // Aguarda o login ser processado e extrai o token
  cy.wait('@loginRequest').then((interception) => {
    if (!interception.response) {
      return;
    }
    const token = extrairTokenJwtLoginResponse(interception.response);
    armazenarTokenAuth(token);
    if (token) {
      cy.log('[login] token JWT extraído e armazenado para chamadas API');
    }
  });
  
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
        limparSessaoAuthBrowser();
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
            const token = extrairTokenJwtLoginResponse(loginResponse);
            armazenarTokenAuth(token);
            aplicarCookieAuthNoBrowser(token);
            if (token) {
              cy.log('[loginProgramatico cliente] token JWT extraído e armazenado para chamadas API');
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
      limparSessaoAuthBrowser();
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
          const token = extrairTokenJwtLoginResponse(response);
          armazenarTokenAuth(token);
          aplicarCookieAuthNoBrowser(token);
          if (token) {
            cy.log('[loginProgramatico admin] token JWT extraído e armazenado para chamadas API');
          }
        });
      });
    }, {
      cacheAcrossSpecs: false
    });
  }
});

// ============================================
// COMANDOS DE CARRINHO
// ============================================

Cypress.Commands.add('garantirEnderecoViaApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

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

Cypress.Commands.add('adicionarPrimeiroLivroCarrinhoDetalhe', () => {
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

Cypress.Commands.add('criarCarrinhoViaApi', (items) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

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
});

Cypress.Commands.add('adicionarAoCarrinhoViaApi', (livroUuid, quantidade = 1) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.request({
      method: 'POST',
      url: `${apiUrl}/carrinho/itens`,
      headers,
      body: { livroUuid, quantidade },
    });
  });
});

Cypress.Commands.add('limparCarrinhoViaApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/carrinho`,
      headers,
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('limparCartoesSalvosViaApi', () => {
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

/** UUIDs fixos da migration 022 (bandeiras no banco de testes). */
const BANDEIRA_UUID_POR_NOME: Record<string, string> = {
  Visa: 'd30d587f-8140-469d-a5fc-8e0c998c72f4',
  Mastercard: 'd6eac520-7651-4ae9-84d5-b0bbf269be2e',
};

Cypress.Commands.add('criarCartaoViaApi', (opts = {}) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();
  const ultimosDigitos = opts.ultimosDigitos || '0002';
  const bandeiraNome = opts.bandeira || 'Visa';
  const uuidBandeira = BANDEIRA_UUID_POR_NOME[bandeiraNome] ?? BANDEIRA_UUID_POR_NOME.Visa;
  const sufixo = String(Date.now()).slice(-4);

  cy.request({
    method: 'POST',
    url: `${apiUrl}/clientes/perfil/cartoes`,
    headers,
    body: {
      uuidBandeira,
      token: `tok_e2e_${sufixo}`,
      ultimosDigitosCartao: ultimosDigitos,
      nomeImpresso: 'CLIENTE TESTE E2E',
      validade: '2029-12-01',
      cvv: '123',
      principal: false,
    },
    failOnStatusCode: false,
  }).then((res) => {
    cy.log(`[criarCartaoViaApi] POST cartões → HTTP ${res.status} | final=${ultimosDigitos}`);
    expect(res.status, 'cadastro de cartão via API').to.be.oneOf([200, 201]);
  });
});

Cypress.Commands.add('garantirCartoesViaApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

  return cy
    .request<PagamentoInfoResponse>({
      method: 'GET',
      url: `${apiUrl}/pagamento/info`,
      qs: { cepDestino: '01310100', pesoKg: 1 },
      headers,
      failOnStatusCode: false,
    })
    .then((infoRes) => {
      const qtdInfo = infoRes.body?.cartoesCliente?.length ?? 0;
      cy.log(`[garantirCartoesViaApi] cartoesCliente em /pagamento/info: ${qtdInfo}`);
      if (qtdInfo > 0) return false;

      return cy
        .request({
          method: 'GET',
          url: `${apiUrl}/clientes/perfil/cartoes`,
          headers,
          failOnStatusCode: false,
        })
        .then((listaRes) => {
          const dados = listaRes.body?.dados as { uuid: string }[] | undefined;
          const qtdPerfil = Array.isArray(dados) ? dados.length : 0;
          cy.log(`[garantirCartoesViaApi] cartões em GET /perfil/cartoes: ${qtdPerfil}`);
          if (qtdPerfil > 0) {
            cy.log(
              '[garantirCartoesViaApi:lock] cartões no perfil mas ausentes em /pagamento/info — verifique obterPerfil',
            );
            return false;
          }
          return cy.criarCartaoViaApi({ ultimosDigitos: '0002', bandeira: 'Visa' }).then(() => true);
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

/** Totais de venda E2E alinhados ao preço real do catálogo (evita RN de preço divergente). */
function montarTotaisVendaE2e(precoUnitario: number, quantidade = 1, valorFrete = 10) {
  const valorTotalItens = Number((precoUnitario * quantidade).toFixed(2));
  const frete = Number(valorFrete.toFixed(2));
  return {
    valorTotalItens,
    valorFrete: frete,
    valorTotal: Number((valorTotalItens + frete).toFixed(2)),
  };
}

Cypress.Commands.add('obterPrimeiroLivroCatalogo', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

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

Cypress.Commands.add('removerEnderecosUsuarioViaApi', () => {
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

// ============================================
// COMANDOS DE CHECKOUT
// ============================================
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

Cypress.Commands.add('checkoutPreencherFretePadrao', (cep: string) => {
  // Lock: aguarda o input estar visível e estável antes de interagir
  cy.get('[data-cy="checkout-freight-zip-input"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .first()
    .scrollIntoView()
    .clear()
    .type(cep, { delay: 50 });
  
  // Lock: aguarda o botão estar clicável e estável
  cy.get('[data-cy="checkout-freight-calculate-button"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .first()
    .scrollIntoView()
    .click();
  
  cy.wait('@freteCotar', { timeout: 15000 });
  
  // Lock: aguarda as opções de frete estarem visíveis antes de selecionar
  cy.get('[data-cy="checkout-freight-option-PAC"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .first()
    .scrollIntoView()
    .click();
});

Cypress.Commands.add('checkoutIrFinalizarCompra', () => {
  cy.visit('/carrinho');
  cy.contains('Finalizar Compra', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true });

  cy.contains('h1', 'Finalizar Compra', { timeout: 30000 }).should('be.visible');
  cy.wait('@pagamentoInfo', { timeout: 20000 }).then((interception) => {
    const body = interception.response?.body as PagamentoInfoResponse | undefined;
    const qtd = body?.cartoesCliente?.length ?? 0;
    cy.log(`[checkoutIrFinalizarCompra:lock] @pagamentoInfo HTTP ${interception.response?.statusCode} | cartoes=${qtd}`);
  });
});

Cypress.Commands.add('checkoutSelecionarCartaoSalvoPreferido', (bandeira: 'Visa' | 'Mastercard' = 'Mastercard') => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

  cy.garantirCartoesViaApi().then((criouNovo) => {
    if (criouNovo) {
      cy.log('[checkoutSelecionarCartao:lock] cartão criado via API — recarregando checkout');
      cy.reload();
      cy.wait('@pagamentoInfo', { timeout: 20000 });
    }
  });

  cy.request<PagamentoInfoResponse>({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    qs: { cepDestino: '01310100', pesoKg: 1 },
    headers,
  }).then((res) => {
    const cartoes = (res.body.cartoesCliente ?? []) as {
      ultimosDigitosCartao: string;
      bandeira: string;
    }[];
    cy.log(`[checkoutSelecionarCartao:lock] cartoesCliente=${cartoes.length}`);
    if (cartoes.length === 0) {
      cy.log('[checkoutSelecionarCartao] sem cartões na API — fallback PIX');
      cy.checkoutPreencherPixCobrindoTotal();
      return;
    }
    const escolhido = cartoes.find((c) => c.bandeira === bandeira) ?? cartoes[0];
    cy.get(`[data-cy="checkout-card-item-${escolhido.ultimosDigitosCartao}"]`, { timeout: 20000 })
      .should('exist')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    cy.get(`[data-cy="checkout-card-item-${escolhido.ultimosDigitosCartao}"]`).should(
      'have.attr',
      'aria-pressed',
      'true',
    );
  });
});

Cypress.Commands.add('checkoutPreencherPixCobrindoTotal', () => {
  cy.get('[data-cy="checkout-split-toolbar"]', { timeout: 20000 }).scrollIntoView();
  cy.get('[data-cy="checkout-split-add-pix"]', { timeout: 15000 })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .click();

  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="checkout-split-remove-line-0"]').length) {
      cy.get('[data-cy="checkout-split-remove-line-0"]').click();
    }
  });

  const preencherValorPix = (valor: number) => {
    const v = Math.round(valor * 100) / 100;
    expect(v, 'total a cobrir com PIX').to.be.greaterThan(0);
    cy.get('[data-cy="checkout-split-line-value"]', { timeout: 10000 })
      .last()
      .clear({ force: true })
      .type(String(v), { force: true })
      .blur();
    cy.get('[data-cy="checkout-split-restante"]').should('contain', 'OK');
  };

  cy.get('[data-cy="checkout-split-restante"]', { timeout: 15000 }).then(($el) => {
    const texto = $el.text();
    if (texto.includes('OK')) {
      cy.log('[checkoutPreencherPix:lock] soma das linhas OK (auto-sync linha única)');
      return;
    }
    const doRestante = extrairTotalAposCuponsDoRestante(texto);
    if (doRestante > 0) {
      cy.log(`[checkoutPreencherPix:lock] total via checkout-split-restante: R$ ${doRestante}`);
      preencherValorPix(doRestante);
      return;
    }
    cy.get('[data-cy="checkout-total-value"]', { timeout: 5000 })
      .invoke('text')
      .then((t) => {
        const saldo = parseMoedaBrParaNumero(String(t));
        cy.log(`[checkoutPreencherPix:lock] saldo via checkout-total-value: R$ ${saldo}`);
        preencherValorPix(saldo);
      });
  });
});

Cypress.Commands.add('checkoutConfirmarPixSePendente', () => {
  cy.url({ timeout: 30000 }).then((url) => {
    if (!url.includes('/pagamento-pix')) {
      cy.log('[checkoutConfirmarPix] sem tela PIX — fluxo síncrono (cartão/cupom)');
      return;
    }
    cy.log('[checkoutConfirmarPix:lock] confirmando PIX via webhook simulado');
    cy.get('[data-cy="pagamento-pix-page"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy="pagamento-pix-simular-webhook"]').click();
    cy.url({ timeout: 20000 }).should('include', '/pedido-confirmado');
  });
});

Cypress.Commands.add('checkoutAplicarCupom', (codigo: string) => {
  // Lock: aguarda o input estar visível e estável antes de interagir
  cy.get('[data-cy="checkout-coupon-input"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .first()
    .scrollIntoView()
    .clear()
    .type(codigo, { delay: 50 });
  
  // Lock: aguarda o botão estar clicável e estável
  cy.get('[data-cy="checkout-apply-coupon-button"]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .should('not.be.disabled')
    .first()
    .scrollIntoView()
    .click();
});

Cypress.Commands.add(
  'prepararCarrinhoComUmLivro',
  (opts: { via: 'api'; livroUuid: string; quantidade?: number } | { via: 'ui' }) => {
    if (opts.via === 'api') {
      cy.criarCarrinhoViaApi([{ livroUuid: opts.livroUuid, quantidade: opts.quantidade ?? 1 }]);
    } else {
      cy.adicionarPrimeiroLivroCarrinhoDetalhe();
    }
  },
);

/**
 * Versão sincronizada de prepararCarrinhoComUmLivro para suítes que precisam de estado Redux sincronizado.
 * Após createCart via API, visita o checkout e sincroniza pela UI.
 * `livroUuid` opcional: quando omitido, usa o primeiro título retornado por GET /livros (banco real).
 */
Cypress.Commands.add('prepararCarrinhoSincronizado', (opts?: { livroUuid?: string; quantidade?: number }) => {
  const quantidade = opts?.quantidade ?? 1;
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();
  const checkoutTimeout = Cypress.env('checkoutTimeout') ? Number(Cypress.env('checkoutTimeout')) : 20000;

  const montar = (livroUuid: string) => {
    cy.criarCarrinhoViaApi([{ livroUuid, quantidade }]);
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

// ============================================
// COMANDOS DE ADMIN
// ============================================
/**
 * Comandos reutilizáveis para testes de admin - fluxo de despacho, entrega e trocas
 */

Cypress.Commands.add('autenticarAdministradorViaApi', () => {
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
  const headers = apiHeadersBancoTestes();

  limparSessaoAuthBrowser();

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
    if (res.status !== 200 || !res.body?.dados?.user) {
      throw new Error(
        `Login admin seed falhou (${res.status}): ${JSON.stringify(res.body)} — verifique admintest@email.com no banco de testes.`,
      );
    }
    const token = extrairTokenJwtLoginResponse(res);
    aplicarSessaoAuthCompletaNoBrowser(res.body.dados.user, token);
    if (token) {
      cy.log('[autenticarAdministradorViaApi] token JWT extraído e armazenado para chamadas API');
    }
    // Ensure sessionStorage write completes before visit (race fix for beforeEach timeouts)
    cy.window().then(() => {
      cy.visit('/');
      // Aguarda o header de perfil aparecer indicando que a sessão foi restaurada
      cy.get('[data-cy="header-user-profile"]', { timeout: 30000 }).should('be.visible');
    });
  });
});

Cypress.Commands.add('criarVendaAprovadaViaApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    return cy.autenticarClienteDadosTeste()
      .then(() =>
        cy.request<CatalogoResponse>({
          method: 'GET',
          url: `${apiUrl}/livros`,
          qs: { pagina: 1, itensPorPagina: 1, ordenacao: 'recentes' },
          headers,
        }),
      )
      .then((catRes) => {
        const livro = catRes.body.livros[0];
        if (!livro?.uuid || livro.preco == null) {
          throw new Error(`Catálogo inválido para venda E2E: ${JSON.stringify(catRes.body)}`);
        }
        return cy
          .request({
            method: 'POST',
            url: `${apiUrl}/carrinho/itens`,
            headers,
            body: { livroUuid: livro.uuid, quantidade: 1 },
          })
          .then(() => ({ livroUuid: livro.uuid, precoUnitario: livro.preco }));
      })
      .then(({ livroUuid, precoUnitario }) => {
        const totais = montarTotaisVendaE2e(precoUnitario);
        return cy
          .request({
            method: 'POST',
            url: `${apiUrl}/vendas`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...headers,
            },
            body: {
              itens: [{ livroUuid, quantidade: 1, precoUnitario }],
              ...totais,
            },
          })
          .then((res) => {
            const vendaUuid = res.body.venda?.id || res.body.id;
            if (!vendaUuid) {
              throw new Error(`UUID da venda não encontrado na resposta: ${JSON.stringify(res.body)}`);
            }
            return { vendaUuid, livroUuid, valorTotal: totais.valorTotal };
          });
      })
    .then(({ vendaUuid, valorTotal }) => {
      // Selecionar pagamento
      return cy.request({
        method: 'POST',
        url: `${apiUrl}/pagamentos/selecionar`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...headers,
        },
        body: {
          vendaUuid,
          valor: valorTotal,
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
        if (!pagamentoUuid) {
          throw new Error(`Pagamento UUID não encontrado: ${JSON.stringify(selRes.body)}`);
        }
        // Processar pagamento
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
          headers,
        }).then((procRes) => {
          if (procRes.body.status !== 'APROVADO') {
            throw new Error(`Pagamento não aprovado: ${JSON.stringify(procRes.body)}`);
          }
          return vendaUuid;
        });
      });
    })
    .then((vendaUuid) => {
      // Obter item UUID
      return cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers,
      }).then((vendaRes) => ({
        vendaUuid,
        itemVendaUuid: vendaRes.body.itens[0].id,
      }));
    });
  });
});

Cypress.Commands.add('despacharPedidoViaApi', (vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const restaurar = opts?.restaurarSessao ?? 'cliente';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarAdministradorViaApi();
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
      headers,
    });
    if (restaurar === 'cliente') {
      cy.autenticarClienteDadosTeste();
    } else if (restaurar === 'admin') {
      cy.autenticarAdministradorViaApi();
    }
  });
});

Cypress.Commands.add('confirmarEntregaViaApi', (vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const restaurar = opts?.restaurarSessao ?? 'cliente';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarAdministradorViaApi();
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
      headers,
    });
    if (restaurar === 'cliente') {
      cy.autenticarClienteDadosTeste();
    } else if (restaurar === 'admin') {
      cy.autenticarAdministradorViaApi();
    }
  });
});

Cypress.Commands.add('marcarFalhaEntregaViaApi', (vendaUuid: string, motivo: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarAdministradorViaApi();
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
});

Cypress.Commands.add('solicitarTrocaViaApi', (vendaUuid: string, itemVendaUuid: string, motivo: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarClienteDadosTeste();
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
});

Cypress.Commands.add('logout', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/logout`,
    headers,
    failOnStatusCode: false, // Logout pode falhar se não estiver autenticado
  }).then(() => {
    cy.clearAllSessionStorage();
    cy.clearCookie('authToken');
    cy.clearCookie('x-use-test-db');
    cy.clearCookie('x-loja-uuid');
    Cypress.env('authToken', undefined);
    cy.visit('/');
  });
});

Cypress.Commands.add('autorizarTrocaViaApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarAdministradorViaApi();
    cy.request({
      method: 'POST',
      url: `${apiUrl}/vendas/${vendaUuid}/troca/autorizar`,
      headers,
    });
  });
});

Cypress.Commands.add('confirmarRecebimentoTrocaViaApi', (vendaUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    const headers = apiHeadersBancoTestesComLoja(lojaUuid);

    cy.autenticarAdministradorViaApi();
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/admin/pedidos/${vendaUuid}/confirmar-recebimento`,
      headers,
      body: { retornarEstoque: true },
    });
  });
});

// ============================================
// COMANDOS MULTI-TENANCY POR LOJA
// ============================================

/**
 * Obtém o UUID da loja padrão E2E via API admin (não usa sessão do cliente).
 * Resultado cacheado em `Cypress.env('lojaPadraoUuid')`.
 */
/** Reaplica cookies de loja/test-db no browser (ex.: após `logout` limpar o contexto). */
function aplicarCookiesContextoLojaE2e(lojaUuid: string): void {
  cy.setCookie('x-loja-uuid', lojaUuid, { path: '/' });
  if (Cypress.env('injectTestDbHeader') === true) {
    cy.setCookie('x-use-test-db', 'true', { path: '/' });
  }
}

Cypress.Commands.add('obterLojaPadraoUuid', () => {
  const cached = Cypress.env('lojaPadraoUuid') as string | undefined;
  if (cached) {
    aplicarCookiesContextoLojaE2e(cached);
    return cy.wrap(cached);
  }

  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const adminCfg = Cypress.env('admin') as { email?: string; senha?: string } | undefined;
  const emailAdmin =
    (Cypress.env('adminEmail') as string | undefined) ??
    adminCfg?.email ??
    'admintest@email.com';
  const senhaAdmin =
    (Cypress.env('adminSenha') as string | undefined) ??
    adminCfg?.senha ??
    '@asdfJKL\u00C7123';

  const authTokenAnterior = Cypress.env('authToken') as string | undefined;

  return cy
    .request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...getTestDbHeaders(),
      },
      body: { email: emailAdmin, senha: senhaAdmin },
      failOnStatusCode: false,
    })
    .then((loginRes) => {
      if (loginRes.status !== 200) {
        throw new Error(
          `Login admin para resolver loja E2E falhou (${loginRes.status}): ${JSON.stringify(loginRes.body)}`,
        );
      }

      const adminToken = extrairTokenJwtLoginResponse(loginRes);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        ...getTestDbHeaders(),
      };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      return cy
        .request({
          method: 'GET',
          url: `${apiUrl}/admin/lojas`,
          headers,
          failOnStatusCode: false,
        })
        .then((res) => {
          if (res.status !== 200) {
            throw new Error(
              `GET /admin/lojas falhou (${res.status}): ${JSON.stringify(res.body)}`,
            );
          }

          const lojaUuid = resolverUuidLojaPadraoNasLojas(res.body.dados);
          if (!lojaUuid) {
            throw new Error(
              `Nenhuma loja E2E encontrada. Slugs esperados: loja-padrao, livraria-teste. dados=${JSON.stringify(res.body.dados)}`,
            );
          }

          Cypress.env('lojaPadraoUuid', lojaUuid);

          // CRITICAL: set cookie so browser fetches (React queries) also get x-loja-uuid context
          aplicarCookiesContextoLojaE2e(lojaUuid);

          if (authTokenAnterior) {
            Cypress.env('authToken', authTokenAnterior);
            aplicarCookieAuthNoBrowser(authTokenAnterior);
          }
          // Sem token anterior: não limpar cookie — evita apagar sessão do browser ativa
        })
        .then(() => cy.wrap(Cypress.env('lojaPadraoUuid') as string));
    });
});

/**
 * Cria ambiente de multi-loja para testes
 * Executa o seed 033_seed_multi_loja_testes.sql via API admin
 */
Cypress.Commands.add('criarAmbienteMultiLoja', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

  // Em desenvolvimento, o seed SQL 033_seed_multi_loja_testes.sql já deve ter criado as lojas
  // Em testes, tentamos usar o bootstrap
  cy.request({
    method: 'POST',
    url: `${apiUrl}/admin/bootstrap`,
    headers: {
      ...headers,
      'x-test-bootstrap-key': Cypress.env('testBootstrapKey') || 'test-key-123',
    },
    failOnStatusCode: false,
  }).then((res) => {
    const statusValido = res.status === 200 || res.status === 201;
    
    if (!statusValido) {
      cy.log('[criarAmbienteMultiLoja] Bootstrap não executado (esperado em dev). Assumindo seed SQL já criou lojas A e B.');
    }
  });
});

/**
 * Autentica como admin da Loja A (loja-a-multi-tenancy)
 * Para testes de UI, faz login via UI e define cookie x-loja-uuid
 */
Cypress.Commands.add('autenticarAdminLojaA', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  // Primeiro, obter o UUID da Loja A via API (requer token admin)
  cy.autenticarAdministradorViaApi().then(() => {
    const headers = apiHeadersBancoTestes();
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers,
    });
  }).then((res) => {
    cy.log(`[autenticarAdminLojaA] Lojas disponíveis: ${JSON.stringify(res.body.dados?.map((l: any) => l.slug))}`);
    const lojaA = res.body.dados?.find((l: { slug: string }) => l.slug === 'loja-a-multi-tenancy');
    
    if (!lojaA) {
      // Fallback: usar a primeira loja disponível se a loja A específica não existir
      const primeiraLoja = res.body.dados?.[0];
      if (primeiraLoja) {
        cy.log(`[autenticarAdminLojaA] Loja A não encontrada, usando fallback: ${primeiraLoja.slug} (uuid=${primeiraLoja.uuid})`);
        cy.setCookie('x-loja-uuid', primeiraLoja.uuid);
        cy.setCookie('x-use-test-db', 'true');
        
        // Fazer login via UI com admin do sistema
        cy.visit('/minha-conta');
        cy.getDataCy('login-email-input').type('admin@livraria.com.br');
        cy.getDataCy('login-password-input').type('Admin@123');
        cy.getDataCy('login-submit-button').click();
        
        cy.url().should('not.include', '/minha-conta');
        cy.log(`[autenticarAdminLojaA] Login via UI realizado com fallback para ${primeiraLoja.slug}`);
        return;
      }
      throw new Error('Loja A não encontrada e nenhuma loja alternativa disponível');
    }
    
    // Definir cookie x-loja-uuid antes do login
    cy.setCookie('x-loja-uuid', lojaA.uuid);
    cy.setCookie('x-use-test-db', 'true');
    
    // Fazer login via UI
    cy.visit('/minha-conta');
    cy.getDataCy('login-email-input').type('admin_loja_a@email.com');
    cy.getDataCy('login-password-input').type('SenhaAdminA123!');
    cy.getDataCy('login-submit-button').click();
    
    // Aguardar redirecionamento para confirmar login
    cy.url().should('not.include', '/minha-conta');
    cy.log(`[autenticarAdminLojaA] Login via UI realizado com sucesso para Loja A (uuid=${lojaA.uuid})`);
  });
});

/**
 * Autentica como admin da Loja B (loja-b-multi-tenancy)
 * Para testes de UI, faz login via UI e define cookie x-loja-uuid
 */
Cypress.Commands.add('autenticarAdminLojaB', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  cy.autenticarAdministradorViaApi().then(() => {
    const headers = apiHeadersBancoTestes();
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers,
    });
  }).then((res) => {
    cy.log(`[autenticarAdminLojaB] Lojas disponíveis: ${JSON.stringify(res.body.dados?.map((l: any) => l.slug))}`);
    const lojaB = res.body.dados?.find((l: { slug: string }) => l.slug === 'loja-b-multi-tenancy');
    
    if (!lojaB) {
      // Fallback: usar a segunda loja disponível se a loja B específica não existir
      const segundaLoja = res.body.dados?.[1] || res.body.dados?.[0];
      if (segundaLoja) {
        cy.log(`[autenticarAdminLojaB] Loja B não encontrada, usando fallback: ${segundaLoja.slug} (uuid=${segundaLoja.uuid})`);
        cy.setCookie('x-loja-uuid', segundaLoja.uuid);
        cy.setCookie('x-use-test-db', 'true');
        
        // Fazer login via UI com admin do sistema
        cy.visit('/minha-conta');
        cy.getDataCy('login-email-input').type('admin@livraria.com.br');
        cy.getDataCy('login-password-input').type('Admin@123');
        cy.getDataCy('login-submit-button').click();
        
        cy.url().should('not.include', '/minha-conta');
        cy.log(`[autenticarAdminLojaB] Login via UI realizado com fallback para ${segundaLoja.slug}`);
        return;
      }
      throw new Error('Loja B não encontrada e nenhuma loja alternativa disponível');
    }
    
    // Definir cookie x-loja-uuid antes do login
    cy.setCookie('x-loja-uuid', lojaB.uuid);
    cy.setCookie('x-use-test-db', 'true');
    
    // Fazer login via UI
    cy.visit('/minha-conta');
    cy.getDataCy('login-email-input').type('admin_loja_b@email.com');
    cy.getDataCy('login-password-input').type('SenhaAdminB123!');
    cy.getDataCy('login-submit-button').click();
    
    // Aguardar redirecionamento para confirmar login
    cy.url().should('not.include', '/minha-conta');
    cy.log(`[autenticarAdminLojaB] Login via UI realizado com sucesso para Loja B (uuid=${lojaB.uuid})`);
  });
});

/**
 * Cria uma venda vinculada à Loja A (loja-a-multi-tenancy)
 */
Cypress.Commands.add('criarVendaLojaA', (livroUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.autenticarAdministradorViaApi().then(() => {
    const headers = apiHeadersBancoTestes();
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers,
    });
  }).then((res) => {
    cy.log(`[criarVendaLojaA] Lojas disponíveis: ${JSON.stringify(res.body.dados?.map((l: any) => l.slug))}`);
    const lojaA = res.body.dados?.find((l: { slug: string }) => l.slug === 'loja-a-multi-tenancy');
    
    if (!lojaA) {
      // Fallback: usar a primeira loja disponível
      const primeiraLoja = res.body.dados?.[0];
      if (!primeiraLoja) {
        throw new Error('Loja A não encontrada e nenhuma loja alternativa disponível');
      }
      cy.log(`[criarVendaLojaA] Loja A não encontrada, usando fallback: ${primeiraLoja.slug} (uuid=${primeiraLoja.uuid})`);
      return cy.wrap(primeiraLoja);
    }
    return cy.wrap(lojaA);
  }).then((lojaA: any) => {

    const headersLojaA = () => apiHeadersBancoTestesComLoja(lojaA.uuid);
    
    return cy.autenticarClienteDadosTeste()
      .then(() => {
        // Definir cookie x-loja-uuid para Loja A
        cy.setCookie('x-loja-uuid', lojaA.uuid);
      })
      .then(() => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: headersLojaA(),
          body: {
            livroUuid,
            quantidade: 1,
          },
        });
      })
      .then(() => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headersLojaA(),
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        });
      })
      .then((res) => {
        const vendaUuid = res.body.venda?.id || res.body.id;
        
        if (!vendaUuid) {
          throw new Error(`UUID da venda não encontrado: ${JSON.stringify(res.body)}`);
        }
        
        return { vendaUuid, livroUuid };
      })
      .then(({ vendaUuid }) => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/pagamentos/selecionar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headersLojaA(),
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
          
          if (!pagamentoUuid) {
            throw new Error(`Pagamento UUID não encontrado: ${JSON.stringify(selRes.body)}`);
          }
          
          return cy.request({
            method: 'POST',
            url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
            headers: headersLojaA(),
          }).then(() => vendaUuid);
        });
      })
      .then((vendaUuid) => {
        return cy.request({
          method: 'GET',
          url: `${apiUrl}/vendas/${vendaUuid}`,
          headers: headersLojaA(),
        }).then((vendaRes) => ({
          vendaUuid,
          itemVendaUuid: vendaRes.body.itens[0].id,
        }));
      });
  });
});

/**
 * Cria uma venda vinculada à Loja B (loja-b-multi-tenancy)
 */
Cypress.Commands.add('criarVendaLojaB', (livroUuid: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

  return cy.autenticarAdministradorViaApi().then(() => {
    const headers = apiHeadersBancoTestes();
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers,
    });
  }).then((res) => {
    cy.log(`[criarVendaLojaB] Lojas disponíveis: ${JSON.stringify(res.body.dados?.map((l: any) => l.slug))}`);
    const lojaB = res.body.dados?.find((l: { slug: string }) => l.slug === 'loja-b-multi-tenancy');
    
    if (!lojaB) {
      // Fallback: usar a segunda loja disponível
      const segundaLoja = res.body.dados?.[1] || res.body.dados?.[0];
      if (!segundaLoja) {
        throw new Error('Loja B não encontrada e nenhuma loja alternativa disponível');
      }
      cy.log(`[criarVendaLojaB] Loja B não encontrada, usando fallback: ${segundaLoja.slug} (uuid=${segundaLoja.uuid})`);
      return cy.wrap(segundaLoja);
    }
    return cy.wrap(lojaB);
  }).then((lojaB: any) => {

    const headersLojaB = () => apiHeadersBancoTestesComLoja(lojaB.uuid);
    
    return cy.autenticarClienteDadosTeste()
      .then(() => {
        cy.setCookie('x-loja-uuid', lojaB.uuid);
      })
      .then(() => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/carrinho/itens`,
          headers: headersLojaB(),
          body: {
            livroUuid,
            quantidade: 1,
          },
        });
      })
      .then(() => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/vendas`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headersLojaB(),
          },
          body: {
            itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
            valorTotalItens: 30,
            valorFrete: 10,
            valorTotal: 40,
          },
        });
      })
      .then((res) => {
        const vendaUuid = res.body.venda?.id || res.body.id;
        
        if (!vendaUuid) {
          throw new Error(`UUID da venda não encontrado: ${JSON.stringify(res.body)}`);
        }
        
        return { vendaUuid, livroUuid };
      })
      .then(({ vendaUuid }) => {
        return cy.request({
          method: 'POST',
          url: `${apiUrl}/pagamentos/selecionar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headersLojaB(),
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
          
          if (!pagamentoUuid) {
            throw new Error(`Pagamento UUID não encontrado: ${JSON.stringify(selRes.body)}`);
          }
          
          return cy.request({
            method: 'POST',
            url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
            headers: headersLojaB(),
          }).then(() => vendaUuid);
        });
      })
      .then((vendaUuid) => {
        return cy.request({
          method: 'GET',
          url: `${apiUrl}/vendas/${vendaUuid}`,
          headers: headersLojaB(),
        }).then((vendaRes) => ({
          vendaUuid,
          itemVendaUuid: vendaRes.body.itens[0].id,
        }));
      });
  });
});

/**
 * Autentica como admin que pertence a múltiplas lojas (Loja A e Loja B)
 * Para testes do seletor de loja no header admin
 */
Cypress.Commands.add('autenticarAdminMultiLoja', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const headers = apiHeadersBancoTestes();

  // Primeiro, obter o UUID da Loja A via API
  cy.request({
    method: 'GET',
    url: `${apiUrl}/admin/lojas`,
    headers,
  }).then((res) => {
    const lojaA = res.body.dados.find((l: { slug: string }) => l.slug === 'loja-a-multi-tenancy');

    if (!lojaA) {
      throw new Error('Loja A não encontrada');
    }

    // Definir cookie x-loja-uuid antes do login (começa com Loja A)
    cy.setCookie('x-loja-uuid', lojaA.uuid);
    cy.setCookie('x-use-test-db', 'true');

    // Fazer login via UI com admin que tem múltiplas lojas
    cy.visit('/minha-conta');
    cy.getDataCy('login-email-input').type('admin-multi-loja@teste.com');
    cy.getDataCy('login-password-input').type('SenhaAdminMulti123!');
    cy.getDataCy('login-submit-button').click();

    // Aguardar redirecionamento para confirmar login
    cy.url().should('not.include', '/minha-conta');
    cy.log(`[autenticarAdminMultiLoja] Login via UI realizado com sucesso (uuid=${lojaA.uuid})`);
  });
});

export {};
