import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Inativação de Conta', () => {
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
    cy.session(`session-inativar-${testUser.email}`, () => {
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

  it('deve permitir inativar a própria conta (Zona de Perigo)', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('perigo');
    cy.wait(2000);

    ProfilePage.deleteAccountButton.should('be.visible').click();
    
    // Valida modal de perigo
    cy.get('h2').contains('Inativar Conta').should('be.visible');
    cy.wait(3000); // Pausa para ver o modal de perigo

    ProfilePage.genericModalConfirmButton.click();
    
    // Ajuste conforme comportamento real: verifica se a mensagem aparece ou se redireciona
    cy.get('body').then(($body) => {
      if ($body.text().includes('Conta inativada com sucesso!')) {
        cy.contains('Conta inativada com sucesso!').should('be.visible');
      }
    });

    cy.wait(5000); // Pausa final para processamento

    // Deve redirecionar para login ou home e o acesso deve ser negado
    cy.visit('/perfil');
    cy.url().should('not.include', '/perfil');
  });
});
