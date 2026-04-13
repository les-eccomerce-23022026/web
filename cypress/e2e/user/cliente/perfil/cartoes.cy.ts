import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Gestão de Cartões', () => {
  let testUser: ITestUser;

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
    });
  });

  beforeEach(() => {
    cy.registerAndLoginClienteSession(testUser, 'session-cartoes');
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
      
      if (index === 0) {
        ProfilePage.getPreferredButton(0).click({ force: true });
        ProfilePage.preferredCardBadge.should('be.visible');
      }
    });

    bandeiras.forEach((b) => {
      cy.contains(b.nome).should('be.visible');
      cy.get('body').then(($body) => {
        const selector = `[data-cy^="cartao-item-"]:contains("${b.nome}") [data-cy^="cartao-preferencial-button-"]`;
        if ($body.find(selector).length > 0) {
          cy.get(selector).click({ force: true });
          ProfilePage.preferredCardBadge.should('be.visible');
        }
      });
    });

    const novoNomeAmex = 'AMEX ALTERADO';
    ProfilePage.getEditButton('cartao', 3).click({ force: true });
    ProfilePage.cardNomeInput.clear({ force: true }).type(novoNomeAmex, { force: true });
    ProfilePage.saveCardButton.click({ force: true });
    cy.contains('Cartão atualizado!').should('be.visible');
    cy.contains(novoNomeAmex).should('be.visible');

    bandeiras.forEach(() => {
      ProfilePage.getDeleteButton('cartao', 0).click({ force: true });
      cy.get('h2').contains('Remover Cartão').should('be.visible');
      ProfilePage.genericModalConfirmButton.click({ force: true });
      cy.contains('Cartão removido!').should('be.visible');
    });
  });
});
