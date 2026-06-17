/**
 * E2E — 7ª Entrega / Seção 7: Devolução (distinta de troca).
 * 7.1 devolução de item, 7.2 devolução do pedido completo, 7.3 fluxo completo
 * (solicitar → admin autoriza → admin confirma recebimento → cupom gerado).
 */
import {
  prepararPedidoEntregueApi,
  loginApi,
  loginAdminUi,
  loginClienteUi,
  CLIENTE,
  ADMIN,
} from '../../support/fluxo-venda.helpers';

function valorMonetario(texto: string): number {
  return Number.parseFloat(texto.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
}

describe('Devoluções — Fluxo de devolução (CDU009, RF0045, RF0046)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('7.1 deve permitir o cliente solicitar devolução de um item (status Em Devolução)', () => {
    /**
     * Fluxo (7.1 Cliente solicitar devolução de item):
     * 1. Cliente faz login
     * 2. Acessa pedido entregue
     * 3. Clica em "Solicitar devolução" (diferente de "Solicitar troca")
     * 4. Seleciona item para devolução
     * 5. Preenche motivo da devolução
     * 6. Clica em "Confirmar devolução"
     * 7. Sistema cria solicitação de devolução
     * 8. Sistema atualiza status para "Em Devolução"
     * 9. Admin recebe notificação
     */
    prepararPedidoEntregueApi().then(({ uuid }) => {
      loginClienteUi();
      cy.visit('/pedidos');

      cy.get(`[data-cy="btn-solicitar-troca-${uuid}"]`).scrollIntoView().click();
      cy.url().should('include', '/troca');

      // Seleciona devolução no radio
      cy.get('[data-cy="radio-devolucao"]').click();

      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
      cy.get('[data-cy="troca-motivo-input"]').clear().type('Produto com defeito de impressão');
      cy.get('[data-cy="btn-confirmar-troca"]').click();

      cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible').click();
      cy.get(`[data-cy="pedido-${uuid}"]`).within(() => {
        cy.get('[data-cy="pedido-status"]').should('contain.text', 'Devolução');
      });
    });
  });

  it('7.2 deve permitir o cliente solicitar devolução do pedido completo', () => {
    /**
     * Fluxo (7.2 Cliente solicitar devolução do pedido completo):
     * 1. Cliente faz login
     * 2. Acessa pedido entregue
     * 3. Clica em "Solicitar devolução completa"
     * 4. Sistema seleciona todos os itens do pedido
     * 5. Cliente confirma devolução completa
     * 6. Preenche motivo
     * 7. Sistema cria solicitação de devolução completa
     * 8. Sistema atualiza status para "Em Devolução"
     */
    prepararPedidoEntregueApi().then(({ uuid }) => {
      loginClienteUi();
      cy.visit('/pedidos');

      cy.get(`[data-cy="btn-solicitar-troca-${uuid}"]`).scrollIntoView().click();
      cy.url().should('include', '/troca');

      // Seleciona devolução no radio
      cy.get('[data-cy="radio-devolucao"]').click();

      // Seleciona todos os itens (devolução completa)
      cy.get('[data-cy="btn-selecionar-todos"]').click();
      cy.get('[data-cy="troca-motivo-input"]').clear().type('Não era o que eu esperava — devolução completa');
      cy.get('[data-cy="btn-confirmar-troca"]').click();

      cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible').click();
      cy.get(`[data-cy="pedido-${uuid}"]`).within(() => {
        cy.get('[data-cy="pedido-status"]').should('contain', 'Em Devolução');
      });
    });
  });

  it('7.3 deve completar o fluxo de devolução e gerar cupom para o cliente', () => {
    /**
     * Fluxo (7.3 Fluxo completo de devolução):
     * 1. Cliente solicita devolução (item ou completo)
     * 2. Admin recebe solicitação
     * 3. Admin aprova devolução
     * 4. Cliente envia produto de volta
     * 5. Admin confirma recebimento do produto devolvido
     * 6. Sistema gera cupom de devolução (sem troca)
     * 7. Cliente recebe cupom para uso futuro
     * 8. Produto retorna ao estoque
     */
    prepararPedidoEntregueApi().then(({ uuid }) => {
      // Cliente solicita devolução (UI)
      loginClienteUi();
      cy.visit('/pedidos');
      cy.get(`[data-cy="btn-solicitar-troca-${uuid}"]`).scrollIntoView().click();
      cy.get('[data-cy="radio-devolucao"]').click();
      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
      cy.get('[data-cy="troca-motivo-input"]').clear().type('Defeito');
      cy.get('[data-cy="btn-confirmar-troca"]').click();
      cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible');

      // Admin autoriza e confirma recebimento via API (gera cupom)
      loginApi(ADMIN.email, ADMIN.senha).then((adminToken) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/admin/pedidos/${uuid}/autorizar-devolucao`,
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-loja-uuid': '82c0a24c-4cf4-4b12-823a-f1a8b9a086c3'
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
        
        // Confirmar recebimento via API
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/admin/pedidos/${uuid}/confirmar-recebimento-devolucao`,
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-loja-uuid': '82c0a24c-4cf4-4b12-823a-f1a8b9a086c3'
          },
          body: { retornarEstoque: true }
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });

      // Cliente recebe um cupom de devolução com valor > 0
      cy.clearCookies();
      cy.clearLocalStorage();
      loginClienteUi();
      cy.visit('/minha-conta');
      cy.get('[data-cy="tab-cupons"]').click();
      cy.get('[data-cy^="cupom-"]').first().within(() => {
        cy.get('[data-cy^="cupom-valor-"]').invoke('text').then((t) => {
          expect(valorMonetario(t)).to.be.greaterThan(0);
        });
        cy.get('[data-cy^="cupom-"]').invoke('attr', 'data-cy').then((attr) => {
          expect(attr).to.match(/(TROCA|DEV)-[A-Z0-9]+/);
        });
      });
    });
  });
});
