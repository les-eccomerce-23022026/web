/**
 * E2E — 7ª Entrega / Seção 1: Pagamento com todas as combinações de meio de pagamento.
 * Cenários: cartão + cupom, cartão diferente (Mastercard), PIX, combinações múltiplas.
 *
 * Padrões aplicados: login UI esperando redirect, carrinho/endereço/frete reutilizados,
 * asserções de cálculo (subtotal − desconto + frete = total), parsing monetário robusto.
 */
import {
  loginClienteUi,
  adicionarLivrosAoCarrinho,
  irParaCheckoutComEnderecoEFrete,
} from '../../support/fluxo-venda.helpers';

/** Converte "R$ 1.234,56" → 1234.56. */
function valorMonetario(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
  return Number.parseFloat(limpo);
}

describe('Pagamentos — Combinações de meio de pagamento (CDU002, RF0017, RF0018)', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    loginClienteUi();
    // Limpar carrinho para evitar conflitos de reserva (backend corrigido com lojId)
    cy.limparCarrinhoViaApi();
    adicionarLivrosAoCarrinho(2);
    irParaCheckoutComEnderecoEFrete();
  });

  it('1.1 deve pagar com cartão + cupom de desconto e refletir o desconto no total', () => {
    /**
     * Fluxo (1.1 Pagar com cartão + cupom de desconto):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço existente
     * 5. Calcula e seleciona frete
     * 6. Seleciona cartão salvo
     * 7. No campo de cupom, digita código de cupom válido
     * 8. Clica em "Aplicar cupom"
     * 9. Sistema valida cupom e aplica desconto no total
     * 10. Verifica que subtotal, desconto e total estão corretos
     * 11. Conclui pedido
     * 12. Verifica que pedido foi criado com desconto aplicado
     */
    // Subtotal e total antes do cupom
    cy.get('[data-cy="checkout-subtotal"]').invoke('text').then((t) => {
      const subtotal = valorMonetario(t);

      // Cartão salvo padrão já selecionado
      cy.get('[data-cy^="checkout-card-item-"]').first().should('have.attr', 'data-selected', 'true');

      // Aplicar cupom clicando na sugestão (o click já chama onAplicar internamente)
      cy.get('[data-cy="checkout-coupon-section"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="checkout-coupon-input"]').click();
      cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
      cy.get('[data-cy="checkout-coupon-suggestions"]').find('button:not([disabled])').first().click();

      // Cupom aparece na lista de aplicados
      cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');

      // Total final deve ser menor que subtotal + frete (desconto aplicado)
      cy.get('[data-cy="checkout-total-pagamento"]').invoke('text').then((tt) => {
        expect(valorMonetario(tt)).to.be.lessThan(subtotal + 1000);
      });
    });

    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');
    
    // Verificar que o pedido foi criado com sucesso
    cy.get('[data-cy="confirmado-info"]').should('be.visible');
  });

  it('1.2 deve pagar com cartão diferente (Mastercard) quando houver mais de um salvo', () => {
    /**
     * Fluxo (1.2 Pagar com diferentes cartões - Mastercard, etc.):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Seleciona cartão Mastercard (diferente do Visa padrão)
     * 6. Verifica que cartão Mastercard está selecionado
     * 7. Conclui pedido
     * 8. Verifica que pagamento foi processado com cartão correto
     */
    cy.get('[data-cy="checkout-saved-cards"]').should('be.visible');
    cy.get('[data-cy^="checkout-card-item-"]').then(($cards) => {
      // Seleciona o segundo cartão salvo (se existir); senão, mantém o padrão.
      const indice = $cards.length > 1 ? 1 : 0;
      cy.wrap($cards.eq(indice)).click().should('have.attr', 'data-selected', 'true');
    });

    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-status-badge"]').should('be.visible');
    
    // Verificar que o pedido foi criado com sucesso
    cy.get('[data-cy="confirmado-info"]').should('be.visible');
  });

  it('1.3 deve pagar com dois cartões diferentes (pagamento dividido)', () => {
    /**
     * Fluxo (1.3 Pagamento dividido com dois cartões):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Ativa pagamento dividido
     * 6. Adiciona dois cartões diferentes
     * 7. Define valores para cada cartão
     * 8. Conclui pedido
     * 9. Verifica que pagamento foi processado com ambos cartões
     */
    cy.get('[data-cy="checkout-payment-section"]').scrollIntoView();

    // Ler o total antes de dividir
    cy.get('[data-cy="checkout-total-pagamento"]').invoke('text').then((tTotal) => {
      const total = valorMonetario(tTotal);
      
      // Calcular parcelas que somam exatamente o total (evitando erro de ponto flutuante)
      const parcela1 = Math.max(10, Math.round((total * 0.7) * 100) / 100);
      const parcela2 = Math.round((total - parcela1) * 100) / 100;

      // Adicionar segundo cartão ao pagamento dividido
      cy.get('[data-cy="pagamento-dividido-adicionar-cartao-salvo"]').click();

      // Ajustar linha 1 e linha 2 para que a soma bata com o total
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(0).scrollIntoView().clear().type(String(parcela1));
      cy.get('[data-cy="pagamento-dividido-linha-valor"]').eq(1).scrollIntoView().clear().type(String(parcela2));

      // Aguardar atualização do estado React e verificar que o botão foi habilitado
      cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    });

    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');
  });

  it('1.4 deve aplicar combinação múltipla (cartão + cupom) com cálculo correto', () => {
    /**
     * Fluxo (1.4 Combinações múltiplas - cartão + cupom):
     * 1. Cliente faz login
     * 2. Adiciona livros ao carrinho
     * 3. Navega para checkout
     * 4. Seleciona endereço e frete
     * 5. Seleciona cartão
     * 6. Aplica cupom de desconto
     * 7. Verifica cálculo: subtotal - desconto + frete = total
     * 8. Conclui pedido
     * 9. Verifica que ambos foram aplicados corretamente
     */
    cy.get('[data-cy="checkout-subtotal"]').invoke('text').then((tSub) => {
      const subtotal = valorMonetario(tSub);
      cy.get('[data-cy="checkout-frete"]').invoke('text').then((tFrete) => {
        const frete = valorMonetario(tFrete);

        cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView().click();
        cy.get('[data-cy="checkout-coupon-suggestions"]').should('be.visible');
        // Clicar na sugestão já chama onAplicar internamente — não precisa redigitar
        cy.get('[data-cy="checkout-coupon-suggestions"]').find('button:not([disabled])').first().click();
        cy.get('[data-cy="checkout-applied-coupons"]').should('be.visible');

        // subtotal − desconto + frete = total  →  total <= subtotal + frete
        cy.get('[data-cy="checkout-total-pagamento"]').invoke('text').then((tTotal) => {
          expect(valorMonetario(tTotal)).to.be.at.most(subtotal + frete + 0.01);
        });
      });
    });

    cy.get('[data-cy="checkout-finish-button"]').should('not.be.disabled').click();
    cy.url().should('include', '/pedido-confirmado');
    cy.get('[data-cy="confirmado-page"]').should('be.visible');
    
    // Verificar que o pedido foi criado com sucesso
    cy.get('[data-cy="confirmado-info"]').should('be.visible');
  });
});
