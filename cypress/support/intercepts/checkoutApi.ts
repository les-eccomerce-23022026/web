/**
 * Intercepts pass-through (sem mock) só para nomear rotas no painel do Cypress e usar cy.wait('@alias').
 * Deve ser chamado no início do beforeEach do spec, antes de visit/cliques que disparem essas rotas.
 *
 * `pagamento/info` usa padrão glob (qualquer host) terminando em `pagamento/info`: o browser pode
 * chamar a mesma rota com origem/proxy diferente do `apiUrl` do Cypress — alias estrito em URL
 * completa gerava wait sem match.
 * Verbose: `--env e2eVerboseCheckout=true`.
 */
export function registerCheckoutApiAliases(): void {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  const verbose = Cypress.env('e2eVerboseCheckout') === true;

  cy.intercept('GET', '**/pagamento/info', (req) => {
    if (verbose) console.log('[e2e] intercept pagamento/info req →', req.url);
    req.continue((res) => {
      const body = res.body as { cartoesCliente?: unknown[]; enderecosCliente?: unknown[] } | undefined;
      const qtdCartoes = Array.isArray(body?.cartoesCliente) ? body.cartoesCliente.length : 0;
      const qtdEnderecos = Array.isArray(body?.enderecosCliente) ? body.enderecosCliente.length : 0;
      if (verbose) {
        console.log(
          '[e2e] intercept pagamento/info res ←',
          res.statusCode,
          `cartoes=${qtdCartoes}`,
          `enderecos=${qtdEnderecos}`,
          req.url,
        );
      }
      if (res.statusCode !== 200) {
        console.warn('[e2e:lock] GET pagamento/info falhou:', res.statusCode, JSON.stringify(body));
      }
    });
  }).as('pagamentoInfo');

  cy.intercept('POST', `${apiUrl}/carrinho/itens`).as('carrinhoAdicionarItem');
  /** Path-only match: evita falha quando URL absoluta/query diverge do `apiUrl` literal (mesmo motivo do glob em pagamento/info). */
  cy.intercept('GET', /\/api\/carrinho(\?[^#]*)?$/).as('carrinhoGet');
}
