/**
 * Testes E2E da Página Admin — Gestão de Administradores (/admin/administradores)
 * Cobertura: Listagem, registro, inativação, ativação, atualização
 */

describe('Admin — Gestão de Administradores', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/administradores como administrador mestre', () => {
      cy.visit('/admin/administradores');
      
      cy.url().should('include', '/admin/administradores');
    });

    it('deve exibir tabela de administradores', () => {
      cy.visit('/admin/administradores');
      
      cy.get('table').should('exist');
    });
  });

  describe('Listagem de Administradores', () => {
    it('deve listar administradores existentes', () => {
      cy.visit('/admin/administradores');
      
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir colunas esperadas', () => {
      cy.visit('/admin/administradores');
      
      cy.get('thead').within(() => {
        cy.contains('Nome');
        cy.contains('Email');
        cy.contains('Status');
        cy.contains('Ações');
      });
    });
  });

  describe('Registro de Novo Administrador', () => {
    it('deve permitir registrar novo administrador', () => {
      cy.visit('/admin/administradores');
      
      cy.contains('Novo Administrador').click();
      
      cy.get('input[name="nome"]').type('Admin Teste');
      cy.get('input[name="email"]').type('admin-teste@example.com');
      cy.get('input[name="senha"]').type('Senha123!');
      cy.get('input[name="confirmarSenha"]').type('Senha123!');
      
      cy.contains('Registrar').click();
      
      cy.contains('Administrador registrado com sucesso').should('exist');
    });

    it('deve validar senhas diferentes', () => {
      cy.visit('/admin/administradores');
      
      cy.contains('Novo Administrador').click();
      
      cy.get('input[name="nome"]').type('Admin Teste');
      cy.get('input[name="email"]').type('admin-teste2@example.com');
      cy.get('input[name="senha"]').type('Senha123!');
      cy.get('input[name="confirmarSenha"]').type('Senha456!');
      
      cy.contains('Registrar').click();
      
      cy.contains('Senhas não conferem').should('exist');
    });
  });

  describe('Inativação de Administrador', () => {
    it('deve permitir inativar administrador', () => {
      cy.visit('/admin/administradores');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Inativar').click();
      });

      cy.get('.modal, dialog').should('exist');
      cy.get('input[name="motivo"]').type('Teste de inativação');
      cy.contains('Confirmar').click();

      cy.contains('Administrador inativado com sucesso').should('exist');
    });
  });

  describe('Ativação de Administrador', () => {
    it('deve permitir ativar administrador inativo', () => {
      cy.visit('/admin/administradores');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Ativar').click();
      });

      cy.get('.modal, dialog').should('exist');
      cy.get('input[name="motivo"]').type('Teste de ativação');
      cy.contains('Confirmar').click();

      cy.contains('Administrador ativado com sucesso').should('exist');
    });
  });

  describe('Atualização de Administrador', () => {
    it('deve permitir atualizar dados de administrador', () => {
      cy.visit('/admin/administradores');
      
      cy.get('tbody tr').first().within(() => {
        cy.contains('Editar').click();
      });

      cy.get('input[name="nome"]').clear().type('Nome Atualizado');
      cy.contains('Salvar').click();

      cy.contains('Administrador atualizado com sucesso').should('exist');
    });
  });
});
