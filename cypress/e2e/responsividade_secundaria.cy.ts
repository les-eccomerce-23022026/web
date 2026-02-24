

describe('Responsividade das Páginas Secundárias', () => {
  const sizes: Cypress.ViewportPreset[] = ['iphone-6', 'macbook-15'];

  sizes.forEach((size) => {
    context(`Resolução: ${size}`, () => {
      beforeEach(() => {
        cy.viewport(size);
      });

      it('Página de Login / Minha Conta flexibilidade', () => {
        cy.visit('/minha-conta');
        cy.get('.auth-page').should('be.visible');
        if (size === 'iphone-6') {
            cy.get('.auth-page').should('have.css', 'flex-direction', 'column');
            cy.get('.login-box-card').should('have.css', 'width').and('not.eq', '400px');
            cy.get('.login-box-card').invoke('width').should('be.lessThan', 400);
        } else {
             cy.get('.auth-page').should('have.css', 'flex-direction', 'row');
        }
      });

      it('Página de Checkout layout não quebra', () => {
        cy.visit('/checkout');
        cy.get('.checkout-grid').should('be.visible');
        if (size === 'iphone-6') {
             cy.get('.checkout-grid').should('have.css', 'display', 'flex');
             cy.get('.checkout-grid').should('have.css', 'flex-direction', 'column');
        } else {
             cy.get('.checkout-grid').should('have.css', 'display', 'grid');
        }
      });

      it('Painel Administrativo empilha sidebar e conteúdo', () => {
        cy.visit('/admin');
        cy.get('.dashboard-grid').should('be.visible');
        if (size === 'iphone-6') {
             cy.get('.dashboard-grid').should('have.css', 'display', 'flex');
             cy.get('.dashboard-grid').should('have.css', 'flex-direction', 'column');
             cy.get('.painel-graficos').should('have.css', 'display', 'flex');
             cy.get('.painel-graficos').should('have.css', 'flex-direction', 'column');
        } else {
             cy.get('.dashboard-grid').should('have.css', 'display', 'grid');
        }
      });
    });
  });
});
