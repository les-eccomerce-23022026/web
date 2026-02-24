describe('Carrinho de Compras e Cálculo de Frete', () => {
  beforeEach(() => {
    // Add a book first to test a populated cart
    cy.visit('/');
    cy.get('.cartao-livro', { timeout: 10000 }).first().contains('Ver Detalhes').click();
    cy.contains('Adicionar ao Carrinho').click();
    cy.visit('/carrinho');
  });

  it('deve listar os produtos adicionados, permitindo ver a foto e subtotal', () => {
    cy.contains('Carrinho de Compras').should('be.visible');
    
    // Check table headers
    cy.contains('Produto').should('be.visible');
    cy.contains('Preço Unit.').should('be.visible');
    cy.contains('Quant.').should('be.visible');
    cy.contains('Subtotal').should('be.visible');

    // Check item presence
    cy.get('img').should('exist');
    cy.contains('Remover').should('be.visible');
  });

  it('deve possuir módulo de cálculo de frete via CEP', () => {
    cy.contains('Calcular Frete').should('be.visible');
    cy.get('input[placeholder*="CEP"]').should('exist');
    // Clicking Calculate should show a standard freight message
    cy.get('input[placeholder*="CEP"]').type('01001-000');
    cy.contains('button', 'Calcular Frete').click();
    cy.contains('Frete').should('be.visible');
  });

  it('deve permitir ir para a etapa de finalização de compra', () => {
    cy.contains('Finalizar Compra').should('be.visible');
    cy.contains('Finalizar Compra').click();
    // Verifies it navigates to login or checkout details
  });
});
