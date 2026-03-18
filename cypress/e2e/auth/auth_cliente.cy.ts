import { LoginPage } from '../../support/pages/auth/LoginPage';
import { RegisterPage } from '../../support/pages/auth/RegisterPage';
import { Header } from '../../support/pages/layout/Header';
import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Auth - Fluxos de Registro, Login e Gestão de Perfil do Cliente', () => {

  beforeEach(() => {
    // Intercepta todas as chamadas para a API e adiciona o header do banco de testes
    cy.intercept('**', (req) => {
      const apiUrl = Cypress.env('apiUrl');
      if (req.url.includes(apiUrl)) {
        req.headers['x-use-test-db'] = 'true';
      }
    });
  });

  context('Autenticação de Cliente', () => {
    it('deve logar como cliente e validar informações no Header', () => {
      cy.fixture('auth/login_cliente_sucesso').then((json) => {
        cy.intercept('POST', '**/auth/login', json).as('loginRequest');
        cy.login(json.dados.user.email, 'password123');
        cy.wait('@loginRequest');
        Header.verifyLoggedIn(json.dados.user.nome);
      });
    });
  });

  context('Registro de Novo Cliente (Fluxo Completo)', () => {
    const dynamicCpf = () => {
      const n = () => Math.floor(Math.random() * 10).toString();
      return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
    };

    const getNewUser = () => ({
      nome: 'João Silva',
      cpf: dynamicCpf(),
      email: `joao.novo.${Date.now()}.${Math.floor(Math.random() * 1000)}@email.com`,
      senha: 'StrongPass@2026'
    });

    beforeEach(() => {
      cy.visit('/minha-conta');
      LoginPage.toggleRegister();
    });

    it('deve validar senha forte e permitir registro com sucesso através do stepper', () => {
      const newUser = getNewUser();
      // Usando API real, sem stub de POST
      cy.intercept('POST', '**/clientes/registro').as('registerRequest');

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
      
      cy.contains(`Bem-vindo, ${newUser.nome}!`).should('be.visible');
    });

    it('deve exibir erro ao informar um CPF inválido (Caminho de Falha)', () => {
      const newUser = getNewUser();
      const userInvalidCpf = { ...newUser, cpf: '123' };
      
      RegisterPage.fillStep1(userInvalidCpf);
      RegisterPage.goToNextStep();
      
      cy.contains('CPF inválido. Use 000.000.000-00 ou apenas 11 números.').should('be.visible');
    });

    it('deve exibir erro ao informar uma senha fraca (Caminho de Falha)', () => {
      const newUser = getNewUser();
      const userWeakPass = { ...newUser, senha: '123' };
      
      RegisterPage.fillStep1(userWeakPass);
      RegisterPage.goToNextStep();
      
      cy.contains('A senha deve conter pelo menos 8 caracteres').should('be.visible');
    });

    it('deve exibir erro quando as senhas não coincidem (Caminho de Falha)', () => {
      const newUser = getNewUser();
      RegisterPage.fillStep1(newUser);
      RegisterPage.confirmacaoSenhaInput.clear().type('Diferente123!');
      
      RegisterPage.goToNextStep();
      
      cy.contains('As senhas não coincidem').should('be.visible');
    });
  });

  context('Gestão de Perfil do Cliente', () => {
    let testUser: any;

    before(() => {
      const n = () => Math.floor(Math.random() * 10).toString();
      const dCpf = `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
      testUser = {
        nome: 'Perfil Tester',
        cpf: dCpf,
        email: `tester.perfil.${Date.now()}@email.com`,
        senha: '@asdfJKLÇ123',
        confirmacaoSenha: '@asdfJKLÇ123'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: testUser
      });
    });

    beforeEach(() => {
      cy.session(`session-perfil-${testUser.email}`, () => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/auth/login`,
          headers: { 'x-use-test-db': 'true' },
          body: {
            email: testUser.email,
            senha: testUser.senha
          }
        }).then((response) => {
          const { token, user: userData } = response.body.dados;
          window.sessionStorage.setItem('les_auth_session', JSON.stringify({
            token,
            user: userData
          }));
        });
      });
    });

    it('deve permitir visualizar e navegar pelas seções do perfil', () => {
      cy.visit('/perfil');
      ProfilePage.title.should('contain', 'Meu Perfil');
      
      ProfilePage.navigateToTab('enderecos');
      ProfilePage.navigateToTab('cartoes');
      ProfilePage.navigateToTab('senha');
      cy.contains('h2', 'Alterar Senha').should('be.visible');
    });

    it('deve permitir solicitar a inativação da conta', () => {
      cy.visit('/perfil');
      
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
