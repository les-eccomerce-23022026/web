/**
 * Utilitários compartilhados para testes E2E do painel admin
 */

export function apiHeadersAdmin(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const authToken = Cypress.env('authToken') as string | undefined;
  const headers: Record<string, string> = {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

export function apiHeadersCliente(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  const authToken = Cypress.env('authToken') as string | undefined;
  const headers: Record<string, string> = {
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}
