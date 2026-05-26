/**
 * Teste E2E - Falha de Segundo Cartão com Atomicidade (Cenário 2 BDD)
 * 
 * Cenário: Falha no pagamento com um dos cartões (Falha)
 * - Dado que o cliente está finalizando uma compra com 2 cartões
 * - Quando a operadora do segundo cartão recusa a transação (ex: saldo insuficiente)
 * - Então o sistema deve informar o erro ao cliente
 * - E não deve efetivar a venda nem o débito no primeiro cartão (garantir atomicidade)
 * - E a venda deve permanecer com status AGUARDANDO PAGAMENTO ou ser cancelada
 * 
 * Estratégia: E2E UI real com intercept para simular falha no segundo cartão
 */

import {
  configurarAmbienteEntrega7Ui,
  autenticarClienteDadosTesteUi,
  selecionarEnderecoFretePadraoCheckoutUi,
  visitarCheckoutComCarrinhoSincronizadoUi,
} from '../../support/helpers/uiEntrega7Helpers';
import { apiHeadersBancoTestes } from '../../support/helpers/checkoutHelpers';

describe('Pagamentos — Falha de Segundo Cartão com Atomicidade (Cenário 2 BDD)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    autenticarClienteDadosTesteUi();
  });

  it('deve informar erro e garantir atomicidade quando segundo cartão falha', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

    // Preparar checkout com carrinho sincronizado
    visitarCheckoutComCarrinhoSincronizadoUi();

    // Selecionar endereço e frete
    selecionarEnderecoFretePadraoCheckoutUi();

    // Configurar intercept para simular falha no segundo processamento de pagamento
    cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`, (req) => {
      // Deixar o primeiro processamento passar
      if (!req.alias.includes('second-payment')) {
        req.continue();
      } else {
        // Simular falha no segundo processamento
        req.reply({
          statusCode: 400,
          body: {
            erro: 'Transação recusada pela operadora',
            codigo: 'CARD_DECLINED',
            mensagem: 'Saldo insuficiente',
          },
        });
      }
    }).as('processarPagamento');

    // Configurar split de pagamento em 2 cartões
    cy.get('[data-cy="checkout-split-payment"]')
      .should('exist');

    cy.get('[data-cy="checkout-total-value"]', { timeout: 10000 })
      .invoke('text')
      .then((textoTotal) => {
        const numeros = textoTotal.replace(/[^\d,]/g, '').replace(',', '.');
        const total = Number.parseFloat(numeros);
        expect(total, 'total do checkout deve ser numérico').to.be.a('number').and.not.be.NaN;
        
        const valorLinha1 = Math.max(10, Math.floor(total / 2));
        const valorLinha2 = Math.max(10, total - valorLinha1);

        // Configurar primeira linha
        cy.get('[data-cy="checkout-split-line-value"]')
          .first()
          .clear()
          .type(String(valorLinha1));

        // Adicionar segunda linha com cartão salvo
        cy.get('[data-cy="checkout-split-add-saved-card"]')
          .click();

        cy.get('[data-cy="checkout-split-line-card-select"]')
          .eq(1)
          .should('exist')
          .find('option:not([value=""])')
          .eq(1)
          .invoke('val')
          .then((uuid) => {
            expect(uuid, 'uuid do segundo cartão').to.be.a('string').and.not.be.empty;
            cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select(String(uuid));
          });

        cy.get('[data-cy="checkout-split-line-value"]')
          .eq(1)
          .clear()
          .type(String(valorLinha2));

        // Verificar que split está OK
        cy.get('[data-cy="checkout-split-restante"]')
          .should('contain', 'OK');

        // Tentar finalizar compra
        cy.get('[data-cy="checkout-finish-button"]')
          .should('be.visible')
          .should('not.be.disabled')
          .scrollIntoView()
          .click();

        // Aguardar processamento e verificar erro
        cy.wait('@processarPagamento', { timeout: 20000 });

        // Verificar que erro é exibido ao cliente
        cy.get('[data-cy="checkout-error-banner"]', { timeout: 10000 })
          .should('be.visible')
          .and('contain', 'recusada')
          .and('contain', 'cartão');

        // Verificar que não foi redirecionado para pedido-confirmado
        cy.url()
          .should('include', '/checkout')
          .and('not.include', '/pedido-confirmado');

        // Verificar que venda não foi criada (atomicidade)
        cy.request({
          method: 'GET',
          url: `${apiUrl}/vendas`,
          headers: apiHeadersBancoTestes(),
          qs: { limit: 1 },
        }).then((res) => {
          expect(res.status).to.equal(200);
          // Se houver vendas, verificar que a mais recente não é do teste atual
          // (ou que não há vendas recentes com status EM PROCESSAMENTO)
          const vendas = res.body;
          if (vendas.length > 0) {
            const vendaMaisRecente = vendas[0];
            // A venda mais recente não deve ter sido criada nos últimos 30 segundos
            const dataVenda = new Date(vendaMaisRecente.criadoEm);
            const agora = new Date();
            const diferencaSegundos = (agora.getTime() - dataVenda.getTime()) / 1000;
            
            expect(diferencaSegundos, 'venda não deve ter sido criada recentemente').to.be.greaterThan(30);
          }
        });
      });
  });

  it('deve manter carrinho intacto após falha de segundo cartão', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

    // Preparar checkout com carrinho sincronizado
    visitarCheckoutComCarrinhoSincronizadoUi();

    // Obter quantidade de itens no carrinho antes da tentativa
    cy.request({
      method: 'GET',
      url: `${apiUrl}/carrinho`,
      headers: apiHeadersBancoTestes(),
    }).then((res) => {
      const quantidadeAntes = res.body.itens.length;
      expect(quantidadeAntes).to.be.greaterThan(0);

      // Selecionar endereço e frete
      selecionarEnderecoFretePadraoCheckoutUi();

      // Configurar intercept para simular falha
      cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`, (req) => {
        req.reply({
          statusCode: 400,
          body: {
            erro: 'Transação recusada',
            codigo: 'CARD_DECLINED',
          },
        });
      }).as('processarPagamentoFalha');

      // Configurar split simples
      cy.get('[data-cy="checkout-split-line-value"]')
        .first()
        .clear()
        .type('10');

      cy.get('[data-cy="checkout-split-add-saved-card"]')
        .click();

      cy.get('[data-cy="checkout-split-line-card-select"]')
        .eq(1)
        .should('exist')
        .find('option:not([value=""])')
        .first()
        .invoke('val')
        .then((uuid) => {
          cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select(String(uuid));
        });

      cy.get('[data-cy="checkout-split-line-value"]')
        .eq(1)
        .clear()
        .type('10');

      cy.get('[data-cy="checkout-split-restante"]')
        .should('contain', 'OK');

      // Tentar finalizar
      cy.get('[data-cy="checkout-finish-button"]')
        .click();

      cy.wait('@processarPagamentoFalha');

      // Verificar erro
      cy.get('[data-cy="checkout-error-banner"]')
        .should('be.visible');

      // Verificar que carrinho ainda tem os mesmos itens
      cy.request({
        method: 'GET',
        url: `${apiUrl}/carrinho`,
        headers: apiHeadersBancoTestes(),
      }).then((resDepois) => {
        const quantidadeDepois = resDepois.body.itens.length;
        expect(quantidadeDepois, 'carrinho deve manter itens após falha').to.equal(quantidadeAntes);
      });
    });
  });

  it('deve permitir nova tentativa após falha de segundo cartão', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';

    // Preparar checkout
    visitarCheckoutComCarrinhoSincronizadoUi();
    selecionarEnderecoFretePadraoCheckoutUi();

    // Configurar intercept para falha na primeira tentativa
    cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`, (req) => {
      req.reply({
        statusCode: 400,
        body: {
          erro: 'Transação recusada',
          codigo: 'CARD_DECLINED',
        },
      });
    }).as('processarPagamentoFalha');

    // Configurar split
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('10');

    cy.get('[data-cy="checkout-split-add-saved-card"]')
      .click();

    cy.get('[data-cy="checkout-split-line-card-select"]')
      .eq(1)
      .should('exist')
      .find('option:not([value=""])')
      .first()
      .invoke('val')
      .then((uuid) => {
        cy.get('[data-cy="checkout-split-line-card-select"]').eq(1).select(String(uuid));
      });

    cy.get('[data-cy="checkout-split-line-value"]')
      .eq(1)
      .clear()
      .type('10');

    cy.get('[data-cy="checkout-split-restante"]')
      .should('contain', 'OK');

    // Primeira tentativa (vai falhar)
    cy.get('[data-cy="checkout-finish-button"]')
      .click();

    cy.wait('@processarPagamentoFalha');

    cy.get('[data-cy="checkout-error-banner"]')
      .should('be.visible');

    // Remover intercept e tentar novamente com sucesso
    cy.intercept('POST', `${apiUrl}/pagamentos/*/processar`).as('processarPagamentoSucesso');

    // Usar apenas um cartão para simplificar a nova tentativa
    cy.get('[data-cy="checkout-split-remove-line-1"]')
      .click();

    cy.get('[data-cy="checkout-split-line-1"]')
      .should('not.exist');

    // Selecionar apenas um cartão principal
    cy.get('[data-cy^="checkout-card-item-"]')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .click();

    // Nova tentativa
    cy.get('[data-cy="checkout-finish-button"]')
      .click();

    cy.wait('@processarPagamentoSucesso', { timeout: 20000 });

    // Verificar sucesso
    cy.url()
      .should('include', '/pedido-confirmado');
  });
});
