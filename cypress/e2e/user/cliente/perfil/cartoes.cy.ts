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

    // Editar o cartão recém criado - Garantir que a lista atualizou
    cy.contains(nomeCartao).should('be.visible');
    ProfilePage.getEditButton('cartao').should('be.visible').click();
    
    // Garantir que o formulário de edição carregou o nome atual
    ProfilePage.cardNomeInput.should('have.value', nomeCartao);
    
    const novoNomeCartao = 'NOME ALTERADO ' + Date.now();
    ProfilePage.cardNomeInput.clear().type(novoNomeCartao);

    // Interceptar para debug
    cy.intercept('PATCH', '**/clientes/perfil/cartoes/**').as('editCard');
    ProfilePage.saveCardButton.click();
    
    cy.wait('@editCard').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
    
    cy.contains('Cartão atualizado!', { timeout: 10000 }).should('be.visible');
    cy.contains(novoNomeCartao).should('be.visible');

    // Definir como preferencial
    ProfilePage.getPreferredButton().click();
    ProfilePage.preferredCardBadge.should('be.visible');

    // Remover
    ProfilePage.getDeleteButton('cartao').last().click();
    ProfilePage.genericModalConfirmButton.click();
    cy.contains('Cartão removido!').should('be.visible');
  });
});
