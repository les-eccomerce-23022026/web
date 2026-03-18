import './commands';

const COMMAND_DELAY = 400; // milissegundos

Cypress.on('command:end', () => {
  return new Promise((resolve) => {
    setTimeout(resolve, COMMAND_DELAY);
  });
});

// Configuração Global para Testes com Backend Real
beforeEach(() => {
  // Interceptação global: Injeta automaticamente o header do banco de testes em todas as requests para a API
  cy.intercept('**', (req) => {
    const apiUrl = Cypress.env('apiUrl');
    if (apiUrl && req.url.includes(apiUrl)) {
      req.headers['x-use-test-db'] = 'true';
    }
  });
});
