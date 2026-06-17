/**
 * E2E — Gap 9-10: Aprovações de Preço
 *
 * Cenários cobertos:
 * 1. GET /admin/livros/aprovacoes-preco com admin → 200 + array
 * 2. GET /admin/livros/aprovacoes-preco sem auth → 401
 */

import { loginApi, ADMIN } from '../../support/fluxo-venda.helpers';

describe('Aprovações de Preço — Gaps 9-10', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';

  it('Gap 9: GET /admin/livros/aprovacoes-preco com admin retorna 200', () => {
    loginApi(ADMIN.email, ADMIN.senha).then((token) => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/admin/livros/aprovacoes-preco`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('sucesso', true);
        expect(response.body.dados).to.be.an('array');
        if (response.body.dados.length > 0) {
          expect(response.body.dados[0]).to.have.property('uuid');
          expect(response.body.dados[0]).to.have.property('livroUuid');
          expect(response.body.dados[0]).to.have.property('status');
        }
      });
    });
  });

  it('Gap 10: GET /admin/livros/aprovacoes-preco sem auth retorna 401', () => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/admin/livros/aprovacoes-preco`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });
});
