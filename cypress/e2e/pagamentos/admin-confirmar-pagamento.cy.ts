/**
 * E2E — 7ª Entrega / Seção 4: Admin confirma pagamento (aprovar / rejeitar).
 *
 * Setup idempotente: o cliente cria um pedido via API (estado inicial do pagamento)
 * e o admin atua sobre esse pedido específico (uuid determinístico), evitando
 * depender de qualquer pedido pré-existente do seed.
 */
import {
  loginApi,
  criarVendaApi,
  loginAdminUi,
  CLIENTE,
} from '../../support/fluxo-venda.helpers';

describe('Pagamentos — Admin confirma pagamento (CDU005, RF0019)', () => {
  let pedidoUuid: string;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Cria um pedido do cliente com pagamento pendente de confirmação.
    loginApi(CLIENTE.email, CLIENTE.senha)
      .then((tokenCliente) => criarVendaApi(tokenCliente))
      .then((venda) => {
        pedidoUuid = venda.uuid;
        cy.clearCookies();
        cy.clearLocalStorage();
      });
  });

  it('4.1 deve permitir admin aprovar o pagamento e atualizar o status do pedido', () => {
    /**
     * Fluxo (4.1 Admin aprovar pagamento):
     * 1. Cliente realiza compra (pagamento pendente)
     * 2. Admin faz login
     * 3. Navega para painel de pedidos
     * 4. Encontra pedido com status "Pagamento Pendente"
     * 5. Clica em "Aprovar pagamento"
     * 6. Sistema atualiza status para "Pagamento Aprovado"
     * 7. Sistema notifica cliente sobre aprovação
     * 8. Verifica que pedido aparece com status atualizado
     */
    loginAdminUi();
    cy.visit('/admin/pedidos');
    cy.get('[data-cy="pedidos-painel"]').should('be.visible');

    // Aprovar o pagamento do pedido criado (botão determinístico por uuid)
    cy.get(`[data-cy="btn-aprovar-pagamento-${pedidoUuid}"]`).scrollIntoView().click();

    // Status atualizado para "Em Processamento"/"Pagamento Aprovado"
    cy.get(`[data-cy="admin-pedido-${pedidoUuid}"]`)
      .find('[data-cy="pedido-status"]')
      .should('be.visible')
      .and('not.contain.text', 'Pagamento Pendente');
  });

  it('4.2 deve permitir admin rejeitar o pagamento', () => {
    /**
     * Fluxo (4.2 Admin rejeitar pagamento):
     * 1. Cliente realiza compra (pagamento pendente)
     * 2. Admin faz login
     * 3. Navega para painel de pedidos
     * 4. Encontra pedido com status "Pagamento Pendente"
     * 5. Clica em "Rejeitar pagamento"
     * 6. Sistema solicita motivo da rejeição
     * 7. Admin preenche motivo
     * 8. Sistema atualiza status para "Pagamento Rejeitado"
     * 9. Sistema notifica cliente sobre rejeição
     * 10. Verifica que pedido aparece com status atualizado
     */
    loginAdminUi();
    cy.visit('/admin/pedidos');
    cy.get('[data-cy="pedidos-painel"]').should('be.visible');

    cy.get(`[data-cy="btn-rejeitar-pagamento-${pedidoUuid}"]`).scrollIntoView().click();

    // Status atualizado para rejeitado
    cy.get(`[data-cy="admin-pedido-${pedidoUuid}"]`)
      .find('[data-cy="pedido-status"]')
      .should('contain.text', 'Rejeitado');
  });
});
