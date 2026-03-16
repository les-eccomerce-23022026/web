import { LoginPage } from '../../support/pages/auth/LoginPage';
import { Header } from '../../support/pages/layout/Header';

describe('Auth - Login e Fluxo de Cadastro Inicial', () => {
  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve exibir o formulário de login com os campos corretos', () => {
    cy.contains('h2', 'Já sou Cliente').should('be.visible');
    LoginPage.emailInput.should('be.visible');
    LoginPage.passwordInput.should('be.visible');
    LoginPage.submitButton.should('be.visible').and('contain', 'Entrar');
  });

  it('deve realizar login simulado e atualizar o estado do Header', () => {
    // Usando Fixture externa
    cy.fixture('auth/login_cliente_sucesso').then((json) => {
      cy.intercept('POST', '**/auth/login', json).as('loginRequest');
      
      LoginPage.fill('joao@teste.com', 'senha123');
      LoginPage.submit();
      
      cy.wait('@loginRequest');

      // Validação centralizada no Header Page Object
      Header.verifyLoggedIn(json.dados.user.nome);
      
      Header.logout();
      Header.verifyLoggedOut();
    });
  });

  it('deve exibir e permitir alternar para a área de criação de nova conta', () => {
    cy.contains('h2', 'Quero me Cadastrar').should('be.visible');
    LoginPage.toggleRegister();
    
    cy.contains('h2', 'Criar Conta').should('be.visible');
    cy.getDataCy('register-nome-input').should('be.visible');
  });
});
