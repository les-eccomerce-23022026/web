/**
 * Intercepts pass-through (sem mock) só para nomear rotas no painel do Cypress e usar cy.wait('@alias').
 * Deve ser chamado no início do beforeEach do spec, antes de visit/cliques que disparem essas rotas.
 */
export function registerCheckoutApiAliases(): void {
  const apiUrl = (Cypress.env('apiUrl') as string) || 'http://localhost:5173/api';
  cy.intercept('GET', `${apiUrl}/pagamento/info`).as('pagamentoInfo');
  cy.intercept('POST', `${apiUrl}/carrinho/itens`).as('carrinhoAdicionarItem');
  cy.intercept('GET', `${apiUrl}/carrinho`).as('carrinhoGet');
}
