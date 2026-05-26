import { Header } from '../../support/pages/layout/Header';
import { LoginPage } from '../../support/pages/auth/LoginPage';

describe('Autenticação — Login Cliente', () => {

  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve exibir o formulário de login com os campos corretos', () => {
    cy.contains('h2', 'Já sou Cliente').should('be.visible');
    LoginPage.emailInput.should('be.visible');
    LoginPage.passwordInput.should('be.visible');
  });

  it('deve exibir mensagem de erro ao inserir credenciais inválidas', () => {
    LoginPage.emailInput.type('usuario@invalido.com');
    LoginPage.passwordInput.type('senhaIncorreta');
    LoginPage.submitButton.click();

    LoginPage.errorMessage
      .should('be.visible')
      .and('contain', 'E-mail ou senha inválidos');
  });

  it('deve realizar login e validar o estado do Header', () => {
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    const email = 'clientetest@email.com';
    const senha = '@asdfJKLÇ123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { email, senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      const nome = response.body.dados?.user?.nome;
      expect(nome).to.be.a('string');

      LoginPage.emailInput.type(email);
      LoginPage.passwordInput.type(senha);

      LoginPage.submitButton.click();
      
      Header.verifyLoggedIn(nome);
      
      Header.logout();
      Header.verifyLoggedOut();
    });
  });

  // Nota: O componente atual mostra ambos os formulários (login e cadastro) lado a lado
  // não há mais botão de alternância, então este teste foi removido
});
