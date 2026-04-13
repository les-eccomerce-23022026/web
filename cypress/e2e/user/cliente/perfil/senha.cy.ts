import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Cliente - Perfil - Troca de Senha', () => {
  let testUser: { nome: string; cpf: string; email: string; senha: string };
  const novaSenha = 'NovaSenha@2026Forte';

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
    });
  });

  beforeEach(() => {
    cy.registerAndLoginClienteSession(testUser, 'session-senha');
    cy.visit('/perfil');
    ProfilePage.navigateToTab('senha');
  });

  it('deve permitir alterar a senha com sucesso', () => {
    ProfilePage.currentPasswordInput.type(testUser.senha);
    ProfilePage.currentPasswordToggle.click();
    
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.newPasswordToggle.click();
    
    ProfilePage.confirmNewPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordToggle.click();

    ProfilePage.submitPasswordButton.click();

    ProfilePage.successMessage.should('be.visible').and('contain', 'Senha alterada!');

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: testUser.email, senha: novaSenha }
    }).its('status').should('eq', 200);
  });

  it('deve validar erro ao errar a senha atual', () => {
    ProfilePage.currentPasswordInput.type('SenhaErrada123');
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordInput.type(novaSenha);

    ProfilePage.submitPasswordButton.click();

    ProfilePage.errorMessage.should('be.visible');
  });

  it('deve validar erro ao confirmar senha nova incorretamente', () => {
    ProfilePage.currentPasswordInput.type(testUser.senha);
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordInput.type('Diferente123');

    ProfilePage.submitPasswordButton.click();

    ProfilePage.errorMessage.should('be.visible').and('contain', 'Verifique os campos de senha.');
  });
});
