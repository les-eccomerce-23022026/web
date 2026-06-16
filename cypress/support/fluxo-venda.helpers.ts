/**
 * Helpers de setup IDEMPOTENTE via API para os cenários da 7ª Entrega — Venda Completa.
 *
 * Lições aplicadas (ver docs/cenarios-faltantes-venda-completa.md):
 * - Setup via `cy.request` (não consome dados de seed; cada teste cria os seus).
 * - Sempre esperar o redirect pós-login antes de navegar (evita abortar a request
 *   de login → `TypeError: Failed to fetch`).
 * - Limpar cookies após logins via `cy.request` (deixam sessão no navegador).
 * - Usar uuids DETERMINÍSTICOS (nunca `.first()` em listas grandes).
 */

export const CLIENTE = { email: 'clientetest@email.com', senha: 'Teste@123456' };
export const ADMIN = { email: 'admintest@email.com', senha: '123456' };
export const ADMIN_SISTEMA = { email: 'admin_sistema@test.com', senha: '123456' };

export const CARTAO_VISA = {
  numero: '4111111111111111',
  nomeTitular: 'Cliente Teste',
  validade: '12/30',
  bandeira: 'Visa',
};

export const CARTAO_MASTERCARD = {
  numero: '5555555555554444',
  nomeTitular: 'Cliente Teste',
  validade: '11/29',
  bandeira: 'Mastercard',
};

function apiUrl(): string {
  return Cypress.env('apiUrl') || 'http://localhost:3001/api';
}

function headers(): Record<string, string> {
  // Bypass do rate-limit nos testes E2E.
  return { 'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}` };
}

/** Login via API; retorna o token (Chainable). */
export function loginApi(email: string, senha: string) {
  return cy
    .request({ method: 'POST', url: `${apiUrl()}/auth/login`, headers: headers(), body: { email, senha } })
    .then((res) => res.body.dados.token as string);
}

function auth(token: string): Record<string, string> {
  return { ...headers(), Authorization: `Bearer ${token}`, 'x-loja-uuid': '82c0a24c-4cf4-4b12-823a-f1a8b9a086c3' };
}

/** Cria uma venda do cliente (nasce EM PROCESSAMENTO) e retorna { uuid, itemUuid, valorTotal }. */
export function criarVendaApi(tokenCliente: string, opcoes?: { frete?: number }) {
  const frete = opcoes?.frete ?? 10;
  return cy.request({ method: 'GET', url: `${apiUrl()}/livros`, headers: auth(tokenCliente) }).then((livrosRes) => {
    const lista = Array.isArray(livrosRes.body)
      ? livrosRes.body
      : livrosRes.body.dados ?? livrosRes.body.livros ?? [];
    const livro = lista[0];
    const preco = Number(livro.preco ?? livro.precoVenda);
    return cy
      .request({
        method: 'POST',
        url: `${apiUrl()}/vendas`,
        headers: auth(tokenCliente),
        body: {
          itens: [{ livroUuid: livro.uuid, quantidade: 1, precoUnitario: preco }],
          valorTotalItens: preco,
          valorFrete: frete,
          valorTotal: preco + frete,
        },
      })
      .then((vendaRes) => ({
        uuid: vendaRes.body.uuid as string,
        itemUuid: (vendaRes.body.itens?.[0]?.livroUuid ?? livro.uuid) as string,
        valorTotal: Number(vendaRes.body.totalVenda ?? preco + frete),
      }));
  });
}

/** Aprova o pagamento (cartão) de uma venda → status APROVADA. */
export function aprovarPagamentoApi(tokenCliente: string, vendaUuid: string, valor: number) {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrl()}/pagamentos/selecionar`,
      headers: auth(tokenCliente),
      body: { vendaUuid, valor, tipoPagamento: 'cartao_credito', cartao: CARTAO_VISA },
    })
    .then((sel) => {
      const pagamentoUuid = sel.body.id as string;
      return cy.request({
        method: 'POST',
        url: `${apiUrl()}/pagamentos/${pagamentoUuid}/processar`,
        headers: auth(tokenCliente),
      });
    });
}

/** Admin: despacha e confirma entrega de uma venda → status ENTREGUE. */
export function entregarPedidoApi(tokenAdmin: string, vendaUuid: string) {
  // Despachar primeiro (status EM_TRANSITO)
  cy.request({ method: 'PATCH', url: `${apiUrl()}/admin/pedidos/${vendaUuid}/despachar`, headers: auth(tokenAdmin) });
  // Confirmar entrega usando endpoint do módulo vendas (atualiza status + data_hora_entrega)
  return cy.request({ method: 'PATCH', url: `${apiUrl()}/admin/pedidos/${vendaUuid}/entrega`, headers: auth(tokenAdmin) });
}

/** Cliente: solicita troca de itens de um pedido entregue. */
export function solicitarTrocaApi(tokenCliente: string, vendaUuid: string, itensUuids: string[], motivo: string) {
  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/vendas/${vendaUuid}/troca`,
    headers: auth(tokenCliente),
    body: { motivo, itensUuids },
  });
}

