import { Header } from '../../../../support/pages/layout/Header';

describe('Administrador - Segurança e Permissões', () => {

  context('Visibilidade e Proteção de Rotas', () => {
    it('deve exibir o link de administração apenas para administradores', () => {
      cy.loginProgramatico('cliente');
      cy.visit('/');
      Header.adminLink.should('not.exist');
      
      Header.logout();

      cy.loginProgramatico('admin');
      cy.visit('/');
      Header.adminLink.should('be.visible').and('have.attr', 'href', '/admin');
    });

    it('deve impedir acesso de usuários não autenticados a rotas admin', () => {
      cy.visit('/admin/livros', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve permitir acesso de administradores a rotas protegidas', () => {
      cy.loginProgramatico('admin');
      cy.visit('/admin/administradores');
      cy.url().should('include', '/admin/administradores');
    });
  });

  context('Persistência de Sessão', () => {
    it('deve manter o administrador autenticado após F5', () => {
      cy.loginProgramatico('admin');
      cy.visit('/admin/administradores'); 
      cy.reload();
      cy.url().should('include', '/admin/administradores');
    });
  });
});
