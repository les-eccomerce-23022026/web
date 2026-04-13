import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Administrador - Perfil - Troca de Senha', () => {
  const email = 'cristiana@gmail.com';
  const senhaAtual = 'admin@asdfJKLÇ123';
  const novaSenha = 'admin@asdfJKLÇ1234';

  beforeEach(() => {
    cy.loginWithSession(email, senhaAtual, 'session-senha-admin');
    cy.visit('/perfil');
    ProfilePage.navigateToTab('senha');
  });

  it('deve permitir alterar a senha de administrador com sucesso', () => {
    ProfilePage.currentPasswordInput.type(senhaAtual);
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordInput.type(novaSenha);

    ProfilePage.submitPasswordButton.click();

    ProfilePage.successMessage.should('be.visible').and('contain', 'Senha altreada!');
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: email, senha: novaSenha }
    }).its('status').should('eq', 200);
  });
});
