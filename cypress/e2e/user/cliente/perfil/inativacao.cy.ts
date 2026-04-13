import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Inativação de Conta', () => {
  let testUser: ITestUser;

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
    });
  });

  beforeEach(() => {
    cy.registerAndLoginClienteSession(testUser, 'session-inativar');
  });

  it('deve permitir inativar a própria conta (Zona de Perigo)', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('perigo');

    ProfilePage.deleteAccountButton.should('be.visible').click();
    cy.get('h2').contains('Inativar Conta').should('be.visible');

    ProfilePage.genericModalConfirmButton.click();
    cy.get('body').then(($body) => {
      if ($body.text().includes('Conta inativada com sucesso!')) {
        cy.contains('Conta inativada com sucesso!').should('be.visible');
      }
    });

    cy.visit('/perfil');
    cy.url().should('not.include', '/perfil');
  });
});
