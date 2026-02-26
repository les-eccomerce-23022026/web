describe('Home / Catálogo de Produtos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve exibir o cabeçalho com logo, barra de busca e links de ação', () => {
    cy.get('header').should('be.visible');
    cy.contains('LES Livraria').should('be.visible');
    cy.get('input[placeholder*="Buscar por título"]').should('exist');
    cy.contains('Minha Conta').should('be.visible');
    cy.contains('Carrinho').should('be.visible');
    cy.contains('Admin').should('be.visible');
  });

  it('deve exibir a navegação secundária com categorias', () => {
    const categorias = ['Ficção', 'Não-Ficção', 'Romance', 'Fantasia', 'Técnico e Científico', 'Infantil'];
    categorias.forEach(cat => {
      cy.get('nav').contains(cat).should('be.visible');
    });
  });

  it('deve exibir o banner de ofertas', () => {
    cy.contains('Ofertas de Inverno').should('be.visible');
  });

  it('deve renderizar o grid de livros destacados', () => {
    cy.contains('Lançamentos Destacados').should('be.visible');
    cy.get('.cartao-livro').should('have.length.at.least', 1);
    
    // Validar o conteúdo de um livro
    cy.get('.cartao-livro').first().within(() => {
      cy.get('img').should('exist');
      cy.get('h4').should('not.be.empty'); // Título
      cy.get('p').should('not.be.empty'); // Autor e Preço
      cy.contains('Ver Detalhes').should('be.visible');
    });
  });

  it('deve navegar para os detalhes do livro ao clicar em "Ver Detalhes"', () => {
    cy.get('.cartao-livro').first().contains('Ver Detalhes').click();
    cy.url().should('include', '/livro/');
  });
});
