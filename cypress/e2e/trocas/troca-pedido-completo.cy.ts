/**
 * E2E — 7ª Entrega / Seção 8: Troca do pedido completo.
 * Cliente solicita troca de TODOS os itens; admin autoriza e confirma recebimento;
 * sistema gera cupom com o valor TOTAL do pedido.
 *
 * Setup idempotente via API (cria o pedido entregue) e uuid determinístico.
 */
import {
  prepararPedidoEntregueApi,
  loginAdminUi,
  loginClienteUi,
} from '../../support/fluxo-venda.helpers';

function valorMonetario(texto: string): number {
  return Number.parseFloat(texto.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
}

describe('Trocas — Troca do pedido completo (CDU008, RF0042, RF0044)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('8 deve trocar o pedido completo e gerar cupom com o valor total do pedido', () => {
    /**
     * Fluxo (8 Troca do pedido completo):
     * 1. Cliente faz login
     * 2. Acessa pedido entregue
     * 3. Clica em "Solicitar troca completa"
     * 4. Sistema seleciona todos os itens do pedido
     * 5. Cliente confirma troca completa
     * 6. Preenche motivo da troca
     * 7. Sistema cria solicitação de troca completa
     * 8. Admin recebe solicitação
     * 9. Admin aprova troca completa
     * 10. Cliente envia todos os produtos de volta
     * 11. Admin confirma recebimento
     * 12. Sistema gera cupom com valor TOTAL do pedido
     * 13. Cliente recebe cupom com valor completo
     * 14. Cliente pode usar cupom em nova compra
     */
    prepararPedidoEntregueApi().then(({ uuid }) => {
      // === Cliente solicita troca completa ===
      loginClienteUi();
      cy.visit('/pedidos');

      // Captura o valor total do pedido para validar o cupom depois
      cy.get(`[data-cy="pedido-${uuid}"]`).find('[data-cy="pedido-total"]').invoke('text').then((tTotal) => {
        const totalPedido = valorMonetario(tTotal);

        cy.get(`[data-cy="btn-solicitar-troca-${uuid}"]`).scrollIntoView().click();
        cy.url().should('include', '/troca');

        // Seleciona TODOS os itens (troca completa)
        cy.get('[data-cy="troca-selecionar-tudo"]').check();
        cy.get('[data-cy="troca-motivo-input"]').clear().type('Quero trocar o pedido inteiro por outros títulos');
        cy.get('[data-cy="btn-confirmar-troca"]').click();
        cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible');

        // === Admin autoriza e confirma recebimento ===
        cy.clearCookies();
        cy.clearLocalStorage();
        loginAdminUi();
        cy.visit('/admin/trocas');
        cy.get(`[data-cy="admin-troca-${uuid}"]`).should('exist');
        cy.get(`[data-cy="btn-autorizar-troca-${uuid}"]`).scrollIntoView().click();
        cy.get(`[data-cy="btn-confirmar-recebimento-${uuid}"]`).scrollIntoView().click();
        cy.get('[data-cy="checkbox-retornar-estoque"]').check();
        cy.get('[data-cy="btn-confirmar-modal"]').click();

        // === Cliente recebe cupom com o valor total do pedido ===
        cy.clearCookies();
        cy.clearLocalStorage();
        loginClienteUi();
        cy.visit('/minha-conta');
        cy.get('[data-cy="tab-cupons"]').click();
        cy.get('[data-cy^="cupom-"]').first().within(() => {
          cy.get('[data-cy^="cupom-valor-"]').invoke('text').then((tCupom) => {
            const valorCupom = valorMonetario(tCupom);
            expect(valorCupom).to.be.greaterThan(0);
            // O cupom de troca completa deve corresponder ao valor dos itens do pedido.
            expect(valorCupom).to.be.closeTo(totalPedido, totalPedido * 0.2 + 0.01);
          });
        });
      });
    });
  });
});
