// Helpers para testes E2E do e-commerce de livros

declare namespace Cypress {
  interface Chainable {
    criarTrocaAutorizada(pedidoUuid?: string): Chainable<void>;
    prepararPedidoEntregue(): Chainable<string>;
    autorizarTrocaViaApi(pedidoUuid: string): Chainable<void>;
    limparCarrinhoViaApi(): Chainable<void>;
  }
}

function getApiUrl(): string {
  return Cypress.env('apiUrl') || 'http://localhost:3001/api';
}

function getTestDbHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  // Bypass rate limiting for E2E tests usando banco de desenvolvimento
  headers['X-Test-Rate-Limit-Key'] = `cypress-e2e-${Date.now()}`;
  return headers;
}

/**
 * Autoriza, via API admin, a troca de um pedido específico (status "Em Troca").
 * Não depende da seleção de itens no painel (o backend não marca `emTroca` na
 * listagem de trocas), garantindo uma transição determinística para
 * "Troca Autorizada".
 */
Cypress.Commands.add('autorizarTrocaViaApi', (pedidoUuid: string) => {
  const apiUrl = getApiUrl();
  const hdr = getTestDbHeaders();

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: hdr,
    body: { email: 'admintest@email.com', senha: '123456' },
  }).then((loginAdmin) => {
    const authAdmin = { ...hdr, Authorization: `Bearer ${loginAdmin.body.dados.token}` };
    cy.request({
      method: 'PATCH',
      url: `${apiUrl}/admin/pedidos/${pedidoUuid}/autorizar-troca`,
      headers: authAdmin,
    });
    // Logins via cy.request deixam cookies; preserva a sessão admin do navegador
    // que o corpo do teste já estabeleceu pela UI (não limpamos aqui).
  });
});

// Comando customizado para criar dados de teste de troca
Cypress.Commands.add('criarTrocaAutorizada', (pedidoUuidAlvo?: string) => {
  const apiUrl = getApiUrl();

  // Login como cliente para obter token
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: getTestDbHeaders(),
    body: {
      email: 'clientetest@email.com',
      senha: 'Teste@123456',
    },
  }).then((loginResponse) => {
    const token = loginResponse.body.dados.token;

    // Buscar pedidos do cliente
    cy.request({
      method: 'GET',
      url: `${apiUrl}/minhas-vendas`,
      headers: {
        ...getTestDbHeaders(),
        Authorization: `Bearer ${token}`,
      },
    }).then((pedidosResponse) => {
      const pedidos = pedidosResponse.body;
      // Se um uuid alvo foi informado, usa exatamente esse pedido (determinístico);
      // senão, cai no comportamento legado (primeiro "Entregue").
      const pedidoEntregue = pedidoUuidAlvo
        ? pedidos.find((p: any) => p.uuid === pedidoUuidAlvo)
        : pedidos.find((p: any) => p.status === 'Entregue');

      if (!pedidoEntregue) {
        cy.log('Nenhum pedido entregue encontrado para criar troca');
        return;
      }

      // Solicitar troca
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas/${pedidoEntregue.uuid}/troca`,
        headers: {
          ...getTestDbHeaders(),
          Authorization: `Bearer ${token}`,
        },
        body: {
          motivo: 'Produto chegou com defeito na capa, quero trocar por outro exemplar',
          itensUuids: [pedidoEntregue.itens[0].livroUuid],
        },
      }).then(() => {
        // Login como admin para autorizar a troca
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          headers: getTestDbHeaders(),
          body: {
            email: 'admintest@email.com',
            senha: '123456',
          },
        }).then((adminLoginResponse) => {
          const adminToken = adminLoginResponse.body.dados.token;

          // Autorizar a troca do pedido alvo (determinístico). Sem alvo, autoriza
          // a primeira "Em Troca" encontrada (comportamento legado).
          const autorizar = (uuid: string) =>
            cy.request({
              method: 'PATCH',
              url: `${apiUrl}/admin/pedidos/${uuid}/autorizar-troca`,
              headers: {
                ...getTestDbHeaders(),
                Authorization: `Bearer ${adminToken}`,
              },
            }).then(() => {
              cy.log(`Troca autorizada com sucesso para pedido ${uuid}`);
            });

          if (pedidoUuidAlvo) {
            autorizar(pedidoUuidAlvo);
            return;
          }

          // Buscar trocas (fallback legado)
          cy.request({
            method: 'GET',
            url: `${apiUrl}/admin/pedidos/trocas`,
            headers: {
              ...getTestDbHeaders(),
              Authorization: `Bearer ${adminToken}`,
            },
          }).then((trocasResponse) => {
            const trocas = trocasResponse.body;
            const trocaEmTroca = trocas.find((t: any) => t.status === 'Em Troca');

            if (!trocaEmTroca) {
              cy.log('Nenhuma troca em status "Em Troca" encontrada');
              return;
            }

            autorizar(trocaEmTroca.uuid);
          });
        });
      });
    });
  });

  // Logins via cy.request deixam cookies de sessão; limpa para o corpo do teste
  // começar deslogado (formulário de login visível).
  cy.clearCookies();
  cy.clearLocalStorage();
});

/**
 * Limpa o carrinho do cliente via API (requer autenticação).
 * NÃO limpa cookies para preservar sessão UI existente.
 */
Cypress.Commands.add('limparCarrinhoViaApi', () => {
  const apiUrl = getApiUrl();
  const hdr = getTestDbHeaders();

  // Login como cliente para obter token
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: hdr,
    body: { email: 'clientetest@email.com', senha: 'Teste@123456' },
  }).then((loginResponse) => {
    const token = loginResponse.body.dados.token;
    const auth = { ...hdr, Authorization: `Bearer ${token}` };

    // Limpar carrinho sem limpar cookies (preserva sessão UI)
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/carrinho`,
      headers: auth,
      failOnStatusCode: false,
    });
  });
});

