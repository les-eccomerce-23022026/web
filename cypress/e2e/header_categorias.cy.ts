/// <reference types="cypress" />
describe('Navegação do Header - Categorias Completas', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  it('deve exibir a lista completa de categorias do design original', () => {
    const categoriasEsperadas = [
      'Ficção',
      'Não-Ficção',
      'Romance',
      'Fantasia',
      'Suspense',
      'Terror',
      'Biografias',
      'Autoajuda',
      'Infantil',
      'Técnico e Científico'
    ];

    cy.get('.nav-links').within(() => {
      categoriasEsperadas.forEach(cat => {
        cy.contains('a', cat).should('exist');
      });
      
      // Verifica o destaque de "Mais Vendidos"
      cy.contains('a', '🔥 Mais Vendidos').should('exist');
    });
  });
});
