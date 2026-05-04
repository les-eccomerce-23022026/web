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
      removerEnderecosUsuarioApi(): Chainable<void>;
      /** Aliases GET pagamento/info, POST/GET carrinho — chamar no beforeEach antes das ações. */
      setupCheckoutNetworkSpies(): Chainable<void>;
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
       * Versão hidratada de prepararCarrinhoComUmLivro para suítes que precisam de estado Redux sincronizado.
       * Força uma visita ao carrinho após preparar via API para garantir que o React Query/Redux esteja hidratado.
       */
      prepararCarrinhoComUmLivroHidratado(
        opts: { livroUuid: string; quantidade?: number },
      ): Chainable<void>;
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

Cypress.Commands.add('garantirEnderecoApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'GET',
    url: `${apiUrl}/pagamento/info`,
    headers,
  }).then((response) => {
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
  });
});

Cypress.Commands.add('createCartApi', (items) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
  
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
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'POST',
    url: `${apiUrl}/carrinho/itens`,
    headers,
    body: { livroUuid, quantidade },
  });
});

Cypress.Commands.add('limparCarrinhoApi', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };

  cy.request({
    method: 'DELETE',
    url: `${apiUrl}/carrinho`,
    headers,
    failOnStatusCode: false
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
 * Força uma visita ao carrinho após preparar via API para garantir que o React Query/Redux esteja hidratado.
 * Útil para suítes sensíveis a hidratação onde o fluxo completo pela UI é muito lento.
 */
Cypress.Commands.add(
  'prepararCarrinhoComUmLivroHidratado',
  (opts: { livroUuid: string; quantidade?: number }) => {
    cy.createCartApi([{ livroUuid: opts.livroUuid, quantidade: opts.quantidade ?? 1 }]);
    // Força visita ao carrinho para hidratar o Redux antes do checkout
    cy.visit('/carrinho');
    cy.get('[data-cy="carrinho-linha-item"]', { timeout: 15000 }).should('be.visible');
  },
);

export {};