/**
 * Cria um pedido próprio e o leva até "Entregue" — totalmente idempotente via API.
 * Antes consumia um pedido "Em Processamento" do seed (`.first()` botão despachar),
 * o que esgotava os dados e tornava o teste frágil. Agora cada execução cria o seu.
 */
Cypress.Commands.add('prepararPedidoEntregue', () => {
  const apiUrl = getApiUrl();
  const hdr = getTestDbHeaders();

  // 1. Login como cliente (dono do pedido, necessário para o fluxo de troca depois)
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: hdr,
    body: { email: 'clientetest@email.com', senha: 'Teste@123456' },
  }).then((loginCliente) => {
    const tokenCliente = loginCliente.body.dados.token;
    const authCliente = { ...hdr, Authorization: `Bearer ${tokenCliente}` };

    // 2. Escolher um livro do catálogo (preço usado para validar o total no backend)
    cy.request({ method: 'GET', url: `${apiUrl}/livros`, headers: authCliente }).then((livrosRes) => {
      const lista = Array.isArray(livrosRes.body)
        ? livrosRes.body
        : livrosRes.body.dados ?? livrosRes.body.livros ?? [];
      const livro = lista[0];
      const livroUuid = livro.uuid;
      const preco = Number(livro.preco ?? livro.precoVenda);
      const frete = 10;

      // 3. Criar a venda (nasce "EM PROCESSAMENTO", despachável)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: authCliente,
        body: {
          itens: [{ livroUuid, quantidade: 1, precoUnitario: preco }],
          valorTotalItens: preco,
          valorFrete: frete,
          valorTotal: preco + frete,
        },
      }).then((vendaRes) => {
        const pedidoUuid = vendaRes.body.uuid;

        // 4. Login admin e transição despachar → entrega (Entregue)
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          headers: hdr,
          body: { email: 'admintest@email.com', senha: '123456' },
        }).then((loginAdmin) => {
          const authAdmin = { ...hdr, Authorization: `Bearer ${loginAdmin.body.dados.token}` };

          cy.request({ method: 'PATCH', url: `${apiUrl}/admin/pedidos/${pedidoUuid}/despachar`, headers: authAdmin });
          cy.request({ method: 'PATCH', url: `${apiUrl}/admin/pedidos/${pedidoUuid}/entrega`, headers: authAdmin });

          // Os logins via cy.request deixam cookies de sessão no navegador; limpamos
          // para o corpo do teste começar deslogado (formulário de login visível).
          cy.clearCookies();
          cy.clearLocalStorage();

          cy.wrap(pedidoUuid);
        });
      });
    });
  });
});



