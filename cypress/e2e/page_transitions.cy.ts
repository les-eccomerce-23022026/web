describe('Page Transitions and Animations', () => {
  it('deve aplicar animação de fade in nas transições de rotas do catálogo e admin', () => {
    cy.visit('/');
    cy.get('.page-transition-enter').should('exist');
    
    // As in a normal navigation the element may re-mount or apply class on root container
    cy.get('.cartao-livro__acao .btn-secondary').first().click();
    cy.url().should('include', '/livro/');
    cy.get('.page-transition-enter').should('exist');

    cy.visit('/admin/livros');
    cy.get('.page-transition-enter').should('exist');
  });
});
