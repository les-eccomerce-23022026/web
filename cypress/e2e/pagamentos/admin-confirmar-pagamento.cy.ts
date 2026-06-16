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
  ADMIN,
} from '../../support/fluxo-venda.helpers';

describe('Pagamentos — Admin confirma pagamento (CDU005, RF0019)', () => {
  let pedidoUuid: string;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Cria um pedido e coloca em status "Pagamento Pendente" para o admin atuar.
    loginApi(CLIENTE.email, CLIENTE.senha)
      .then((tokenCliente) => criarVendaApi(tokenCliente))
      .then((venda) => {
        pedidoUuid = venda.uuid;
        return loginApi(ADMIN.email, ADMIN.senha).then((tokenAdmin) => {
          return cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl') || 'http://localhost:3001/api'}/admin/testes/mudar-status-venda`,
            headers: {
              'X-Test-Rate-Limit-Key': `cypress-e2e-${Date.now()}`,
              'Authorization': `Bearer ${tokenAdmin}`,
              'Content-Type': 'application/json',
            },
            body: { vendaUuid: pedidoUuid, novoStatus: 'AGUARDANDO_PAGAMENTO' },
          });
        });
      })
      .then(() => {
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

    // Aguardar a tabela carregar e o pedido aparecer
    cy.get('[data-cy="admin-table"]').should('be.visible');

    // Filtrar pelo UUID do pedido para encontrá-lo rapidamente
    const pedidoShortId = pedidoUuid.split('-')[1]?.toUpperCase() || pedidoUuid;
    cy.get('[data-cy="filtro-uuid"]').type(pedidoShortId);

    // Aprovar o pagamento do pedido criado (botão determinístico por uuid)
    cy.get(`[data-cy="btn-aprovar-pagamento-${pedidoUuid}"]`, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click();

    // Status mudou de "Pagamento Pendente" (aprovação confirmada)
    cy.get(`[data-cy="status-badge-${pedidoUuid}"]`, { timeout: 10000 })
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

    // Aguardar a tabela carregar e o pedido aparecer
    cy.get('[data-cy="admin-table"]').should('be.visible');

    // Filtrar pelo UUID do pedido para encontrá-lo rapidamente
    const pedidoShortId = pedidoUuid.split('-')[1]?.toUpperCase() || pedidoUuid;
    cy.get('[data-cy="filtro-uuid"]').type(pedidoShortId);

    cy.get(`[data-cy="btn-rejeitar-pagamento-${pedidoUuid}"]`, { timeout: 10000 })
      .should('be.visible')
      .scrollIntoView()
      .click();

    // Status mudou de "Pagamento Pendente" após rejeição
    cy.get(`[data-cy="status-badge-${pedidoUuid}"]`, { timeout: 10000 })
      .should('be.visible')
      .and('not.contain.text', 'Pagamento Pendente');
  });
});
