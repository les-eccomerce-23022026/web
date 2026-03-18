import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Cliente - Perfil - Troca de Senha', () => {
  let testUser: any;

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
    cy.session(`session-senha-${testUser.email}`, () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        headers: { 'x-use-test-db': 'true' },
        body: { email: testUser.email, senha: testUser.senha }
      }).then((response) => {
        const { token, user: userData } = response.body.dados;
        window.sessionStorage.setItem('les_auth_session', JSON.stringify({ token, user: userData }));
      });
    });
    cy.visit('/perfil');
    ProfilePage.navigateToTab('senha');
  });

  it('deve permitir alterar a senha com sucesso', () => {
    const novaSenha = 'NovaSenha123!';
    cy.wait(1000);

    ProfilePage.currentPasswordInput.type(testUser.senha);
    ProfilePage.newPasswordInput.type(novaSenha);
    ProfilePage.confirmNewPasswordInput.type(novaSenha);
    cy.wait(2000); // Pausa para ver preenchimento

    ProfilePage.submitPasswordButton.click();

    ProfilePage.successMessage.should('be.visible').and('contain', 'Senha altreada!');
    cy.wait(2000); // Pausa para ver sucesso

    // Tentar login com a nova senha para validar
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      headers: { 'x-use-test-db': 'true' },
      body: { email: testUser.email, senha: novaSenha }
    }).its('status').should('eq', 200);
    
    // Atualizar testUser para as próximas iterações se houver
    testUser.senha = novaSenha;
  });

  it('deve validar erro ao errar a senha atual', () => {
    cy.wait(1000);
    ProfilePage.currentPasswordInput.type('SenhaErrada123');
    ProfilePage.newPasswordInput.type('NovaSenha456!');
    ProfilePage.confirmNewPasswordInput.type('NovaSenha456!');
    cy.wait(2000);

    ProfilePage.submitPasswordButton.click();

    ProfilePage.errorMessage.should('be.visible');
    cy.wait(2000);
  });

  it('deve validar erro ao confirmar senha nova incorretamente', () => {
    cy.wait(1000);
    ProfilePage.currentPasswordInput.type(testUser.senha);
    ProfilePage.newPasswordInput.type('NovaSenha456!');
    ProfilePage.confirmNewPasswordInput.type('Diferente123');
    cy.wait(2000);

    ProfilePage.submitPasswordButton.click();

    ProfilePage.errorMessage.should('be.visible').and('contain', 'Verifique os campos de senha.');
    cy.wait(2000);
  });
});
