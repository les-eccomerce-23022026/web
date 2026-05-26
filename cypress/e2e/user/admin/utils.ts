/**
 * Utilitários compartilhados para testes E2E do painel admin
 */

export function apiHeadersAdmin(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

export function apiHeadersCliente(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}
