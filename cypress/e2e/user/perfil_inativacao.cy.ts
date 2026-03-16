import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Perfil - Inativação de Conta', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/clientes/perfil', {
      statusCode: 200,
      body: { 
        sucesso: true, 
        dados: { uuid: "u1", nome: "João", role: "cliente", enderecos: [], cartoes: [] } 
      }
    }).as('getPerfil');
    cy.visit('/perfil');
    cy.wait('@getPerfil');
    cy.get('body').should('not.contain', 'Carregando');
    ProfilePage.navigateToTab('perigo');
  });

  it('deve permitir solicitar a inativação e desistir no modal', () => {
    ProfilePage.deleteAccountButton.click();
    cy.contains('Confirmar').should('be.visible');
    ProfilePage.genericModalCancelButton.click();

    // Deve continuar na página
    cy.url().should('include', '/perfil');
    cy.contains('Zona de Perigo').should('be.visible');
  });

  it('deve inativar a conta com sucesso e deslogar o usuário', () => {
    cy.intercept('DELETE', '**/clientes/perfil', {
      statusCode: 200,
      body: { sucesso: true, dados: { message: "Conta inativada" } }
    }).as('deleteRequest');

    ProfilePage.deleteAccountButton.click();
    ProfilePage.genericModalConfirmButton.should('be.visible').click();

    cy.wait('@deleteRequest');
    
    // Após inativar o app deve deslogar. O redirecionamento pode variar.
    cy.url().then((url) => {
      expect(url === Cypress.config().baseUrl + '/' || url.includes('/minha-conta')).to.be.true;
    });
    
    // Header deve mostrar link de login
    cy.getDataCy('header-login-link').should('be.visible');
    cy.getDataCy('header-user-profile').should('not.exist');
  });
});
