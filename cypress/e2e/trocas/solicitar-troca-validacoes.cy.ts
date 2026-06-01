/**
 * Testes E2E de Solicitação de Troca - Cliente
 * RF0040 — Solicitação de Troca · RF0043 — Prazo de 7 dias pós entrega
 */

import { autenticarClienteDadosTesteUi } from '../../support/helpers/uiEntrega7Helpers';

describe('Trocas — Validações de Solicitação de Troca', () => {
  let vendaUuid: string;

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);

    cy.criarVendaAprovadaViaApi()
      .then((dados) => {
        vendaUuid = dados.vendaUuid;
        return cy.despacharPedidoViaApi(dados.vendaUuid);
      })
      .then(() => cy.confirmarEntregaViaApi(vendaUuid))
      .then(() => {
        autenticarClienteDadosTesteUi();
      });
  });

  describe('Acesso à Página de Troca', () => {
    it('deve exibir página de solicitação de troca para pedido entregue', () => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      cy.get('[data-cy="troca-carregando"]', { timeout: 5000 }).should('not.exist');

      cy.contains('h1', 'Solicitar Troca').should('be.visible');
      cy.contains('Pedido:').should('be.visible');
      cy.contains('p', /Status:/i).should('contain', 'Entregue');
    });

    it('deve exibir erro para pedido não entregue', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        autenticarClienteDadosTesteUi();
        cy.visit(`/pedidos/${dados.vendaUuid}/troca`);

        cy.contains('Apenas pedidos com status').should('be.visible');
        cy.contains('Entregue').should('be.visible');
      });
    });

    it('deve exibir erro para pedido não encontrado', () => {
      const uuidInexistente = '00000000-0000-0000-0000-000000000000';

      cy.visit(`/pedidos/${uuidInexistente}/troca`);

      cy.contains('Pedido não encontrado').should('be.visible');
    });
  });

  describe('Seleção de Itens para Troca', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      cy.get('[data-cy="troca-carregando"]', { timeout: 5000 }).should('not.exist');
    });

    it('deve exibir lista de itens do pedido', () => {
      cy.get('[data-cy="troca-itens-titulo"]').should('be.visible');
      cy.get('[data-cy^="troca-item-checkbox-"]').should('have.length.at.least', 1);
    });

    it('deve permitir selecionar item para troca', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
      cy.get('[data-cy^="troca-item-checkbox-"]').first().should('be.checked');
    });

    it('deve permitir desmarcar item selecionado', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
      cy.get('[data-cy^="troca-item-checkbox-"]').first().uncheck();
      cy.get('[data-cy^="troca-item-checkbox-"]').first().should('not.be.checked');
    });

    it('deve exibir erro ao tentar solicitar sem selecionar itens', () => {
      cy.get('[data-cy="btn-solicitar-troca"]').click();

      cy.get('[data-cy="erro-selecionar-item"]').should('be.visible');
    });
  });

  describe('Preenchimento de Motivo', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      cy.get('[data-cy="troca-carregando"]', { timeout: 5000 }).should('not.exist');
      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
    });

    it('deve exibir campo de motivo da troca', () => {
      cy.get('[data-cy="troca-motivo-label"]').should('be.visible');
      cy.get('[data-cy="troca-motivo-input"]').should('be.visible');
    });

    it('deve permitir preencher motivo da troca', () => {
      cy.get('[data-cy="troca-motivo-input"]').type('Produto com defeito de fabricação');
      cy.get('[data-cy="troca-motivo-input"]').should('have.value', 'Produto com defeito de fabricação');
    });

    it('deve exibir erro ao tentar solicitar sem motivo', () => {
      cy.get('[data-cy="btn-solicitar-troca"]').click();

      cy.get('[data-cy="erro-motivo-obrigatorio"]').should('be.visible');
    });
  });

  describe('Solicitação de Troca Completa', () => {
    beforeEach(() => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      cy.get('[data-cy="troca-carregando"]', { timeout: 5000 }).should('not.exist');
    });

    it('deve solicitar troca com sucesso', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]').first().check();
      cy.get('[data-cy="troca-motivo-input"]').type('Produto com defeito');

      cy.get('[data-cy="btn-solicitar-troca"]').click();

      cy.get('[data-cy="sucesso-troca"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy="redirecionando-mensagem"]').should('be.visible');

      cy.url({ timeout: 10000 }).should('include', '/pedidos');
    });

    it('deve permitir cancelar solicitação', () => {
      cy.get('[data-cy="btn-cancelar-troca"]').click();

      cy.url().should('include', '/pedidos');
    });
  });

  describe('Validação de Prazo (RN0043)', () => {
    it('deve bloquear solicitação pós 7 dias da entrega', () => {
      cy.task<boolean>('bddRetrocederDataEntrega', { vendaUuid }).then(function (ok) {
        if (!ok) {
          this.skip();
        }
        cy.visit(`/pedidos/${vendaUuid}/troca`);

        cy.get('[data-cy="erro-prazo-expirado"]').should('be.visible');
        cy.get('[data-cy="erro-status-entregue"]').should('be.visible');
      });
    });

    it('deve exibir mensagem informativa sobre prazo de 7 dias', () => {
      cy.task<boolean>('bddRetrocederDataEntrega', { vendaUuid }).then(function (ok) {
        if (!ok) {
          this.skip();
        }
        cy.visit(`/pedidos/${vendaUuid}/troca`);

        cy.get('[data-cy="info-prazo-7-dias"]').should('be.visible');
        cy.get('[data-cy="info-prazo-texto"]').should('be.visible');
      });
    });

    it('deve permitir solicitação dentro do prazo de 7 dias', () => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);

      cy.get('[data-cy="btn-solicitar-troca"]').should('be.visible');
      cy.get('[data-cy^="troca-item-checkbox-"]').should('have.length.at.least', 1);
    });
  });

  describe('Bloqueio Preventivo UI (RN0043)', () => {
    it('deve desabilitar botão de solicitação fora do prazo', () => {
      cy.task<boolean>('bddRetrocederDataEntrega', { vendaUuid }).then(function (ok) {
        if (!ok) {
          this.skip();
        }
        cy.visit(`/pedidos/${vendaUuid}/troca`);

        cy.get('[data-cy="btn-solicitar-troca"]').should('be.disabled');
      });
    });

    it('deve mostrar contador de dias restantes para o prazo', () => {
      cy.visit(`/pedidos/${vendaUuid}/troca`);

      cy.get('[data-cy="contador-dias-restantes"]').should('be.visible');
      cy.get('[data-cy="texto-restantes"]').should('contain', 'dias restantes');
    });
  });
});
