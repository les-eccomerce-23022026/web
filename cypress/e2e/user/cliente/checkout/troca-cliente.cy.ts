/**
 * Testes E2E — Trocas e Devoluções (cliente)
 * Sprint 2: S2-A e S2-D
 *
 * S2-A: Solicitar troca de item e acompanhar status
 * S2-D: Prazo de arrependimento — impossível solicitar após 7 dias da entrega (RN0043)
 *
 * Estratégia: loginProgramatico registra um cliente real no banco de testes,
 * mas GET /api/minhas-vendas é interceptado para fornecer um pedido no status
 * ENTREGUE sem depender de um fluxo de checkout completo.
 */

const PEDIDO_UUID = 'aabbcc00-1234-5678-abcd-ef0123456789';
const ITEM_UUID = 'item0000-0001-0001-0001-000000000001';
const MOTIVO_VALIDO = 'Livro chegou com páginas danificadas, impossível de ler.';

describe('Trocas — fluxo do cliente', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', `${apiUrl}/minhas-vendas`, {
      fixture: 'trocas/pedido-entregue.json',
    }).as('minhasVendas');
  });

  // ---------------------------------------------------------------------------
  // S2-A: Solicitar troca
  // ---------------------------------------------------------------------------
  describe('S2-A — Solicitar troca de item', () => {
    it('exibe o botão "Solicitar troca" apenas para pedidos com status Entregue', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');

      cy.get(`[data-cy="pedido-${PEDIDO_UUID}"]`).within(() => {
        cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).should('be.visible');
      });
    });

    it('navega para o formulário de troca ao clicar no botão', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');

      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();
      cy.url().should('include', `/pedidos/${PEDIDO_UUID}/troca`);
    });

    it('exibe os itens do pedido para seleção', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      cy.get('[data-cy="troca-itens-lista"]').should('be.visible');
      cy.get(`[data-cy="troca-item-${ITEM_UUID}"]`).should('be.visible');
    });

    it('mantém o botão desabilitado quando nenhum item está selecionado (RN0041)', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      // Com motivo válido mas sem item selecionado, o botão permanece desabilitado
      cy.get('[data-cy="troca-motivo"]').type(MOTIVO_VALIDO);
      cy.get('[data-cy="btn-confirmar-troca"]').should('be.disabled');
    });

    it('mantém o botão desabilitado quando o motivo tem menos de 10 caracteres (RN0041)', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      // Item selecionado, mas motivo muito curto → botão desabilitado
      cy.get(`[data-cy="troca-item-${ITEM_UUID}"]`).click();
      cy.get('[data-cy="troca-motivo"]').type('Curto');
      cy.get('[data-cy="btn-confirmar-troca"]').should('be.disabled');
    });

    it('envia a solicitação e exibe confirmação de sucesso (RN0041)', () => {
      cy.intercept('POST', `${apiUrl}/vendas/${PEDIDO_UUID}/troca`, {
        statusCode: 200,
        fixture: 'trocas/pedido-em-troca-resposta.json',
      }).as('solicitarTroca');

      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      cy.get(`[data-cy="troca-item-${ITEM_UUID}"]`).click();
      cy.get('[data-cy="troca-motivo"]').type(MOTIVO_VALIDO);
      cy.get('[data-cy="btn-confirmar-troca"]').click();

      cy.wait('@solicitarTroca').its('request.body').should((body) => {
        expect(body.motivo).to.equal(MOTIVO_VALIDO);
        expect(body.itensUuids).to.deep.equal([ITEM_UUID]);
      });

      cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible');
    });

    it('exibe botão "Cancelar" que retorna à lista de pedidos sem enviar', () => {
      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      cy.get('[data-cy="btn-cancelar-troca"]').click();
      cy.url().should('include', '/pedidos');
    });
  });

  // ---------------------------------------------------------------------------
  // S2-D: Prazo de 7 dias (RN0043) — feedback de erro vindo do backend
  // ---------------------------------------------------------------------------
  describe('S2-D — Prazo de 7 dias expirado (RN0043)', () => {
    it('exibe mensagem de erro quando o backend rejeita por prazo expirado', () => {
      cy.intercept('POST', `${apiUrl}/vendas/${PEDIDO_UUID}/troca`, {
        statusCode: 422,
        body: { mensagem: 'Prazo de 7 dias para troca expirado' },
      }).as('trocaExpirada');

      cy.visit('/pedidos');
      cy.wait('@minhasVendas');
      cy.get(`[data-cy="btn-solicitar-troca-${PEDIDO_UUID}"]`).click();

      cy.get(`[data-cy="troca-item-${ITEM_UUID}"]`).click();
      cy.get('[data-cy="troca-motivo"]').type(MOTIVO_VALIDO);
      cy.get('[data-cy="btn-confirmar-troca"]').click();

      cy.wait('@trocaExpirada');
      cy.get('[data-cy="troca-erro"]').should('be.visible')
        .and('contain', 'Erro ao solicitar troca');
    });
  });
});
