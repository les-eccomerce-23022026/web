import { Header } from '../../support/pages/layout/Header';

describe('Autenticação — Permissões Administrativas', () => {

  context('Visibilidade e Proteção de Rotas', () => {
    it('deve exibir o link de administração apenas para administradores', () => {
      const { email, senha } = Cypress.env('cliente') || { email: '', senha: '' };
      
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(email);
      cy.get('[data-cy="login-password-input"]').type(senha);
      cy.get('[data-cy="login-submit-button"]').click();
      
      cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
      cy.visit('/');
      Header.adminLink.should('not.exist');
      
      Header.logout();

      const { email: adminEmail, senha: adminSenha } = Cypress.env('admin') || { email: '', senha: '' };
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(adminEmail);
      cy.get('[data-cy="login-password-input"]').type(adminSenha);
      cy.get('[data-cy="login-submit-button"]').click();
      
      cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
      cy.visit('/');
      Header.adminLink.should('be.visible').and('have.attr', 'href', '/admin');
    });

    it('deve impedir acesso de usuários não autenticados a rotas admin', () => {
      cy.visit('/admin/livros', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve permitir acesso de administradores a rotas protegidas', () => {
      const { email, senha } = Cypress.env('admin') || { email: '', senha: '' };
      
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(email);
      cy.get('[data-cy="login-password-input"]').type(senha);
      cy.get('[data-cy="login-submit-button"]').click();
      
      cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
      cy.visit('/admin/administradores');
      cy.url().should('include', '/admin/administradores');
    });
  });

  context('Persistência de Sessão', () => {
    it('deve manter o administrador autenticado após F5', () => {
      const { email, senha } = Cypress.env('admin') || { email: '', senha: '' };
      
      cy.visit('/minha-conta');
      cy.get('[data-cy="login-email-input"]', { timeout: 10000 }).should('be.visible').type(email);
      cy.get('[data-cy="login-password-input"]').type(senha);
      cy.get('[data-cy="login-submit-button"]').click();
      cy.url().should('not.include', '/minha-conta', { timeout: 10000 });
      cy.visit('/admin/administradores'); 
      cy.reload();
      cy.url().should('include', '/admin/administradores');
    });
  });
});
