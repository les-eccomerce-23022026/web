/**
 * E2E — 7ª Entrega / Seção 5: Admin define produto EM TRANSPORTE.
 *
 * Setup idempotente: cliente cria pedido + pagamento aprovado via API; o admin
 * despacha ESSE pedido pela UI; o cliente confirma o status "Em Trânsito".
 */
import {
  loginApi,
  criarVendaApi,
  aprovarPagamentoApi,
  loginAdminUi,
  loginClienteUi,
  CLIENTE,
} from '../../support/fluxo-venda.helpers';

describe('Entregas — Admin despacha pedido para transporte (CDU007, RF0038)', () => {
  let pedidoUuid: string;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Pedido com pagamento aprovado (despachável), criado de forma idempotente.
    loginApi(CLIENTE.email, CLIENTE.senha)
      .then((tokenCliente) =>
        criarVendaApi(tokenCliente).then((venda) => {
          pedidoUuid = venda.uuid;
          return aprovarPagamentoApi(tokenCliente, venda.uuid, venda.valorTotal);
        }),
      )
      .then(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
      });
  });

  it('5 deve despachar o pedido (Em Trânsito) e o cliente ver o status e o botão de confirmar recebimento', () => {
    /**
     * Fluxo (5 Admin define produto EM TRANSPORTE):
     * 1. Cliente realiza compra (pagamento aprovado)
     * 2. Admin aprova pagamento
     * 3. Admin faz login
     * 4. Navega para painel de pedidos
     * 5. Encontra pedido com status "Pagamento Aprovado"
     * 6. Clica em "Despachar" ou "Marcar como Em Trânsito"
     * 7. Sistema atualiza status para "Em Trânsito"
     * 8. Sistema gera código de rastreamento
     * 9. Sistema notifica cliente sobre despacho
     * 10. Cliente acessa Meus Pedidos
     * 11. Verifica que pedido mostra status "Em Trânsito" (etapa 3 de 4)
     * 12. Verifica que botão "Confirmar recebimento" está disponível
     */
    // === Admin despacha o pedido ===
    loginAdminUi();
    cy.visit('/admin/pedidos');
    cy.get('[data-cy="pedidos-painel"]').should('be.visible');

    // Filtrar pelo UUID do pedido para encontrá-lo rapidamente
    const pedidoShortId = pedidoUuid.split('-')[1]?.toUpperCase() || pedidoUuid;
    cy.get('[data-cy="filtro-uuid"]').type(pedidoShortId);

    cy.get(`[data-cy="btn-despachar-${pedidoUuid}"]`).scrollIntoView().click();

    // Após despachar, o botão de confirmar entrega ao cliente aparece (status Em Trânsito)
    cy.get(`[data-cy="btn-confirmar-entrega-${pedidoUuid}"]`).should('be.visible');

    // === Cliente verifica status "Em Trânsito" ===
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    cy.visit('/pedidos');
    cy.get('[data-cy="pedidos-lista"]').should('be.visible');

    cy.get(`[data-cy="pedido-${pedidoUuid}"]`).within(() => {
      cy.get('[data-cy="pedido-status"]').should('contain.text', 'Em Trânsito');
    });

    // Botão de confirmar recebimento disponível para o cliente
    cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoUuid}"]`).should('exist');
  });
});
