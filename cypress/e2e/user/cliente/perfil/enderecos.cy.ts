import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Cliente - Perfil - Gestão de Endereços', () => {
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
    cy.session(`session-enderecos-${testUser.email}`, () => {
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
  });

  it('deve permitir adicionar e remover endereços', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('enderecos');

    // Adicionar
    ProfilePage.addAddressButton.click();
    const apelido = 'Trabalho ' + Date.now();
    ProfilePage.fillAddress({
      apelido,
      logradouro: 'Av Paulista',
      numero: '1000',
      cep: '01310-100',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    });
    ProfilePage.saveAddressButton.click();
    cy.contains('Endereço salvo!').should('be.visible');

    // Remover
    cy.get(`[data-cy^="endereco-delete-button-"]`).last().click();
    ProfilePage.genericModalConfirmButton.click();
    cy.contains('Endereço removido!').should('be.visible');
  });
});
