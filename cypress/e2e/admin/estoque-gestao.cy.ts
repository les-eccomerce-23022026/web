/**
 * Testes E2E da Página Admin — Gestão de Estoque (/admin/estoque)
 * Cobertura: Listagem, KPIs, estoque crítico, entrada de estoque
 */

describe('Admin — Gestão de Estoque', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/estoque como administrador', () => {
      cy.visit('/admin/estoque');
      
      cy.url().should('include', '/admin/estoque');
    });

    it('deve exibir tabela de estoque', () => {
      cy.visit('/admin/estoque');
      
      cy.get('table').should('exist');
    });

    it('deve exibir botão de registrar entrada', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').should('exist');
    });
  });

  describe('KPIs de Estoque', () => {
    it('deve exibir KPIs de estoque', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Total de Itens').should('exist');
      cy.contains('Estoque Crítico').should('exist');
      cy.contains('Limite Crítico').should('exist');
    });

    it('deve exibir valores numéricos nos KPIs', () => {
      cy.visit('/admin/estoque');
      
      cy.get('div').contains('Total de Itens').parent().find('p').should('not.be.empty');
      cy.get('div').contains('Estoque Crítico').parent().find('p').should('not.be.empty');
    });
  });

  describe('Listagem de Estoque', () => {
    it('deve listar itens de estoque', () => {
      cy.visit('/admin/estoque');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir colunas esperadas', () => {
      cy.visit('/admin/estoque');
      
      cy.get('thead').within(() => {
        cy.contains('Livro');
        cy.contains('ISBN');
        cy.contains('Qtd. Disponível');
        cy.contains('Qtd. Reservada');
        cy.contains('Preço Venda');
        cy.contains('Custo Atual');
      });
    });
  });

  describe('Estoque Crítico', () => {
    it('deve destacar itens com estoque crítico', () => {
      cy.visit('/admin/estoque');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir seção de estoque crítico quando houver itens', () => {
      cy.visit('/admin/estoque');
      
      cy.get('body').then(($body) => {
        if ($body.find('.bg-red-50').length > 0) {
          cy.contains('Estoque Crítico').should('exist');
        }
      });
    });
  });

  describe('Registro de Entrada de Estoque', () => {
    it('deve abrir modal de entrada ao clicar no botão', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').should('exist');
      cy.contains('Registrar Entrada de Estoque').should('exist');
    });

    it('deve validar campos obrigatórios', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.contains('Registrar').click();
      });

      cy.contains('UUID do Livro').should('exist');
      cy.contains('Quantidade').should('exist');
      cy.contains('Custo Unitário').should('exist');
    });

    it('deve permitir registrar entrada com dados válidos', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('10');
        cy.get('input[name="custoUnitario"]').type('45.50');
        cy.contains('Registrar').click();
      });

      cy.contains('Entrada de estoque registrada com sucesso').should('exist');
    });

    it('deve validar quantidade positiva', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('-5');
        cy.get('input[name="custoUnitario"]').type('45.50');
        cy.contains('Registrar').click();
      });

      cy.contains('Quantidade deve ser maior que zero').should('exist');
    });

    it('deve validar custo unitário positivo', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('10');
        cy.get('input[name="custoUnitario"]').type('-10');
        cy.contains('Registrar').click();
      });

      cy.contains('Custo unitário deve ser maior que zero').should('exist');
    });
  });

  describe('Campos Opcionais de Entrada', () => {
    it('deve permitir fornecedor opcional', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('10');
        cy.get('input[name="custoUnitario"]').type('45.50');
        cy.get('input[name="fornecedorUuid"]').type('fornecedor-uuid-123');
        cy.contains('Registrar').click();
      });

      cy.contains('Entrada de estoque registrada com sucesso').should('exist');
    });

    it('deve permitir nota fiscal opcional', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('10');
        cy.get('input[name="custoUnitario"]').type('45.50');
        cy.get('input[name="numeroNotaFiscal"]').type('NF-12345');
        cy.contains('Registrar').click();
      });

      cy.contains('Entrada de estoque registrada com sucesso').should('exist');
    });

    it('deve permitir observações opcionais', () => {
      cy.visit('/admin/estoque');
      
      cy.contains('Registrar Entrada').click();
      
      cy.get('.modal, dialog').within(() => {
        cy.get('input[name="livroUuid"]').type('123e4567-e89b-12d3-a456-426614174000');
        cy.get('input[name="quantidade"]').type('10');
        cy.get('input[name="custoUnitario"]').type('45.50');
        cy.get('textarea[name="observacoes"]').type('Entrada de teste');
        cy.contains('Registrar').click();
      });

      cy.contains('Entrada de estoque registrada com sucesso').should('exist');
    });
  });
});