/** Cliente: solicita devolução de itens de um pedido entregue. */
export function solicitarDevolucaoApi(tokenCliente: string, vendaUuid: string, itensUuids: string[], motivo: string) {
  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/vendas/${vendaUuid}/devolucao`,
    headers: auth(tokenCliente),
    body: { motivo, itensUuids },
  });
}

/** Cria um pedido EM_PROCESSAMENTO (aprovado mas não despachado); retorna { uuid, itemUuid }. */
export function prepararPedidoEmProcessamentoApi() {
  return loginApi(CLIENTE.email, CLIENTE.senha).then((tokenCliente) =>
    criarVendaApi(tokenCliente).then((venda) =>
      cy.request({
        method: 'POST',
        url: `${apiUrl()}/pagamentos/selecionar`,
        headers: auth(tokenCliente),
        body: { vendaUuid: venda.uuid, valor: venda.valorTotal, tipoPagamento: 'cartao_credito', cartao: CARTAO_VISA },
      }).then((sel) => {
        const pagamentoUuid = sel.body.id as string;
        return cy.request({
          method: 'POST',
          url: `${apiUrl()}/pagamentos/${pagamentoUuid}/processar`,
          headers: auth(tokenCliente),
        }).then(() => {
          // Limpa a sessão deixada pelos logins via cy.request.
          cy.clearCookies();
          cy.clearLocalStorage();
          return cy.wrap({ uuid: venda.uuid, itemUuid: venda.itemUuid });
        });
      })
    )
  );
}

/** Cria um pedido ENTREGUE pronto para o fluxo de pós-venda; retorna { uuid, itemUuid }. */
export function prepararPedidoEntregueApi() {
  return loginApi(CLIENTE.email, CLIENTE.senha).then((tokenCliente) =>
    criarVendaApi(tokenCliente).then((venda) =>
      loginApi(ADMIN.email, ADMIN.senha).then((tokenAdmin) => {
        entregarPedidoApi(tokenAdmin, venda.uuid);
        // Limpa a sessão deixada pelos logins via cy.request.
        cy.clearCookies();
        cy.clearLocalStorage();
        return cy.wrap({ uuid: venda.uuid, itemUuid: venda.itemUuid });
      }),
    ),
  );
}

/** Login de cliente via UI, esperando o redirect (evita abortar a request de login). */
export function loginClienteUi() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').clear().type(CLIENTE.email);
  cy.get('[data-cy="login-password-input"]').clear().type(CLIENTE.senha);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.url().should('not.include', '/minha-conta');
}

/** Login de admin via UI, esperando o redirect. */
export function loginAdminUi() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/minha-conta');
  cy.get('[data-cy="login-email-input"]').clear().type(ADMIN.email);
  cy.get('[data-cy="login-password-input"]').clear().type(ADMIN.senha);
  cy.get('[data-cy="login-submit-button"]').click();
  cy.url().should('include', '/admin');
}

/** Login de admin_sistema via API (para testes de endpoints sem UI). */
export function loginAdminSistemaApi() {
  return loginApi(ADMIN_SISTEMA.email, ADMIN_SISTEMA.senha);
}

/** Adiciona N livros ao carrinho a partir da home. */
export function adicionarLivrosAoCarrinho(quantidade = 2) {
  for (let i = 0; i < quantidade; i += 1) {
    cy.visit('/');
    cy.get('[data-cy="adicionar-carrinho-card-button"]').eq(i).click();
    cy.get('[data-cy="header-cart-link"]').should('be.visible');
  }
}

/** Carrinho → checkout, com endereço e frete já selecionados. */
export function irParaCheckoutComEnderecoEFrete(cep = '08720-510') {
  cy.visit('/carrinho');
  cy.get('[data-cy="carrinho-page"]').should('be.visible');
  cy.get('[data-cy="carrinho-finalizar-compra"]', { timeout: 10000 }).click({ force: true });
  cy.url().should('include', '/checkout');

  cy.get('[data-cy^="checkout-address-item-"]').first().click();
  cy.get('[data-cy="checkout-address-selected"]').should('be.visible');

  cy.get('[data-cy="checkout-freight-section"]').scrollIntoView().should('be.visible');
  cy.get('[data-cy="checkout-freight-zip-input"]').scrollIntoView().should('be.visible').clear().type(cep);
  cy.get('[data-cy="checkout-freight-calculate-button"]').click();
  cy.get('[data-cy="checkout-freight-options"]').should('be.visible');
  cy.get('[data-cy="checkout-freight-option-PAC"]').click();
  cy.get('[data-cy="checkout-freight-selected-info"]').should('be.visible');
}
