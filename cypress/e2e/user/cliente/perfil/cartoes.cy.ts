import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Cliente - Perfil - Gestão de Cartões', () => {
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
    cy.session(`session-cartoes-${testUser.email}`, () => {
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

  it('deve permitir gerenciar cartões de crédito', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('cartoes');

    // Adicionar
    ProfilePage.addCardButton.click();
    const nomeCartao = 'TESTER ' + Date.now();
    ProfilePage.fillCard({
      numero: '4444555566667777',
      nome: nomeCartao,
      bandeira: 'Visa',
      validade: '12/2030',
      cvv: '123'
    });
    ProfilePage.saveCardButton.click();
    cy.contains('Cartão salvo!').should('be.visible');

    // Remover
    cy.get(`[data-cy^="cartao-delete-button-"]`).last().click();
    ProfilePage.genericModalConfirmButton.click();
    cy.contains('Cartão removido!').should('be.visible');
  });
});
