import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Administrador - Perfil - Troca de Senha', () => {
  const email = 'cristiana@gmail.com';
  const senhaAtual = 'admin@asdfJKLÇ123';
  const novaSenha = 'admin@asdfJKLÇ1234';

  beforeEach(() => {
    cy.session(`session-senha-admin-${email}`, () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        headers: { 'x-use-test-db': 'true' },
        body: { email: email, senha: senhaAtual }
      }).then((response) => {
        const { token, user: userData } = response.body.dados;
        window.sessionStorage.setItem('les_auth_session', JSON.stringify({ token, user: userData }));
      });
    });
    cy.visit('/perfil');
    ProfilePage.navigateToTab('senha');
  });

  it('deve permitir alterar a senha de administrador com sucesso', () => {
    cy.wait(1000);

    ProfilePage.currentPasswordInput.type(senhaAtual);
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordInput.type(novaSenha);
    cy.wait(2000);

    ProfilePage.submitPasswordButton.click();

    ProfilePage.successMessage.should('be.visible').and('contain', 'Senha altreada!');
    cy.wait(2000);

    // Validar login com a nova senha
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: email, senha: novaSenha }
    }).its('status').should('eq', 200);
  });
});
