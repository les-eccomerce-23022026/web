describe('Administrador - Dashboard (Estilo e Modernização)', () => {

  beforeEach(() => {
    cy.visit('/admin');
  });

  context('Fidelidade ao Protótipo e Estrutura', () => {
    it('deve possuir a estrutura de classes de KPI igual ao HTML base', () => {
      cy.get('.painel-kpis').should('exist');
      cy.get('.painel-kpi').should('have.length.at.least', 4);

      cy.get('.painel-kpi').first().within(() => {
        cy.get('.painel-kpi__icone').should('exist');
        cy.get('.painel-kpi__info').should('exist').within(() => {
          cy.get('.painel-kpi__valor').should('exist');
          cy.get('.painel-kpi__rotulo').should('exist');
        });
      });
    });

    it('deve possuir a estrutura de gráficos do painel', () => {
      cy.get('.painel-graficos').should('exist');
      cy.get('.painel-grafico').should('have.length.at.least', 2);
    });
  });

  context('Modernização e Padrões Visuais', () => {
    it('deve conter ícones profissionais (SVGs) e não emojis', () => {
      cy.get('.painel-kpi__icone').each(($el) => {
        const text = $el.text().trim();
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        expect(text).not.to.match(emojiRegex);
        cy.wrap($el).find('svg').should('exist');
      });
    });

    it('deve ter alinhamento consistente e tipografia profissional', () => {
      cy.get('.painel-kpi__info').each(($el) => {
        expect($el.css('display')).to.equal('flex');
        expect($el.css('flex-direction')).to.equal('column');
      });
      cy.get('.painel-kpi__valor').should('have.css', 'font-weight', '800');
    });
  });
});
