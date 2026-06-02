import { LoginPage } from '../../support/pages/auth/LoginPage';
import { RegisterPage } from '../../support/pages/auth/RegisterPage';

describe('Autenticação — Registro de Cliente', () => {

  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve permitir registro com sucesso através do stepper', () => {
    cy.getNewUser().then((newUser) => {
      cy.intercept('POST', '**/clientes/registro').as('registerRequest');

      cy.scrollTo('top');
      RegisterPage.fillStep1(newUser);
      
      RegisterPage.goToNextStep();
      
      cy.scrollTo('top');
      cy.contains('Contato e Senha', { timeout: 5000 }).should('be.visible');

      // Preencher Passo 2 - Telefone e Senha
      RegisterPage.telefoneInput.clear().type('11999887766');
      RegisterPage.senhaInput.clear().type('Senha@123');
      RegisterPage.confirmacaoSenhaInput.clear().type('Senha@123');

      RegisterPage.finish();
      
      cy.wait('@registerRequest', { timeout: 15000 }).then((interception) => {
        cy.log('Status da resposta:', interception.response?.statusCode);
        cy.log('Body da resposta:', JSON.stringify(interception.response?.body));
      });
      
      cy.contains(`Bem-vindo, ${newUser.nome}! Cadastro realizado com sucesso.`, { timeout: 10000 }).should('be.visible');
    });
  });

  it('deve exibir erro ao informar um CPF inválido', () => {
    cy.getNewUser().then((newUser) => {
      const userInvalidCpf = { ...newUser, cpf: '123.456.789-00' };
      
      cy.scrollTo('top');
      RegisterPage.fillStep1(userInvalidCpf);

      cy.contains('CPF inválido. Verifique os dígitos informados.', { timeout: 5000 }).should('be.visible');
    });
  });

});
