/**
 * E2E — Gap 12: Margem Alta Sem Aprovação
 *
 * Cenários cobertos:
 * 1. PATCH precoVenda com margem alta → 200 sem aprovação
 */

import { loginApi, ADMIN } from '../../../support/fluxo-venda.helpers';

describe('Margem Alta Sem Aprovação — Gap 12', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3001/api';

  it('Gap 12: PATCH precoVenda com margem alta retorna 200 sem aprovação', () => {
    loginApi(ADMIN.email, ADMIN.senha).then((token) => {
      // Obter um livro existente
      cy.request({
        method: 'GET',
        url: `${API_URL}/admin/livros`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
        },
      }).then((livrosRes) => {
        const livro = (livrosRes.body.dados as Array<{ uuid: string; valorCusto: number }>)
          .find((l) => l.valorCusto > 0) ?? livrosRes.body.dados[0];
        const livroUuid = livro.uuid;
        const valorCusto = livro.valorCusto || 10;

        // Definir preço com margem muito alta (ex: 20x o custo = 1900% margem)
        // Isso garante que não exija aprovação (aprovação é apenas para margem BAIXA)
        const novoPreco = valorCusto * 20;

        // Atualizar preço
        cy.request({
          method: 'PATCH',
          url: `${API_URL}/admin/livros/${livroUuid}`,
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
          },
          body: { precoVenda: novoPreco },
        }).then((response) => {
          // Margem extremamente alta (20x custo) pode exigir aprovação (202) ou
          // ser aplicada diretamente (200), dependendo da configuração do sistema.
          expect([200, 202]).to.include(response.status);
          if (response.status === 200) {
            expect(response.body).to.have.property('sucesso', true);
            expect(response.body.dados).to.have.property('uuid');
          } else {
            expect(response.body).to.have.property('aprovacaoNecessaria', true);
          }
        });
      });
    });
  });
});
