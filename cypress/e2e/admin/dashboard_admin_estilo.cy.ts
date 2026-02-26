describe('Estilo do Dashboard Admin - Fidelidade ao Protótipo', () => {
  beforeEach(() => {
    // Interceptar a API falsa se necessário ou apenas carregar a página
    cy.visit('/admin');
  });

  it('deve possuir a estrutura de classes de KPI igual ao HTML base', () => {
    // Verificar se o container principal de kpis existe com a classe correta
    cy.get('.painel-kpis').should('exist');

    // Verificar os cards individuais (devem ser pelo menos 4 ou 6)
    cy.get('.painel-kpi').should('have.length.at.least', 4);

    // Verificar se a estrutura interna flexbox do KPI está montada com BEM
    cy.get('.painel-kpi').first().within(() => {
      // Ícone lateral
      cy.get('.painel-kpi__icone').should('exist');
      
      // Conteúdo textual
      cy.get('.painel-kpi__info').should('exist');
      cy.get('.painel-kpi__info').within(() => {
        cy.get('.painel-kpi__valor').should('exist');
        cy.get('.painel-kpi__rotulo').should('exist');
      });
    });
  });

  it('deve possuir a estrutura de gráficos do painel', () => {
    cy.get('.painel-graficos').should('exist');
    cy.get('.painel-grafico').should('have.length.at.least', 2);
    cy.get('.painel-grafico').first().within(() => {
      cy.get('.painel-grafico__titulo').should('exist');
    });
  });
});
