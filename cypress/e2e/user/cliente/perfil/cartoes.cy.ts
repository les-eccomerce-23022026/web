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

  it('deve permitir gerenciar cartões de crédito de diferentes bandeiras', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('cartoes');

    const bandeiras = [
      { nome: 'Visa', numero: '4444555566667777' },
      { nome: 'Mastercard', numero: '5555666677778888' },
      { nome: 'Elo', numero: '6666777788889999' },
      { nome: 'American Express', numero: '371234567890123' }
    ];

    bandeiras.forEach((bandeira, index) => {
      ProfilePage.addCardButton.click({ force: true });
      const nomeDono = `TESTER ${bandeira.nome} ${Date.now()}`;
      
      ProfilePage.fillCard({
        numero: bandeira.numero,
        nome: nomeDono,
        bandeira: bandeira.nome,
        validade: '12/2030',
        cvv: '123'
      });
      
      ProfilePage.saveCardButton.click({ force: true });
      cy.contains('Cartão salvo!').should('be.visible');
      cy.contains(nomeDono).should('be.visible');
      
      // Se for o primeiro, define como preferencial para testar o badge
      if (index === 0) {
        ProfilePage.getPreferredButton(0).click({ force: true });
        ProfilePage.preferredCardBadge.should('be.visible');
      }

      cy.wait(500);
    });

    // Validar que todos estão na lista e realizar trocas sucessivas de preferencial
    bandeiras.forEach((b) => {
      cy.contains(b.nome).should('be.visible');
      
      // Encontra o botão de preferencial para este cartão específico e clica se ele existir
      // (se já for o preferencial, o botão não aparece, então pulamos)
      cy.get('body').then(($body) => {
        const selector = `[data-cy^="cartao-item-"]:contains("${b.nome}") [data-cy^="cartao-preferencial-button-"]`;
        if ($body.find(selector).length > 0) {
          cy.get(selector).click({ force: true });
          ProfilePage.preferredCardBadge.should('be.visible');
          cy.wait(1000); // Pausa para o vídeo
        }
      });
    });

    // Editar o último para garantir que a edição funciona com Amex
    const novoNomeAmex = 'AMEX ALTERADO';
    ProfilePage.getEditButton('cartao', 3).click({ force: true });
    ProfilePage.cardNomeInput.clear({ force: true }).type(novoNomeAmex, { force: true });
    ProfilePage.saveCardButton.click({ force: true });
    cy.contains('Cartão atualizado!').should('be.visible');
    cy.contains(novoNomeAmex).should('be.visible');

    // Remover um por um para limpar e testar exclusão múltipla
    bandeiras.forEach(() => {
      ProfilePage.getDeleteButton('cartao', 0).click({ force: true });
      cy.get('h2').contains('Remover Cartão').should('be.visible');
      ProfilePage.genericModalConfirmButton.click({ force: true });
      cy.contains('Cartão removido!').should('be.visible');
      cy.wait(500);
    });
  });
});
