/// <reference types="cypress" />
describe('Home do Catálogo - Conteúdo Realista', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve exibir livros com títulos e autores diversificados', () => {
    // Não deve ter o texto "Capa Livro 1" nas imagens (indicativo de placeholder genérico)
    cy.get('.cartao-livro__capa').each(($img) => {
      const src = $img.attr('src');
      expect(src).to.not.contain('text=Capa+Livro');
    });

    // Os títulos não devem ser repetitivos (ex: "O Senhor dos Anéis 1", "2", ...)
    const titulos: string[] = [];
    cy.get('.cartao-livro__titulo').each(($el) => {
      titulos.push($el.text());
    }).then(() => {
      const distinctTitulos = new Set(titulos);
      expect(distinctTitulos.size).to.be.greaterThan(1);
      expect(titulos[0]).to.not.equal(titulos[1]);
    });
  });
});
