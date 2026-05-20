import { ProfilePage } from '../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../support/interfaces';

describe('Clientes — Inativação de Conta (RN0008)', () => {
  let testUser: ITestUser;

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: { ...testUser, confirmacaoSenha: testUser.senha }
      });
    });
  });

  beforeEach(() => {
    cy.session(`session-inativar-${testUser.email}`, () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        headers: { 'x-use-test-db': 'true' },
        body: { email: testUser.email, senha: testUser.senha }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body?.dados?.user).to.exist;
      });
    });
  });

  it('deve permitir inativar a própria conta (Zona de Perigo)', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('perigo');

    ProfilePage.deleteAccountButton.should('be.visible').click();
    
    // Valida modal de perigo usando data-cy específico
    cy.get('[data-cy="modal-overlay"]').should('be.visible');
    cy.get('[data-cy="modal-title"]').should('contain', 'Inativar Conta');

    ProfilePage.genericModalConfirmButton.click();
    
    // Valida feedback de sucesso via toast de notificação
    cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
      .should('be.visible')
      .and('have.attr', 'data-cy-notification-type', 'success')
      .and('contain', 'Conta inativada');

    // Deve redirecionar para login ou home e o acesso deve ser negado
    cy.visit('/perfil');
    cy.url().should('not.include', '/perfil');
  });
});
