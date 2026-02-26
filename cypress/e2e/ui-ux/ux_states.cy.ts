describe('UX States Management', () => {
  it('deve exibir um componente moderno de loading ao carregar a Home', () => {
    cy.visit('/?delay=2000');
    // Agora asseguramos que o loading dura tempo suficiente
    cy.get('.loading-state-container').should('be.visible');
    cy.get('.loading-state-spinner').should('exist');
    
    // Após carregar
    cy.get('.cartao-livro', { timeout: 4000 }).should('have.length.gt', 0);
    cy.get('.loading-state-container').should('not.exist');
  });

  it('deve exibir um componente de erro com botão de recarregar caso a API falhe na Home', () => {
    cy.visit('/?forceError=true');
    cy.get('.error-state-container').should('be.visible');
    cy.get('.error-state-message').should('contain', 'Ops');
    cy.get('.error-state-retry-btn').should('exist');
  });

  it('deve exibir um feedback moderno de estado vazio na Lista do Admin se não houver dados', () => {
    cy.visit('/admin/livros?forceEmpty=true');
    cy.get('.empty-state-container', { timeout: 4000 }).should('be.visible');
    cy.get('.empty-state-icon').should('exist');
    cy.get('.empty-state-title').should('contain', 'Nenhum resultado');
  });
});
