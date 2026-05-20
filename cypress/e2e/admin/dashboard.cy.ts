describe('Admin — Dashboard Administrativo', () => {

  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  context('Acesso e Autenticação', () => {
    it('deve acessar /admin/dashboard como administrador', () => {
      cy.visit('/admin/dashboard');
      
      cy.url().should('include', '/admin/dashboard');
    });

    it('deve redirecionar para login se não autenticado', () => {
      cy.clearCookies();
      cy.visit('/admin/dashboard');
      
      cy.url().should('include', '/login');
    });
  });

  context('Fidelidade ao Protótipo e Estrutura', () => {
    it('deve possuir a estrutura de classes de KPI igual ao HTML base', () => {
      cy.visit('/admin/dashboard');
      
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
      cy.visit('/admin/dashboard');
      
      cy.get('.painel-graficos').should('exist');
      cy.get('.painel-grafico').should('have.length.at.least', 2);
    });
  });

  context('KPIs com Dados Reais', () => {
    it('deve exibir KPI de Total de Vendas com valor numérico', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Total de Vendas').should('exist');
      cy.get('.painel-kpi').contains('Total de Vendas').parent().find('.painel-kpi__valor').should('not.be.empty');
    });

    it('deve exibir KPI de Pedidos Pendentes com valor numérico', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Pedidos Pendentes').should('exist');
      cy.get('.painel-kpi').contains('Pedidos Pendentes').parent().find('.painel-kpi__valor').should('not.be.empty');
    });

    it('deve exibir KPI de Livros Baixo Estoque com valor numérico', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Livros Baixo Estoque').should('exist');
      cy.get('.painel-kpi').contains('Livros Baixo Estoque').parent().find('.painel-kpi__valor').should('not.be.empty');
    });

    it('deve exibir KPI de Clientes Ativos com valor numérico', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Clientes Ativos').should('exist');
      cy.get('.painel-kpi').contains('Clientes Ativos').parent().find('.painel-kpi__valor').should('not.be.empty');
    });

    it('deve carregar dados reais da API', () => {
      cy.visit('/admin/dashboard');
      
      cy.request('/api/admin/dashboard').then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('totalVendas');
        expect(response.body).to.have.property('pedidosPendentes');
        expect(response.body).to.have.property('livrosBaixoEstoque');
      });
    });
  });

  context('Gráficos com Dados Reais', () => {
    it('deve exibir gráfico de vendas por período', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Vendas por Período').should('exist');
    });

    it('deve exibir gráfico de categorias mais vendidas', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Categorias Mais Vendidas').should('exist');
    });
  });

  context('Modernização e Padrões Visuais', () => {
    it('deve conter ícones profissionais (SVGs) e não emojis', () => {
      cy.visit('/admin/dashboard');
      
      cy.get('.painel-kpi__icone').each(($el) => {
        const text = $el.text().trim();
        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        expect(text).not.to.match(emojiRegex);
        cy.wrap($el).find('svg').should('exist');
      });
    });

    it('deve ter alinhamento consistente e tipografia profissional', () => {
      cy.visit('/admin/dashboard');
      
      cy.get('.painel-kpi__info').each(($el) => {
        expect($el.css('display')).to.equal('flex');
        expect($el.css('flex-direction')).to.equal('column');
      });
      cy.get('.painel-kpi__valor').should('have.css', 'font-weight', '800');
    });
  });

  context('Navegação Rápida', () => {
    it('deve permitir navegação rápida para pedidos pendentes', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Pedidos Pendentes').click();
      
      cy.url().should('include', '/admin/pedidos');
    });

    it('deve permitir navegação rápida para livros baixo estoque', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Livros Baixo Estoque').click();
      
      cy.url().should('include', '/admin/estoque');
    });
  });
});
