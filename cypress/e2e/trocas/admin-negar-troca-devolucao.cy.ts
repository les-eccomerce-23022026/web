/**
 * E2E — 7ª Entrega / Seção 6: Admin nega troca/devolução.
 *
 * Setup idempotente via API: cria pedido entregue, o cliente solicita
 * troca/devolução desse pedido específico; o admin rejeita pela UI informando
 * o motivo; o cliente verifica o status e o motivo da rejeição.
 */
import {
  prepararPedidoEntregueApi,
  loginApi,
  solicitarTrocaApi,
  solicitarDevolucaoApi,
  loginAdminUi,
  loginClienteUi,
  CLIENTE,
} from '../../support/fluxo-venda.helpers';

describe('Pós-venda — Admin nega troca/devolução (CDU008, RF0043, RF0047)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('6.1 deve permitir admin rejeitar a solicitação de troca informando o motivo', () => {
    /**
     * Fluxo (6.1 Admin rejeitar solicitação de troca):
     * 1. Cliente solicita troca de item
     * 2. Admin faz login
     * 3. Navega para painel de trocas
     * 4. Encontra solicitação com status "Em Troca"
     * 5. Clica em "Rejeitar troca"
     * 6. Sistema solicita motivo da rejeição
     * 7. Admin preenche motivo (ex: "Fora do prazo de 7 dias")
     * 8. Sistema atualiza status para "Troca Rejeitada"
     * 9. Sistema notifica cliente sobre rejeição
     * 10. Cliente acessa Meus Pedidos
     * 11. Verifica que solicitação aparece como rejeitada
     * 12. Verifica que motivo da rejeição é exibido
     */
    prepararPedidoEntregueApi().then(({ uuid, itemUuid }) => {
      loginApi(CLIENTE.email, CLIENTE.senha).then((tokenCliente) => {
        solicitarTrocaApi(tokenCliente, uuid, [itemUuid], 'Capa danificada');
        cy.clearCookies();
        cy.clearLocalStorage();
      });

      // Admin rejeita a troca
      loginAdminUi();
      cy.visit('/admin/trocas');
      cy.get('[data-cy="trocas-painel"]').should('be.visible');

      cy.get(`[data-cy="admin-troca-${uuid}"]`).should('exist');
      cy.get(`[data-cy="btn-rejeitar-troca-${uuid}"]`).scrollIntoView().click();

      cy.get('[data-cy="troca-motivo-rejeicao"]').should('be.visible').type('Fora do prazo de 7 dias');
      cy.get('[data-cy="btn-confirmar-rejeicao"]').click();

      // Cliente vê a troca rejeitada com o motivo
      cy.clearCookies();
      cy.clearLocalStorage();
      loginClienteUi();
      cy.visit('/pedidos');
      cy.get(`[data-cy="pedido-${uuid}"]`).within(() => {
        cy.get('[data-cy="pedido-status"]').should('contain.text', 'Troca Rejeitada');
      });
    });
  });

  it('6.2 deve permitir admin rejeitar a solicitação de devolução informando o motivo', () => {
    /**
     * Fluxo (6.2 Admin rejeitar solicitação de devolução):
     * 1. Cliente solicita devolução de item
     * 2. Admin faz login
     * 3. Navega para painel de trocas/devoluções
     * 4. Encontra solicitação com status "Em Devolução"
     * 5. Clica em "Rejeitar devolução"
     * 6. Sistema solicita motivo da rejeição
     * 7. Admin preenche motivo
     * 8. Sistema atualiza status para "Devolução Rejeitada"
     * 9. Sistema notifica cliente sobre rejeição
     * 10. Cliente verifica status atualizado
     */
    prepararPedidoEntregueApi().then(({ uuid, itemUuid }) => {
      loginApi(CLIENTE.email, CLIENTE.senha).then((tokenCliente) => {
        solicitarDevolucaoApi(tokenCliente, uuid, [itemUuid], 'Desisti da compra');
        cy.clearCookies();
        cy.clearLocalStorage();
      });

      loginAdminUi();
      cy.visit('/admin/trocas');
      cy.get(`[data-cy="admin-troca-${uuid}"]`).should('exist');
      cy.get(`[data-cy="btn-rejeitar-troca-${uuid}"]`).scrollIntoView().click();

      cy.get('[data-cy="troca-motivo-rejeicao"]')
        .should('be.visible')
        .type('Produto fora das condições de devolução');
      cy.get('[data-cy="btn-confirmar-rejeicao"]').click();

      cy.clearCookies();
      cy.clearLocalStorage();
      loginClienteUi();
      cy.visit('/pedidos');
      cy.get(`[data-cy="pedido-${uuid}"]`).within(() => {
        cy.get('[data-cy="pedido-status"]').should('contain.text', 'Devolução Rejeitada');
      });
    });
  });
});
