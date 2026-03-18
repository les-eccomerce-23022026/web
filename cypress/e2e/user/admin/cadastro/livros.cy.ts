describe('Administrador - Gestão de Livros (Cadastro)', () => {

  beforeEach(() => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        dados: {
          token: 'fake-token-admin',
          user: { uuid: 'uuid-admin', nome: 'Admin', email: 'admin@gmail.com', role: 'admin' },
        }
      },
    }).as('loginAdmin');

    cy.login('admin@gmail.com', 'password123');
    cy.wait('@loginAdmin');
    cy.visit('/admin/livros');
  });

  it('deve listar os livros em formato de tabela com colunas corretas', () => {
    cy.contains('Gestão de Catálogo (Livros)').should('be.visible');
    
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

  it('deve permitir acesso para criação de novo livro', () => {
    cy.contains('+ Novo Livro').should('exist');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });
});
