import { viewports } from '../support/utils'; // I should create this utility or just inline it.

describe('Responsividade Geral das Páginas', () => {
  const sizes: Cypress.ViewportPreset[] = ['iphone-6', 'ipad-2', 'macbook-15'];

  sizes.forEach((size) => {
    context(`Resolução: ${size}`, () => {
      beforeEach(() => {
        cy.viewport(size);
      });

      it('Header deve se adaptar e elementos continuarem visíveis', () => {
        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.get('.header-top-inner').should('be.visible');
        
        if (size === 'iphone-6') {
            cy.get('.header-top-inner').should('have.css', 'flex-direction', 'column');
            cy.get('.search-bar').should('have.css', 'margin', '15px 0px');
        } else if (size === 'ipad-2') {
             cy.get('.header-top-inner').should('have.css', 'flex-direction', 'column');
             cy.get('.search-bar').should('have.css', 'margin', '15px 0px');
        } else {
             // macbook-15
             cy.get('.header-top-inner').should('have.css', 'flex-direction', 'row');
             cy.get('.search-bar').should('have.css', 'margin', '0px 30px');
        }
      });

      it('Footer deve ajustar as colunas', () => {
        cy.visit('/');
        cy.scrollTo('bottom');
        cy.get('.footer').should('be.visible');
        cy.get('.footer-content').should('be.visible');
      });

      it('Página Home Principal', () => {
        cy.visit('/');
        cy.get('.pagina-inicio__banner').should('be.visible');
        cy.get('.grade--produto').should('be.visible');
      });

      it('Página Detalhes do Livro', () => {
        cy.visit('/livro/1'); // Assume book ID 1 exists
        cy.get('.detalhes-grid').should('be.visible');
        if (size === 'iphone-6' || size === 'ipad-2') {
            cy.get('.detalhes-grid').should('have.css', 'display', 'flex');
            cy.get('.detalhes-grid').should('have.css', 'flex-direction', 'column');
        } else {
            cy.get('.detalhes-grid').should('have.css', 'display', 'grid');
        }
      });

      it('Página do Carrinho', () => {
        cy.visit('/carrinho');
        cy.get('.carrinho-resumo').should('be.visible');
        if (size === 'iphone-6' || size === 'ipad-2') {
            cy.get('.carrinho-resumo').should('have.css', 'flex-direction', 'column');
        } else {
            cy.get('.carrinho-resumo').should('have.css', 'flex-direction', 'row');
        }
      });
    });
  });
});
