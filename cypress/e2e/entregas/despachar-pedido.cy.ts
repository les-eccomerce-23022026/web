/**
 * CDU007 — Admin despacha entrega (E2E com tela /admin/pedidos)
 * Fluxo correto com login/logout entre cliente e admin da loja específica
 */

import {
  configurarAmbienteEntrega7Ui,
  despacharPedidoAdminUi,
  sufixoPedidoNaTabela,
} from '../../support/helpers/uiEntrega7Helpers';

describe('Entregas — Despachar Pedido Aprovado (CDU007, RF0038)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
  });

  it('deve exibir painel de pedidos e despachar venda APROVADA com login/logout correto', () => {
    // 1. Cliente autenticado → Compra produto da Loja A
    cy.criarAmbienteMultiLoja();
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then((dados) => {
        cy.wrap(dados.vendaUuid).as('vendaUuid');
      });
    });

    // 2. Logout do cliente
    cy.logout();

    // 3. Admin da Loja A autenticado (com x-loja-uuid)
    cy.autenticarAdminLojaA();

    // 4. Admin despacha pedido da Loja A
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      cy.visit('/admin/pedidos');
      cy.get('[data-cy="loading"]', { timeout: 15000 }).should('not.exist');
      cy.get('[data-cy="pedidos-painel"]').should('exist');
      cy.contains(sufixoPedidoNaTabela(vendaUuid)).should('be.visible');

      despacharPedidoAdminUi(vendaUuid);

      cy.contains(sufixoPedidoNaTabela(vendaUuid))
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Trânsito');
    });

    // 5. Logout do admin
    cy.logout();

    // 6. Cliente autenticado → Verifica status do pedido
    cy.autenticarClienteDadosTeste();
    cy.get<string>('@vendaUuid').then((vendaUuid) => {
      cy.visit(`/pedidos/${vendaUuid}`);
      cy.get('[data-cy="status-badge"]').should('contain', 'Trânsito');
    });
  });
});
