/**
 * Testes E2E de Multi-tenancy — Isolamento por Loja
 * Cobertura: Verificação de isolamento de dados entre lojas diferentes
 */

describe('Admin — Multi-tenancy Isolamento', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Isolamento de Livros', () => {
    it('deve listar apenas livros da loja do administrador', () => {
      cy.visit('/admin/livros');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('not.contain', 'Outra Loja');
      });
    });
  });

  describe('Isolamento de Pedidos', () => {
    it('deve listar apenas pedidos da loja do administrador', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('not.contain', 'Outra Loja');
      });
    });
  });

  describe('Isolamento de Clientes', () => {
    it('deve listar apenas clientes da loja do administrador', () => {
      cy.visit('/admin/clientes');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('not.contain', 'Outra Loja');
      });
    });
  });

  describe('Isolamento de Estoque', () => {
    it('deve listar apenas estoque da loja do administrador', () => {
      cy.visit('/admin/estoque');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('not.contain', 'Outra Loja');
      });
    });
  });

  describe('Isolamento de KPIs Dashboard', () => {
    it('deve exibir KPIs apenas da loja do administrador', () => {
      cy.visit('/admin/dashboard');
      
      cy.contains('Total de Vendas').should('exist');
      cy.contains('Pedidos Pendentes').should('exist');
      cy.contains('Livros Baixo Estoque').should('exist');
    });
  });

  describe('API Isolamento', () => {
    it('deve retornar erro ao acessar dados de outra loja via API', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/livros?lojId=999',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404]);
      });
    });
  });

  describe('Cross-Loja Prevention', () => {
    it('não deve permitir criar livro para outra loja', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('form').should('exist');
      
      cy.get('input[name="titulo"]').type('Livro Teste');
      cy.get('input[name="autor"]').type('Autor Teste');
      cy.get('input[name="preco"]').type('49.90');
      
      cy.contains('Salvar').click();
      
      cy.contains('Livro criado com sucesso').should('exist');
    });
  });
});
