describe('Estilo da Home do Catálogo - Fidelidade ao Protótipo', () => {
  beforeEach(() => {
    // Acessa a página principal (HomeCatalogo)
    cy.visit('http://localhost:5173/');
  });

  it('deve possuir a estrutura de banner principal', () => {
    // O layout do react não precisa ter o "section id" exato, mas precisa usar a classe BEM principal
    cy.get('.pagina-inicio__banner').should('exist');
    cy.get('.pagina-inicio__banner-titulo').should('exist');
  });

  it('deve possuir a estrutura de grid principal', () => {
    // Verificar se o container principal de livros usa a grade correta
    cy.get('.grade--produto').should('exist');
  });

  it('deve possuir a estrutura de classes BEM para o Cartão de Livro', () => {
    // Verificar se o card base tem a classe genérica
    cy.get('.cartao-livro').should('have.length.at.least', 1);

    // Testar estrutura interna de um cartao-livro
    cy.get('.cartao-livro').first().within(() => {
      // Container da imagem
      cy.get('.cartao-livro__capa-container').should('exist');
      cy.get('.cartao-livro__capa').should('exist');
      
      // Conteúdo textual
      cy.get('.cartao-livro__info').should('exist');
      cy.get('.cartao-livro__info').within(() => {
        cy.get('.cartao-livro__titulo').should('exist');
        cy.get('.cartao-livro__autor').should('exist');
        cy.get('.cartao-livro__avaliacao').should('exist');
        cy.get('.cartao-livro__preco-container').should('exist');
        cy.get('.cartao-livro__preco').should('exist');
      });

      // Botões de ação
      cy.get('.cartao-livro__acao').should('exist');
      cy.get('.cartao-livro__acao .botao').should('exist');
    });
  });
});
