import './commands';
const installLogsCollector = require('cypress-terminal-report/src/installLogsCollector');
installLogsCollector();

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

interface ITestRequest {
  request: { method: string; url: string; body: unknown; query: unknown };
  response: { statusCode: number; body: unknown };
}

let testRequests: ITestRequest[] = [];

// Configuração Global para Testes com Backend Real
beforeEach(() => {
  testRequests = [];
  // Interceptação global: Injeta header se necessário e sempre coleta logs
  cy.intercept('**', (req) => {
    const apiUrl = Cypress.env('apiUrl');
    if (apiUrl && req.url.includes(apiUrl)) {
      const forcarBancoTestes = Cypress.env('injectTestDbHeader') === true;
      if (forcarBancoTestes) {
        req.headers['x-use-test-db'] = 'true';
      }

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
  const state = this.currentTest?.state;
  const title = this.currentTest?.title;

  if (state === 'failed') {
    cy.log('**TEST FAILED: PRINTING API REQUESTS TO TERMINAL AND CONSOLE**');
  } else {
    cy.log('**TEST PASSED: PRINTING API SUMMARY**');
  }

  cy.task('log', '====================================================');
  cy.task('log', `TEST ${state?.toUpperCase()}: ${title}`);
  cy.task('log', `API REQUESTS MADE DURING TEST (${testRequests.length}):`);
  
  testRequests.forEach((reqLog, index) => {
    cy.task('log', `\n--- Request #${index + 1} ---`);
    cy.task('log', `URL: [${reqLog.request.method}] ${reqLog.request.url}`);
    
    const payload = reqLog.request.body || reqLog.request.query;
    const payloadStr = JSON.stringify(payload);
    cy.task('log', `Payload Sent: ${payloadStr && payloadStr.length > 300 ? payloadStr.substring(0, 300) + '...' : JSON.stringify(payload, null, 2)}`);
    
    cy.task('log', `Response Status: ${reqLog.response.statusCode}`);
    
    const resBody = reqLog.response.body;
    const resCount = Array.isArray(resBody) ? resBody.length : (resBody ? 1 : 0);
    cy.task('log', `Response Count: ${resCount}`);
    
    const resStr = JSON.stringify(resBody);
    if (resStr && resStr.length > 300) {
      cy.task('log', `Response Data (truncated): ${resStr.substring(0, 300)}...`);
    } else {
      cy.task('log', `Response Data: ${resStr}`);
    }
  });
  cy.task('log', '====================================================');
});
