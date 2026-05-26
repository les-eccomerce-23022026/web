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
      cy.wait(1000);

      RegisterPage.goToNextStep();
      
      cy.scrollTo('top');
      cy.contains('Contato e Senha').should('be.visible');
      cy.wait(1000);

      // Preencher Passo 2 - Telefone e Senha
      RegisterPage.dddInput.clear().type('11');
      RegisterPage.telefoneInput.clear().type('999887766');
      RegisterPage.senhaInput.clear().type('Senha@123');
      RegisterPage.confirmacaoSenhaInput.clear().type('Senha@123');
      cy.wait(1000);

      RegisterPage.finish();
      
      cy.wait('@registerRequest').then((interception) => {
        cy.log('Status da resposta:', interception.response?.statusCode);
        cy.log('Body da resposta:', JSON.stringify(interception.response?.body));
      });
      
      cy.contains(`Bem-vindo, ${newUser.nome}! Cadastro realizado com sucesso.`, { timeout: 10000 }).should('be.visible');
      cy.wait(1000);
    });
  });

  it('deve exibir erro ao informar um CPF inválido', () => {
    cy.getNewUser().then((newUser) => {
      const userInvalidCpf = { ...newUser, cpf: '123.456.789-00' };
      
      cy.scrollTo('top');
      RegisterPage.fillStep1(userInvalidCpf);
      cy.wait(1000);

      cy.contains('CPF inválido. Verifique os dígitos informados.').should('be.visible');
      cy.wait(1000);
    });
  });

});
