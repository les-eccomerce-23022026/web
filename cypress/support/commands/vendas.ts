// Comandos de vendas, trocas e entregas Cypress

import { getApiUrl, getTestDbHeaders } from './utils';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Comandos para testes de admin - fluxo de despacho e entrega */
      criarVendaAprovadaViaApi(): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      despacharPedidoViaApi(vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }): Chainable<void>;
      confirmarEntregaViaApi(vendaUuid: string, opts?: { restaurarSessao?: 'cliente' | 'admin' | false }): Chainable<void>;
      marcarFalhaEntregaViaApi(vendaUuid: string, motivo: string): Chainable<void>;
      solicitarTrocaViaApi(vendaUuid: string, itemVendaUuid: string, motivo: string): Chainable<void>;
      autorizarTrocaViaApi(vendaUuid: string): Chainable<void>;
      confirmarRecebimentoTrocaViaApi(vendaUuid: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('criarVendaAprovadaViaApi', () => {
  const apiUrl = getApiUrl();
  
  return cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
    return cy.criarCarrinhoViaApi([{ livroUuid, quantidade: 1 }]).then(() => {
      return cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: getTestDbHeaders(),
        body: {
          enderecoUuid: Cypress.env('enderecoTesteUuid'),
          cartaoUuid: Cypress.env('cartaoTesteUuid'),
        },
      }).then((response) => {
        const vendaUuid = response.body?.venda_uuid;
        const itemVendaUuid = response.body?.itens?.[0]?.item_venda_uuid;
        return { vendaUuid, itemVendaUuid };
      });
    });
  });
});

Cypress.Commands.add('despacharPedidoViaApi', (vendaUuid, opts = {}) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
    headers: getTestDbHeaders(),
  }).then(() => {
    if (opts.restaurarSessao) {
      if (opts.restaurarSessao === 'cliente') {
        cy.autenticarClienteDadosTeste();
      } else if (opts.restaurarSessao === 'admin') {
        cy.autenticarAdministradorViaApi();
      }
    }
  });
});

Cypress.Commands.add('confirmarEntregaViaApi', (vendaUuid, opts = {}) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/vendas/${vendaUuid}/confirmar-entrega`,
    headers: getTestDbHeaders(),
  }).then(() => {
    if (opts.restaurarSessao) {
      if (opts.restaurarSessao === 'cliente') {
        cy.autenticarClienteDadosTeste();
      } else if (opts.restaurarSessao === 'admin') {
        cy.autenticarAdministradorViaApi();
      }
    }
  });
});

Cypress.Commands.add('marcarFalhaEntregaViaApi', (vendaUuid, motivo) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'PATCH',
    url: `${apiUrl}/vendas/${vendaUuid}/falha-entrega`,
    headers: getTestDbHeaders(),
    body: { motivo },
  });
});

Cypress.Commands.add('solicitarTrocaViaApi', (vendaUuid, itemVendaUuid, motivo) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/vendas/${vendaUuid}/troca`,
    headers: getTestDbHeaders(),
    body: {
      itemVendaUuid,
      motivo,
    },
  });
});

Cypress.Commands.add('autorizarTrocaViaApi', (vendaUuid) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/vendas/${vendaUuid}/troca/autorizar`,
    headers: getTestDbHeaders(),
  });
});

Cypress.Commands.add('confirmarRecebimentoTrocaViaApi', (vendaUuid) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'PUT',
    url: `${apiUrl}/vendas/${vendaUuid}/troca/confirmar-recebimento`,
    headers: getTestDbHeaders(),
  });
});
