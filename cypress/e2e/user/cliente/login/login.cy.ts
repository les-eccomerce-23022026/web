import { Header } from '../../../../support/pages/layout/Header';
import { LoginPage } from '../../../../support/pages/auth/LoginPage';

describe('Cliente - Autenticação', () => {

  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve exibir o formulário de login com os campos corretos', () => {
    cy.contains('h2', 'Já sou Cliente').should('be.visible');
    LoginPage.emailInput.should('be.visible');
    LoginPage.passwordInput.should('be.visible');
  });

  it('deve realizar login e validar o estado do Header', () => {
    cy.fixture('auth/login_cliente_sucesso').then((json) => {
      cy.intercept('POST', '**/auth/login', json).as('loginRequest');
      
      LoginPage.emailInput.type(json.dados.user.email);
      LoginPage.passwordInput.type('password123');
      cy.wait(2000); // Pausa para ver as credenciais digitadas

      LoginPage.submitButton.click();
      cy.wait('@loginRequest');
      
      Header.verifyLoggedIn(json.dados.user.nome);
      cy.wait(2000); // Pausa para ver Header logado
      
      Header.logout();
      Header.verifyLoggedOut();
      cy.wait(2000); // Pausa para ver o logout realizado
    });
  });

  it('deve permitir alternar para a área de cadastro', () => {
    cy.wait(1000);
    LoginPage.toggleRegister();
    cy.contains('h2', 'Criar Conta').should('be.visible');
    cy.wait(2000);
  });
});
