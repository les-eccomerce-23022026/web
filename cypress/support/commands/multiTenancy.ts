// Comandos de multi-tenancy Cypress

import { getApiUrl, getAdminCredentials, getAdminLojaACredentials, getAdminLojaBCredentials, getTestDbHeaders } from './utils';
import { aplicarSessaoAuthCompletaNoBrowser, extrairTokenJwtLoginResponse, limparSessaoAuthBrowser } from '../helpers/checkoutHelpers';

declare global {
  namespace Cypress {
    interface Chainable {
      /** Comandos para testes de multi-tenancy por loja */
      obterLojaPadraoUuid(): Chainable<string>;
      criarAmbienteMultiLoja(): Chainable<void>;
      autenticarAdminLojaA(): Chainable<void>;
      autenticarAdminLojaB(): Chainable<void>;
      autenticarAdminMultiLoja(): Chainable<void>;
      criarVendaLojaA(livroUuid: string): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
      criarVendaLojaB(livroUuid: string): Chainable<{ vendaUuid: string; itemVendaUuid: string }>;
    }
  }
}

Cypress.Commands.add('obterLojaPadraoUuid', () => {
  const lojaPadraoUuid = Cypress.env('lojaPadraoUuid') as string;
  if (lojaPadraoUuid) {
    return cy.wrap(lojaPadraoUuid);
  }
  
  const apiUrl = getApiUrl();
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/lojas`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const lojas = response.body?.lojas || [];
    if (lojas.length === 0) {
      throw new Error('Nenhuma loja encontrada');
    }
    return lojas[0].loja_uuid;
  });
});

Cypress.Commands.add('criarAmbienteMultiLoja', () => {
  // Este comando prepara o ambiente para testes de multi-tenancy
  // Criando lojas A e B se não existirem
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'GET',
    url: `${apiUrl}/lojas`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const lojas = response.body?.lojas || [];
    if (lojas.length < 2) {
      cy.log('Ambiente multi-loja não configurado. Execute o seed de lojas.');
    }
  });
});

Cypress.Commands.add('autenticarAdminLojaA', () => {
  const apiUrl = getApiUrl();
  const { email, senha } = getAdminLojaACredentials();
  
  limparSessaoAuthBrowser();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: getTestDbHeaders(),
    body: { email, senha },
  }).then((response) => {
    const token = extrairTokenJwtLoginResponse(response);
    const user = response.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
    
    // Definir cookie x-loja-uuid para Loja A
    cy.obterLojaPadraoUuid().then((lojaUuid) => {
      cy.setCookie('x-loja-uuid', lojaUuid);
    });
  });
});

Cypress.Commands.add('autenticarAdminLojaB', () => {
  const apiUrl = getApiUrl();
  const { email, senha } = getAdminLojaBCredentials();
  
  limparSessaoAuthBrowser();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: getTestDbHeaders(),
    body: { email, senha },
  }).then((response) => {
    const token = extrairTokenJwtLoginResponse(response);
    const user = response.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
    
    // Definir cookie x-loja-uuid para Loja B
    cy.request({
      method: 'GET',
      url: `${apiUrl}/lojas`,
      headers: getTestDbHeaders(),
    }).then((response) => {
      const lojas = response.body?.lojas || [];
      if (lojas.length >= 2) {
        cy.setCookie('x-loja-uuid', lojas[1].loja_uuid);
      }
    });
  });
});

Cypress.Commands.add('autenticarAdminMultiLoja', () => {
  // Autentica um admin que tem acesso a múltiplas lojas
  const apiUrl = getApiUrl();
  const { email, senha } = getAdminCredentials();
  
  limparSessaoAuthBrowser();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    headers: getTestDbHeaders(),
    body: { email, senha },
  }).then((response) => {
    const token = extrairTokenJwtLoginResponse(response);
    const user = response.body?.dados?.user;
    aplicarSessaoAuthCompletaNoBrowser(user, token);
  });
});

Cypress.Commands.add('criarVendaLojaA', (livroUuid) => {
  const apiUrl = getApiUrl();
  
  return cy.obterLojaPadraoUuid().then((lojaUuid) => {
    cy.setCookie('x-loja-uuid', lojaUuid);
    
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

Cypress.Commands.add('criarVendaLojaB', (livroUuid) => {
  const apiUrl = getApiUrl();
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/lojas`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const lojas = response.body?.lojas || [];
    if (lojas.length < 2) {
      throw new Error('Ambiente multi-loja não configurado');
    }
    const lojaBUuid = lojas[1].loja_uuid;
    cy.setCookie('x-loja-uuid', lojaBUuid);
    
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
