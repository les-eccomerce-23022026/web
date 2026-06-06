// Comandos de carrinho Cypress

import { getApiUrl, getTestDbHeaders } from './utils';

declare global {
  namespace Cypress {
    interface Chainable {
      criarCarrinhoViaApi(items: { livroUuid: string; quantidade: number }[]): Chainable<void>;
      adicionarAoCarrinhoViaApi(livroUuid: string, quantidade?: number): Chainable<void>;
      limparCarrinhoViaApi(): Chainable<void>;
      /** Catálogo → detalhe do 1º livro → Comprar Agora (data-cy de detalhe). */
      adicionarPrimeiroLivroCarrinhoDetalhe(): Chainable<void>;
      /** Primeiro livro do catálogo público GET /livros (dados reais do banco). */
      obterPrimeiroLivroCatalogo(): Chainable<string>;
    }
  }
}

Cypress.Commands.add('criarCarrinhoViaApi', (items) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/carrinho`,
    headers: getTestDbHeaders(),
    body: { itens: items },
  });
});

Cypress.Commands.add('adicionarAoCarrinhoViaApi', (livroUuid, quantidade = 1) => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/carrinho/itens`,
    headers: getTestDbHeaders(),
    body: { livroUuid, quantidade },
  });
});

Cypress.Commands.add('limparCarrinhoViaApi', () => {
  const apiUrl = getApiUrl();
  
  cy.request({
    method: 'DELETE',
    url: `${apiUrl}/carrinho`,
    headers: getTestDbHeaders(),
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('adicionarPrimeiroLivroCarrinhoDetalhe', () => {
  cy.visit('/');
  cy.get('[data-cy="livro-card"]').first().contains('Ver Detalhes').click();
  cy.get('[data-cy="detalhe-livro-comprar-agora"]').click();
});

Cypress.Commands.add('obterPrimeiroLivroCatalogo', () => {
  const apiUrl = getApiUrl();
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/livros`,
    headers: getTestDbHeaders(),
  }).then((response) => {
    const livros = response.body?.livros || [];
    if (livros.length === 0) {
      throw new Error('Nenhum livro encontrado no catálogo');
    }
    return livros[0].livro_uuid;
  });
});
