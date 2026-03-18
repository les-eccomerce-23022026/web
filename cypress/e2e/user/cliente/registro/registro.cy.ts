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

      RegisterPage.fillStep1(newUser);
      cy.wait(2000); // Pausa para ver preenchimento do passo 1

      RegisterPage.goToNextStep();
      
      cy.contains('Endereço de Cobrança').should('be.visible');
      cy.wait(1000);

      RegisterPage.fillAddress({
        logradouro: 'Rua das Flores',
        numero: '100',
        cep: '01234-567',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });
      cy.wait(2000); // Pausa para ver preenchimento do endereço

      RegisterPage.finish();
      cy.wait('@registerRequest');
      
      cy.contains(`Bem-vindo, ${newUser.nome}!`).should('be.visible');
      cy.wait(3000); // Pausa final para ver boas-vindas
    });
  });

  it('deve exibir erro ao informar um CPF inválido', () => {
    cy.getNewUser().then((newUser) => {
      const userInvalidCpf = { ...newUser, cpf: '123' };
      
      RegisterPage.fillStep1(userInvalidCpf);
      cy.wait(2000);

      RegisterPage.goToNextStep();
      
      cy.contains('CPF inválido. Use 000.000.000-00 ou apenas 11 números.').should('be.visible');
      cy.wait(2000);
    });
  });
});
