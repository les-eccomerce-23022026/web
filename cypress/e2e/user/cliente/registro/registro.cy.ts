import { LoginPage } from '../../../../support/pages/auth/LoginPage';
import { RegisterPage } from '../../../../support/pages/auth/RegisterPage';

describe('Cliente - Registro (Wizard)', () => {

  beforeEach(() => {
    cy.visit('/minha-conta');
    LoginPage.toggleRegister();
  });

  it('deve permitir registro com sucesso através do stepper', () => {
    cy.getNewUser().then((newUser) => {
      cy.intercept('POST', '**/clientes/registro').as('registerRequest');

      cy.scrollTo('top'); // Garante que o header apareça
      RegisterPage.fillStep1(newUser);

      RegisterPage.goToNextStep();
      
      cy.scrollTo('top');
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
  });

  it('deve exibir erro ao informar um CPF inválido', () => {
    cy.getNewUser().then((newUser) => {
      const userInvalidCpf = { ...newUser, cpf: '123' };
      
      cy.scrollTo('top');
      RegisterPage.fillStep1(userInvalidCpf);

      RegisterPage.goToNextStep();
      
      cy.contains('CPF inválido. Use 000.000.000-00 ou apenas 11 números.').should('be.visible');
    });
  });
});
