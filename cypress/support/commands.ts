// Comandos customizados Cypress para testes E2E do e-commerce de livros
// Versão simplificada para testes de venda completa (7ª entrega)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      autenticarClienteViaApi(): Chainable<void>;
      autenticarAdministradorViaApi(): Chainable<void>;
      autenticarAdminLojaA(): Chainable<void>;
      autenticarAdminLojaB(): Chainable<void>;
      logout(): Chainable<void>;
      obterLojasViaApi(): Chainable<any[]>;
      criarAmbienteMultiLoja(): Chainable<void>;
      autorizarTrocaViaApi(vendaUuid: string): Chainable<any>;
    }
  }
}

// Helpers
function getApiUrl(): string {
  return Cypress.env('apiUrl') || 'http://localhost:3001/api';
}

function getTestDbHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (Cypress.env('injectTestDbHeader') === true) {
    headers['x-use-test-db'] = 'true';
  }
  return headers;
}

// Comando para autenticar cliente via API
Cypress.Commands.add('autenticarClienteViaApi', () => {
  const apiUrl = getApiUrl();
  const email = Cypress.env('cliente')?.email || 'clientetest@email.com';
  const senha = Cypress.env('cliente')?.senha || '123456';

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: {
      'Content-Type': 'application/json',
      ...getTestDbHeaders(),
    },
    body: { email, senha },
  }).then((response) => {
    const token = response.body.dados?.token;
    if (token) {
      cy.setCookie('authToken', token);
      Cypress.env('authToken', token);
    }
  });
});

// Comando para autenticar administrador via API
Cypress.Commands.add('autenticarAdministradorViaApi', () => {
  const apiUrl = getApiUrl();
  const email = Cypress.env('admin')?.email || 'admin@vendas.com.br';
  const senha = Cypress.env('admin')?.senha || '123456';

  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: {
      'Content-Type': 'application/json',
      ...getTestDbHeaders(),
    },
    body: { email, senha },
  }).then((response) => {
    const token = response.body.dados?.token;
    if (token) {
      cy.setCookie('authToken', token);
      Cypress.env('authToken', token);
    }
  });
});

// Comando para autenticar admin da Loja A
Cypress.Commands.add('autenticarAdminLojaA', () => {
  const apiUrl = getApiUrl();
  
  // Primeiro obter token admin
  cy.autenticarAdministradorViaApi().then(() => {
    const token = Cypress.env('authToken');
    
    // Obter lojas
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...getTestDbHeaders(),
      },
    });
  }).then((res) => {
    const lojaA = res.body.dados?.find((l: any) => l.slug === 'loja-a-multi-tenancy') || res.body.dados?.[0];
    
    if (!lojaA) {
      throw new Error('Loja A não encontrada');
    }
    
    // Definir cookie de loja
    cy.setCookie('x-loja-uuid', lojaA.uuid);
    cy.setCookie('x-use-test-db', 'true');
  });
});

// Comando para autenticar admin da Loja B
Cypress.Commands.add('autenticarAdminLojaB', () => {
  const apiUrl = getApiUrl();
  
  // Primeiro obter token admin
  cy.autenticarAdministradorViaApi().then(() => {
    const token = Cypress.env('authToken');
    
    // Obter lojas
    return cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/lojas`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...getTestDbHeaders(),
      },
    });
  }).then((res) => {
    const lojaB = res.body.dados?.find((l: any) => l.slug === 'loja-b-multi-tenancy') || res.body.dados?.[1];
    
    if (!lojaB) {
      throw new Error('Loja B não encontrada');
    }
    
    // Definir cookie de loja
    cy.setCookie('x-loja-uuid', lojaB.uuid);
    cy.setCookie('x-use-test-db', 'true');
  });
});

// Comando para logout
Cypress.Commands.add('logout', () => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/logout`,
    headers: getTestDbHeaders(),
    failOnStatusCode: false,
  }).then(() => {
    cy.clearAllSessionStorage();
    cy.clearCookie('authToken');
    cy.clearCookie('x-loja-uuid');
    cy.clearCookie('x-use-test-db');
    Cypress.env('authToken', undefined);
    cy.visit('/');
  });
});

// Comando para obter lojas via API
Cypress.Commands.add('obterLojasViaApi', () => {
  const apiUrl = getApiUrl();
  const token = Cypress.env('authToken');
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/admin/lojas`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...getTestDbHeaders(),
    },
  }).then((response) => {
    return response.body.dados || [];
  });
});

// Comando para criar ambiente multi-loja
Cypress.Commands.add('criarAmbienteMultiLoja', () => {
  const apiUrl = getApiUrl();
  const headers = getTestDbHeaders();
  
  // Tenta executar bootstrap para criar lojas de teste
  cy.request({
    method: 'POST',
    url: `${apiUrl}/admin/bootstrap`,
    headers: {
      ...headers,
      'x-test-bootstrap-key': Cypress.env('testBootstrapKey') || 'test-key-123',
    },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status !== 200 && res.status !== 201) {
      cy.log('[criarAmbienteMultiLoja] Bootstrap não executado. Assumindo seed SQL já criou lojas.');
    }
  });
});

// Comando para autorizar troca via API
Cypress.Commands.add('autorizarTrocaViaApi', (vendaUuid: string) => {
  const apiUrl = getApiUrl();
  const token = Cypress.env('authToken');
  
  return cy.request({
    method: 'PATCH',
    url: `${apiUrl}/admin/pedidos/${vendaUuid}/autorizar-troca`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...getTestDbHeaders(),
    },
  });
});

export {};
