/**
 * E2E — Gap 11: Rejeitar Aprovação
 *
 * Cenários cobertos:
 * 1. POST rejeitar sem motivo → 400 (validação de corpo acontece antes do lookup de UUID)
 * 2. POST rejeitar com motivo → 200 se houver aprovação pendente, ou skip se lista vazia
 *
 * Nota: o endpoint PATCH /admin/livros/:uuid não cria registros na tabela de aprovações —
 * apenas bloqueia o update. Aprovações pendentes existem apenas via seed ou fluxo interno.
 */

import { loginApi, ADMIN } from '../../support/fluxo-venda.helpers';

describe('Rejeitar Aprovação — Gap 11', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';
  const UUID_FAKE = '00000000-0000-0000-0000-000000000001';

  it('Gap 11.1: POST rejeitar sem motivo retorna 400', () => {
    loginApi(ADMIN.email, ADMIN.senha).then((token) => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/admin/livros/aprovacoes-preco/${UUID_FAKE}/rejeitar`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
        },
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  it('Gap 11.2: POST rejeitar com motivo válido retorna 200 (se houver aprovação pendente)', () => {
    loginApi(ADMIN.email, ADMIN.senha).then((token) => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/admin/livros/aprovacoes-preco`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
        },
      }).then((listRes) => {
        const pendentes: Array<{ uuid: string }> = listRes.body.dados ?? [];

        if (pendentes.length === 0) {
          cy.log('Nenhuma aprovação pendente no banco — teste de rejeição pulado');
          return;
        }

        const aprovacaoUuid = pendentes[0].uuid;

        cy.request({
          method: 'POST',
          url: `${API_URL}/admin/livros/aprovacoes-preco/${aprovacaoUuid}/rejeitar`,
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          },
          body: { motivo: 'Preço abaixo do mínimo aceitável para a categoria' },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.have.property('sucesso', true);
        });
      });
    });
  });
});
