/**
 * Teste E2E - Fluxo Completo de Compra Complexa (Cenário 1 BDD)
 * 
 * Cenário: Realizar compra com múltiplos cartões, cupom e novos dados (Feliz)
 * - Dado que o cliente está no checkout com itens no carrinho
 * - E seleciona a opção de adicionar um Novo Endereço de entrega
 * - E seleciona a opção de adicionar um Novo Cartão de Crédito
 * - E insere um Cupom de Troca válido no valor de R$ 50,00
 * - Quando finaliza a compra dividindo o saldo restante em 2 cartões de crédito (um existente e o novo)
 * - Então o sistema deve validar os dados do novo endereço e cartão
 * - E registrar a venda com status EM PROCESSAMENTO
 * - E debitar o valor do cupom e as transações nos dois cartões
 * - E salvar o novo endereço e o novo cartão no perfil do cliente para usos futuros
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

import {
  configurarAmbienteTestesVenda,
  finalizarCompraCheckoutUi,
  autenticarClienteDadosTesteUi,
  selecionarEnderecoFretePadraoCheckoutUi,
  visitarCheckoutComCarrinhoSincronizadoUi,
} from '../../support/helpers/uiEntrega7Helpers';
import { apiHeadersBancoTestes } from '../../support/helpers/checkoutHelpers';

describe('Pagamentos — Fluxo Completo de Compra Complexa (Cenário 1 BDD)', () => {
  beforeEach(() => {
    configurarAmbienteTestesVenda();
    autenticarClienteDadosTesteUi();
  });

  it('deve realizar compra com novo endereço, novo cartão, cupom e split em 2 cartões', () => {
    const apiUrl = Cypress.env('apiUrl');
    const timestamp = Date.now();
    const apelidoEndereco = `Endereço Compra ${timestamp}`;
    const nomeCartao = `CARTÃO ${timestamp}`;

    // Preparar checkout com carrinho sincronizado
    visitarCheckoutComCarrinhoSincronizadoUi();

    // 1. Adicionar novo endereço no checkout
    cy.get('[data-cy="checkout-add-new-address"]')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.get('[data-cy="checkout-new-address-form"]')
      .should('be.visible');

    // Preencher dados do novo endereço
    cy.get('[data-cy="address-logradouro"]')
      .type('Rua Nova Compra');
    
    cy.get('[data-cy="address-numero"]')
      .type('123');
    
    cy.get('[data-cy="address-bairro"]')
      .type('Centro');
    
    cy.get('[data-cy="address-cidade"]')
      .type('São Paulo');
    
    cy.get('[data-cy="address-estado"]')
      .select('SP');
    
    cy.get('[data-cy="address-cep"]')
      .type('01310-100');
    
    cy.get('[data-cy="address-apelido"]')
      .type(apelidoEndereco);

    // Salvar endereço
    cy.get('[data-cy="checkout-save-address-button"]')
      .click();

    // Verificar que modal fechou e endereço foi adicionado
    cy.get('[data-cy="checkout-new-address-form"]')
      .should('not.exist');
    
    cy.get('[data-cy="checkout-addresses"]')
      .should('contain', 'Rua Nova Compra');

    // Selecionar o novo endereço
    cy.contains(apelidoEndereco)
      .parents('[data-cy^="checkout-address-item-"]')
      .click();

    cy.get('[data-cy="checkout-addresses"]')
      .parent()
      .should('contain', 'Endereço selecionado para entrega');

    // 2. Calcular e selecionar frete
    cy.checkoutPreencherFretePadrao('01310-100');

    // 3. Aplicar cupom de troca
    cy.checkoutAplicarCupom('TROCA50');
    cy.get('[data-cy="checkout-coupon-TROCA50"]', { timeout: 10000 })
      .should('be.visible');

    // 4. Configurar split de pagamento com cartão existente + novo cartão
    cy.get('[data-cy="checkout-split-payment"]')
      .should('exist');

    // Obter total do carrinho para calcular split
    cy.get('[data-cy="checkout-total-value"]', { timeout: 10000 })
      .invoke('text')
      .then((textoTotal) => {
        const numeros = textoTotal.replace(/[^\d,]/g, '').replace(',', '.');
        const total = Number.parseFloat(numeros);
        expect(total, 'total do checkout deve ser numérico').to.be.a('number').and.not.be.NaN;
        
        // Calcular valores para split (após cupom)
        const valorLinha1 = Math.max(10, Math.floor((total - 50) / 2));
        const valorLinha2 = Math.max(10, (total - 50) - valorLinha1);

        // Configurar primeira linha com cartão existente
        cy.get('[data-cy="checkout-split-line-value"]')
          .first()
          .clear()
          .type(String(valorLinha1));

        // Adicionar segunda linha com novo cartão
        cy.get('[data-cy="checkout-split-add-new-card"]')
          .scrollIntoView()
          .should('be.visible')
          .click();

        cy.get('body').then(($body) => {
          if ($body.find('[data-cy="checkout-split-inform-new-card"]').length) {
            cy.get('[data-cy="checkout-split-inform-new-card"]').click();
          } else {
            cy.get('[data-cy="checkout-add-card-button"]').click();
          }
        });

        // Preencher dados do novo cartão
        cy.get('[data-cy="checkout-card-number-input"]')
          .should('be.visible')
          .type('4111111111111111');

        cy.get('[data-cy="checkout-card-name-input"]')
          .type(nomeCartao);

        cy.get('[data-cy="checkout-card-expiry-input"]')
          .type('12/30');

        cy.get('[data-cy="checkout-card-cvv-input"]')
          .type('123');

        // Salvar cartão para uso futuro
        cy.get('[data-cy="checkout-save-card-checkbox"]')
          .check();

        cy.get('[data-cy="checkout-card-submit-button"]')
          .click();

        // Verificar que cartão foi adicionado
        cy.get('[data-cy="checkout-new-card-form"]')
          .should('not.exist');

        // Configurar valor da segunda linha
        cy.get('[data-cy="checkout-split-line-value"]')
          .eq(1)
          .clear()
          .type(String(valorLinha2));

        // Verificar que split está OK
        cy.get('[data-cy="checkout-split-restante"]')
          .should('contain', 'OK');

        // 5. Finalizar compra
        finalizarCompraCheckoutUi({ selecionarPagamentoVezes: 2 });

        // 6. Verificar redirecionamento para confirmação
        cy.url()
          .should('include', '/pedido-confirmado');

        // 7. Validar que novo endereço foi salvo no perfil
        cy.request({
          method: 'GET',
          url: `${apiUrl}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          
          const enderecoSalvo = res.body.find((e: { apelido: string }) => e.apelido === apelidoEndereco);
          expect(enderecoSalvo, 'novo endereço deve estar salvo no perfil').to.exist;
        });

        // 8. Validar que novo cartão foi salvo no perfil
        cy.request({
          method: 'GET',
          url: `${apiUrl}/clientes/perfil/cartoes`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          
          const cartaoSalvo = res.body.find((c: { nomeImpresso: string }) => c.nomeImpresso === nomeCartao);
          expect(cartaoSalvo, 'novo cartão deve estar salvo no perfil').to.exist;
        });
      });
  });

  it('deve validar dados do novo endereço antes de salvar', () => {
    visitarCheckoutComCarrinhoSincronizadoUi();

    // Tentar adicionar endereço sem campos obrigatórios
    cy.get('[data-cy="checkout-add-new-address"]')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.get('[data-cy="checkout-new-address-form"]')
      .should('be.visible');

    // Tentar salvar sem preencher
    cy.get('[data-cy="checkout-save-address-button"]')
      .click();

    // Verificar validação de campos obrigatórios
    cy.get('[data-cy="address-error"]')
      .should('be.visible');
  });

  it('deve validar dados do novo cartão antes de salvar', () => {
    visitarCheckoutComCarrinhoSincronizadoUi();
    selecionarEnderecoFretePadraoCheckoutUi();

    // Configurar split para adicionar novo cartão
    cy.get('[data-cy="checkout-split-line-value"]')
      .first()
      .clear()
      .type('10');

    cy.get('[data-cy="checkout-split-add-new-card"]')
      .scrollIntoView()
      .should('be.visible')
      .click();

    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="checkout-split-inform-new-card"]').length) {
        cy.get('[data-cy="checkout-split-inform-new-card"]').click();
      } else {
        cy.get('[data-cy="checkout-add-card-button"]').click();
      }
    });

    // Tentar salvar cartão com número inválido
    cy.get('[data-cy="checkout-card-number-input"]')
      .type('4111111111111112');

    cy.get('[data-cy="checkout-card-submit-button"]')
      .click();

    // Verificar validação de Luhn
    cy.get('[data-cy="checkout-card-errors"]')
      .should('be.visible')
      .and('contain', 'inválido');
  });
});
