describe('Cliente - Segurança e Acesso', () => {

  it('deve garantir que o cliente acesse seu perfil mas não a área administrativa', () => {
    cy.loginProgramatico('cliente');

    // Bloqueio Admin
    cy.visit('/admin/administradores', { failOnStatusCode: false });
    cy.url().should('not.include', '/admin');

    // Acesso Válido
    cy.visit('/perfil');
    cy.url().should('include', '/perfil');
    cy.get('h1').should('contain', 'Meu Perfil');
  });
});
