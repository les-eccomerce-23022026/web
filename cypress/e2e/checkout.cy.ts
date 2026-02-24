describe('Checkout (Finalização de Compra)', () => {
  beforeEach(() => {
    // Presumindo navegação via carrinho
    cy.visit('/checkout');
  });

  it('deve exibir as etapas do checkout na barra de progresso', () => {
    cy.contains('h1', 'Finalizar Compra').should('be.visible');
    cy.contains('1. Identificação').should('exist');
    cy.contains('2. Entrega').should('exist');
    cy.contains('3. Pagamento').should('exist');
  });

  it('deve listar o endereço de entrega do mock', () => {
    // Baseado no checkoutMock.json ("Rua Bela Vista")
    cy.contains('Endereço de Entrega').should('be.visible');
    cy.contains('Rua Bela Vista').should('exist');
    cy.contains('a', 'Alterar endereço').should('be.visible');
  });

  it('deve oferecer componentes para a etapa de pagamento (múltiplos cartões, cupons)', () => {
    cy.contains('Forma de Pagamento (Cartões)').should('be.visible');
    cy.get('select').find('option').contains('Selecionar Cartão Salvo').should('exist');
    cy.contains('button', '+ Novo Cartão').should('be.visible');
    
    // Pagamento com múltiplos cartões
    cy.contains('label', 'Pagar valor parcial com este cartão (Múltiplos Cartões)').should('be.visible');
    cy.contains('button', 'Adicionar Pagamento').should('exist');
    
    // Cupons promocionais
    cy.contains('Cupons de Troca / Promocional').should('be.visible');
    cy.get('input[placeholder="Código do cupom"]').should('exist');
    cy.contains('button', 'Aplicar').should('be.visible');
  });

  it('deve possuir resumo do pedido e botão de finalizar', () => {
    cy.contains('h3', 'Resumo do Pedido').should('be.visible');
    cy.contains('Subtotal').should('exist');
    cy.contains('Frete:').should('exist');
    cy.contains('Cupons Aplicados:').should('exist');
    cy.contains('span', 'Total a Pagar:').should('be.visible');
    
    cy.contains('button', 'Concluir Pedido').should('be.visible');
  });
});
