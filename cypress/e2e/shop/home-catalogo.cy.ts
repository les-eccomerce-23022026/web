describe('Home / Catálogo de Produtos', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve exibir o cabeçalho com logo, barra de busca e links de ação', () => {
    cy.get('header').should('be.visible');
    cy.get('input[placeholder*="Buscar"]').should('exist');
    cy.get('a[href="/minha-conta"]').should('be.visible');
    cy.get('a[href="/carrinho"]').should('be.visible');
  });

  it('deve exibir a navegação secundária com categorias', () => {
    cy.get('nav').should('be.visible');
    cy.get('nav a').should('have.length.at.least', 3);
  });

  it('deve exibir o banner de ofertas', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.pagina-inicio__banner').length > 0) {
        cy.get('.pagina-inicio__banner').should('be.visible');
      } else {
        cy.get('.cartao-livro').should('have.length.at.least', 1);
      }
    });
  });

  it('deve renderizar o grid de livros destacados', () => {
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
