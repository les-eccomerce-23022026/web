import { Header } from '../../support/pages/layout/Header';

describe('Auth - Permissões do Cliente', () => {

  it('deve garantir que o cliente acesse seu perfil mas não a área de gestão administrativa', () => {
    // 1. Logar como cliente de forma rápida
    cy.loginProgramatico('cliente');

    // 2. Bloqueio Admin: Tentar acesso direto à gestão
    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');

    // 3. Acesso Válido: Entrar na área de perfil
    cy.visit('/perfil');
    cy.url().should('include', '/perfil');
    
    // Resiliência: Garantir fim de loadings
    cy.get('body', { timeout: 20000 }).should('not.contain', 'Carregando');
    
    // Verificações visuais de renderização
    cy.get('h1', { timeout: 15000 }).should('be.visible').and('contain', 'Meu Perfil');
    cy.contains('Dados Pessoais').should('be.visible');
    cy.contains('📍 Endereços').should('be.visible');
  });
});
