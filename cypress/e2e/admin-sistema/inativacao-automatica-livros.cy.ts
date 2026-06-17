/**
 * E2E — Gap 7-8: Inativação Automática de Livros
 *
 * Cenários cobertos:
 * 1. POST /admin/livros/inativacao-automatica com admin → 200 + relatório
 * 2. POST /admin/livros/inativacao-automatica sem auth → 401
 */

import { loginApi, ADMIN } from '../../support/fluxo-venda.helpers';

describe('Inativação Automática de Livros — Gaps 7-8', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';

  it('Gap 7: POST /admin/livros/inativacao-automatica com admin retorna 200', () => {
    loginApi(ADMIN.email, ADMIN.senha).then((token) => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/admin/livros/inativacao-automatica`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('sucesso', true);
        expect(response.body.dados).to.have.property('totalVerificados');
        expect(response.body.dados).to.have.property('totalInativados');
        expect(response.body.dados).to.have.property('valorMinimoUtilizado');
        expect(response.body.dados).to.have.property('livrosInativados');
      });
    });
  });

  it('Gap 8: POST /admin/livros/inativacao-automatica sem auth retorna 401', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/admin/livros/inativacao-automatica`,
      headers: {
        'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });
});
