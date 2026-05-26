import { ProfilePage } from '../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../support/interfaces';

describe('Clientes — Gerenciar Cartões', () => {
  let testUser: ITestUser;

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
        expect(response.status).to.eq(200);
        expect(response.body?.dados?.user).to.exist;
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
      ProfilePage.addCardButton.scrollIntoView().should('be.visible').click();
      const nomeDono = `TESTER ${bandeira.nome} ${Date.now()}`;
      
      ProfilePage.fillCard({
        numero: bandeira.numero,
        nome: nomeDono,
        bandeira: bandeira.nome,
        validade: '12/2030',
        cvv: '123'
      });
      
      ProfilePage.saveCardButton.scrollIntoView().should('be.visible').click();
      
      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Cartão salvo');
      
      cy.contains(nomeDono).should('be.visible');
      
      // Se for o primeiro, define como preferencial para testar o badge
      if (index === 0) {
        ProfilePage.getPreferredButton(0).scrollIntoView().should('be.visible').click();
        ProfilePage.preferredCardBadge.should('be.visible');
      }
    });

    // Validar que todos estão na lista e realizar trocas sucessivas de preferencial
    bandeiras.forEach((b) => {
      cy.contains(b.nome).should('be.visible');
      
      // Encontra o botão de preferencial para este cartão específico e clica se ele existir
      // (se já for o preferencial, o botão não aparece, então pulamos)
      cy.get('body').then(($body) => {
        const selector = `[data-cy^="cartao-item-"]:contains("${b.nome}") [data-cy^="cartao-preferencial-button-"]`;
        if ($body.find(selector).length > 0) {
          cy.get(selector).scrollIntoView().should('be.visible').click();
          ProfilePage.preferredCardBadge.should('be.visible');
        }
      });
    });

    // Editar o último para garantir que a edição funciona com Amex
    const novoNomeAmex = 'AMEX ALTERADO';
    ProfilePage.getEditButton('cartao', 3).scrollIntoView().should('be.visible').click();
    ProfilePage.cardNomeInput.scrollIntoView().should('be.visible').clear().type(novoNomeAmex);
    ProfilePage.saveCardButton.scrollIntoView().should('be.visible').click();
    
    // Valida feedback de sucesso via toast de notificação
    cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
      .should('be.visible')
      .and('have.attr', 'data-cy-notification-type', 'success')
      .and('contain', 'Cartão atualizado');
    
    cy.contains(novoNomeAmex).should('be.visible');

    // Remover um por um para limpar e testar exclusão múltipla
    bandeiras.forEach(() => {
      ProfilePage.getDeleteButton('cartao', 0).scrollIntoView().should('be.visible').click();
      
      // Valida o modal com data-cy específico
      cy.get('[data-cy="modal-overlay"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Remover Cartão');
      
      ProfilePage.genericModalConfirmButton.scrollIntoView().should('be.visible').click();
      
      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Cartão removido');
    });
  });
});
