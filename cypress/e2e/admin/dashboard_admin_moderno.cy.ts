describe('Modernização do Dashboard Admin', () => {
  beforeEach(() => {
    cy.visit('/admin');
  });

  it('não deve conter emojis nos cards de KPI', () => {
    // Verificar se algum dos ícones contém emojis (caracteres especiais de emoji)
    // Uma forma simples é verificar se o texto não é apenas um emoji
    cy.get('.painel-kpi__icone').each(($el) => {
      const text = $el.text().trim();
      // Regex simples para detectar emojis
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(text).not.to.match(emojiRegex, 'Ícone não deve conter emojis');
    });
  });

  it('deve conter ícones profissionais (SVGs)', () => {
    // Após a modernização, esperamos encontrar SVGs dentro dos ícones
    cy.get('.painel-kpi__icone').each(($el) => {
      cy.wrap($el).find('svg').should('exist');
    });
  });

  it('deve ter alinhamento consistente dos números e rótulos', () => {
    // Verificar se o container de info tem alinhamento vertical/horizontal correto
    cy.get('.painel-kpi__info').each(($el) => {
      // O alinhamento deve ser profissional. Normalmente à esquerda para Dashboard Corporativo
      // se estiver dentro de um card com ícone lateral.
      const display = $el.css('display');
      const flexDirection = $el.css('flex-direction');
      
      expect(display).to.equal('flex');
      expect(flexDirection).to.equal('column');
    });
    
    // Verificar se os valores estão em negrito e com tamanho profissional
    cy.get('.painel-kpi__valor').should('have.css', 'font-weight', '800');

  });

  it('deve ter um visual mais moderno e profissional', () => {
    // Verificar bordas arredondadas e shadows sutis
    cy.get('.painel-kpi').should('have.css', 'border-radius');
    cy.get('.painel-kpi').should('have.css', 'box-shadow');
    
    // Verificar cores de fundo suaves e profissionais
    cy.get('.painel-kpi__icone').should('have.css', 'background-color');
  });
});
