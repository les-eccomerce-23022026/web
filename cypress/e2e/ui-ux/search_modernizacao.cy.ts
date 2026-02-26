describe("Modernização da Barra de Pesquisa", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("deve exibir a barra de pesquisa com estilização moderna", () => {
    // Verifica a estrutura básica
    cy.get(".search-bar").should("be.visible");
    // Agora verifica se a lupa é um SVG (Silhueta do Lucide-React) em vez de um texto/emoji
    cy.get(".search-bar .header-search-icon svg").should("be.visible");
    cy.get(".search-bar input").should("be.visible");
    cy.get(".search-btn").should("be.visible").and("contain.text", "Buscar");

    // Testes de Estilização Moderna
    // 1. Container com bordas arredondadas e overflow hidden
    cy.get(".search-bar").should("have.css", "border-radius", "25px");
    cy.get(".search-bar").should("have.css", "overflow", "hidden");

    // 2. Sombras sutis (box-shadow) na barra container
    cy.get(".search-bar").should("have.css", "box-shadow").and("not.equal", "none");

    // 3. Cores do Design System e gradiente aprimorado no botão
    cy.get(".search-btn").should("have.css", "background-image").and("include", "linear-gradient");
  });

  it("deve ter efeitos visuais ao interagir", () => {
    // Foco no input
    cy.get(".search-bar input").focus();
    // Verifica se a borda da barra muda para a cor secundária (foco via focus-within)
    cy.get(".search-bar").should("have.css", "border-color", "rgb(210, 180, 140)"); 
  });
});
