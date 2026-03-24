import './commands';

const COMMAND_DELAY = 400; // milissegundos

Cypress.on('command:end', () => {
  return new Promise((resolve) => {
    setTimeout(resolve, COMMAND_DELAY);
  });
});

interface ITestRequest {
  request: { method: string; url: string; body: unknown; query: unknown };
  response: { statusCode: number; body: unknown };
}

let testRequests: ITestRequest[] = [];

// Configuração Global para Testes com Backend Real
beforeEach(() => {
  testRequests = [];
  // Interceptação global: Injeta automaticamente o header do banco de testes em todas as requests para a API
  cy.intercept('**', (req) => {
    const apiUrl = Cypress.env('apiUrl');
    if (apiUrl && req.url.includes(apiUrl)) {
      req.headers['x-use-test-db'] = 'true';

      const requestData = {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
      };

      req.on('response', (res) => {
        testRequests.push({
          request: requestData,
          response: {
            statusCode: res.statusCode,
            body: res.body,
          }
        });
      });
    }
  });
});

afterEach(function() {
  if (this.currentTest?.state === 'failed') {
    cy.log('**TEST FAILED: PRINTING API REQUESTS TO TERMINAL AND CONSOLE**');
    cy.task('log', '====================================================');
    cy.task('log', `TEST FAILED: ${this.currentTest.title}`);
    cy.task('log', 'API REQUESTS MADE DURING TEST:');
    
    testRequests.forEach((reqLog, index) => {
      cy.task('log', `\n--- Request #${index + 1} ---`);
      cy.task('log', `URL: [${reqLog.request.method}] ${reqLog.request.url}`);
      cy.task('log', `Payload/Params Sent: ${JSON.stringify(reqLog.request.body || reqLog.request.query, null, 2)}`);
      cy.task('log', `Response Status: ${reqLog.response.statusCode}`);
      cy.task('log', `Response Data Received: ${JSON.stringify(reqLog.response.body, null, 2)}`);
    });
    cy.task('log', '====================================================');
  }
});
