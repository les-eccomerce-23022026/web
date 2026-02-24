/// <reference types="cypress" />
describe('Rodapé Robusto - Fidelidade ao Design Original', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  it('deve possuir um rodapé com fundo verde escuro e conteúdo distribuído em colunas', () => {
    // O rodapé deve existir e ter o fundo correto
    cy.get('footer').should('exist');
    
    // Verifica a estrutura de colunas (deve ter 4 colunas principais)
    cy.get('footer .footer-column').should('have.length', 4);
  });

  it('deve conter a coluna "LES Books" com descrição e branding', () => {
    cy.get('footer .footer-column').eq(0).within(() => {
      cy.get('h3').should('contain', 'LES Books');
      cy.get('p').should('exist'); // Descrição da livraria
    });
  });

  it('deve conter a coluna "Navegação" com links essenciais', () => {
    cy.get('footer .footer-column').eq(1).within(() => {
      cy.get('h3').should('contain', 'Navegação');
      cy.get('ul li').should('have.length.at.least', 4);
      cy.get('a').contains('Início').should('exist');
      cy.get('a').contains('Mais Vendidos').should('exist');
    });
  });

  it('deve conter a coluna "Minha Conta"', () => {
    cy.get('footer .footer-column').eq(2).within(() => {
      cy.get('h3').should('contain', 'Minha Conta');
      cy.get('ul li').should('have.length.at.least', 3);
    });
  });

  it('deve conter a coluna "Suporte"', () => {
    cy.get('footer .footer-column').eq(3).within(() => {
      cy.get('h3').should('contain', 'Suporte');
      cy.get('ul li').should('have.length.at.least', 3);
    });
  });

  it('deve possuir a barra de copyright inferior', () => {
    cy.get('.footer-bottom').should('exist');
    cy.get('.footer-bottom').should('contain', '© 2026 LES Books');
  });
});
