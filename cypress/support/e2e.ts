import './commands';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const installLogsCollector = require('cypress-terminal-report/src/installLogsCollector');
installLogsCollector();
// Documentação: Módulo não suporta ES6 import; investigar esModuleInterop em tsconfig.json ou Cypress config para possível correção.

Cypress.on('uncaught:exception', (err) => {
  console.error('[uncaught exception]', err.message);
  return true;
});

const COMMAND_DELAY = 400; // milissegundos

Cypress.on('command:end', () => {
  return new Promise((resolve) => {
    setTimeout(resolve, COMMAND_DELAY);
  });
});

// Configuração Global para Testes com Backend Real
// Mantém apenas o interceptor para injetar header x-use-test-db
// A responsabilidade de visualização de logs é delegada ao cypress-terminal-report
beforeEach(() => {
  cy.intercept('**', (req) => {
    const apiUrl = Cypress.env('apiUrl');
    if (apiUrl && req.url.includes(apiUrl)) {
      const forcarBancoTestes = Cypress.env('injectTestDbHeader') === true;
      if (forcarBancoTestes) {
        req.headers['x-use-test-db'] = 'true';
      }
    }
  });
});
