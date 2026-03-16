import { LoginPage } from '../../support/pages/auth/LoginPage';
import { RegisterPage } from '../../support/pages/auth/RegisterPage';
import { Header } from '../../support/pages/layout/Header';
import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Auth - Fluxos de Registro, Login e Gestão de Perfil (CRUD)', () => {

  context('Autenticação de Usuários', () => {
    it('deve logar como cliente e validar informações no Header', () => {
      cy.fixture('auth/login_cliente_sucesso').then((json) => {
        cy.intercept('POST', '**/auth/login', json).as('loginRequest');
        cy.login(json.dados.user.email, 'password123');
        cy.wait('@loginRequest');
        Header.verifyLoggedIn(json.dados.user.nome);
      });

      // Rotas admin bloqueadas
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve logar como administrador e acessar o painel administrativo', () => {
      cy.fixture('auth/login_admin_sucesso').then((json) => {
        cy.intercept('POST', '**/auth/login', json).as('loginAdmin');
        cy.login(json.dados.user.email, 'password123');
        cy.wait('@loginAdmin');
        cy.url().should('include', '/admin');
        cy.contains('h2', 'Painel Administrativo').should('be.visible');
      });
    });
  });

  context('Registro de Novo Cliente (Fluxo Completo)', () => {
    it('deve validar senha forte e permitir registro com sucesso através do stepper', () => {
      cy.intercept('POST', '**/clientes/registro', {
        statusCode: 201,
        body: { sucesso: true, dados: { message: "Cadastro realizado com sucesso." } }
      }).as('registerRequest');

      cy.visit('/minha-conta');
      LoginPage.toggleRegister();

      const newUser = {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao.novo@email.com',
        senha: 'StrongPass@2026'
      };

      RegisterPage.fillStep1(newUser);
      RegisterPage.goToNextStep();
      
      cy.contains('Endereço de Cobrança').should('be.visible');

      RegisterPage.fillAddress({
        logradouro: 'Rua das Flores',
        numero: '100',
        cep: '01234-567',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });

      RegisterPage.finish();
      cy.wait('@registerRequest');
      cy.contains('Cadastro realizado com sucesso').should('be.visible');
    });
  });

  context('Gestão de Perfil do Cliente', () => {
    beforeEach(() => {
      cy.loginProgramatico('cliente');
      
      cy.fixture('auth/login_cliente_sucesso').then((json) => {
        cy.intercept('GET', '**/clientes/perfil', json).as('getPerfil');
      });
    });

    it('deve permitir visualizar e navegar pelas seções do perfil', () => {
      cy.visit('/perfil');
      cy.wait('@getPerfil');
      
      ProfilePage.title.should('contain', 'Meu Perfil');
      
      ProfilePage.navigateToTab('enderecos');
      ProfilePage.navigateToTab('cartoes');
      ProfilePage.navigateToTab('senha');
      cy.contains('h2', 'Alterar Senha').should('be.visible');
    });

    it('deve permitir solicitar a inativação da conta', () => {
      cy.visit('/perfil');
      cy.wait('@getPerfil');
      
      cy.intercept('DELETE', '**/clientes/perfil', {
        statusCode: 200,
        body: { sucesso: true, dados: { mensagem: "Inativado" } }
      }).as('inativarRequest');

      ProfilePage.requestAccountDeletion();

      cy.wait('@inativarRequest');
      cy.url().should('include', '/minha-conta');
    });
  });
});
