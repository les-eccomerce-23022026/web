describe('Dashboard e Gestão de Livros Admin', () => {
  beforeEach(() => {
    cy.visit('/admin/livros');
  });

  it('deve listar os livros em formato de tabela com colunas corretas', () => {
    cy.contains('Gestão de Catálogo (Livros)').should('be.visible');
    
    // Check table headers
    cy.contains('th', 'Cód. Produto').should('exist');
    cy.contains('th', 'Título do Livro').should('exist');
    cy.contains('th', 'Autor(es)').should('exist');
    cy.contains('th', 'Categoria').should('exist');
    cy.contains('th', 'Status').should('exist');
    cy.contains('th', 'Ações Rápidas').should('exist');
  });

  it('deve possuir campo de busca e filtro de status', () => {
    cy.get('input[placeholder*="Buscar"]').should('exist');
    cy.get('select.filter-select').find('option').contains('Apenas Ativos').should('exist');
  });

  it('deve permitir acesso para criação de novo livro e ver botões de ação', () => {
    cy.contains('+ Novo Livro').should('exist');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    cy.get('table tbody tr').first().within(() => {
      cy.get('.btn-icon-admin.edit').should('be.visible');
      cy.get('.btn-icon-admin').should('have.length.at.least', 2);
    });
  });
});
