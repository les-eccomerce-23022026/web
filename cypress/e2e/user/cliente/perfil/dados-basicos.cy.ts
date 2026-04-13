import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';
import { getClienteCreds } from '../../../../support/env';

describe('Cliente - Perfil - Dados Básicos e Críticos', () => {
  let testUser: ITestUser;

  before(() => {
    const cliente = getClienteCreds();
    testUser = {
      nome: 'Cliente Seed',
      cpf: '',
      email: cliente.email,
      senha: cliente.senha,
    };
  });

  beforeEach(() => {
    cy.session('session-perfil-seed', () => {
      cy.loginClienteSeed();
    });
    cy.visit('/perfil');
    ProfilePage.nomeInput.should('not.have.value', '', { timeout: 30000 });
  });

  describe('Dados Não Críticos', () => {
    it('deve permitir alterar nome e gênero simultaneamente sem exigir senha', () => {
      ProfilePage.nomeInput.invoke('val').then(val => cy.log('Nome Atual: ' + val));

      const novoNome = 'Nome Alterado ' + Date.now();
      ProfilePage.nomeInput.clear().type(novoNome);
      ProfilePage.generoSelect.select('Feminino');

      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      cy.reload();
      ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nomeInput.should('have.value', novoNome);
      ProfilePage.generoSelect.should('have.value', 'Feminino');
    });

    it('deve permitir alterar a data de nascimento sem exigir senha', () => {
      ProfilePage.nascimentoInput.invoke('val').then(val => cy.log('Data Atual: ' + val));

      const novaData = '1995-05-15';
      ProfilePage.nascimentoInput.clear().type(novaData);

      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      cy.reload();
      ProfilePage.nascimentoInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nascimentoInput.should('have.value', novaData);
    });
  });

  describe('Dados Críticos', () => {
    it('deve exigir senha para alterar o e-mail', () => {
      cy.get('body').then(($body) => {
        const possuiCampoEmail = $body.find('[data-cy="perfil-email-input"]').length > 0;
        if (!possuiCampoEmail) {
          cy.get('[data-cy="perfil-email-input"]').should('not.exist');
          return;
        }

        ProfilePage.emailInput.invoke('val').then(val => cy.log('Email Atual: ' + val));

        const novoEmail = `novo_email_${Date.now()}@teste.com`;
        ProfilePage.emailInput.clear().type(novoEmail);

        ProfilePage.saveProfileButton.click();

        cy.get('h2').contains('⚠️ Confirmação de Segurança').should('be.visible');
        ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
        cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfil');
        ProfilePage.modalConfirmButton.click();

        cy.wait('@updatePerfil').its('response.statusCode').should('eq', 200);

        cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');
        cy.reload();
        ProfilePage.emailInput.should('not.have.value', '', { timeout: 15000 });
        ProfilePage.emailInput.invoke('val').then((val: string) => {
          expect(val).to.contain('*');
          expect(val).to.contain('@');
        });
      });
    });

    it('deve exigir senha para alteração mista (nome + telefone)', () => {
      const novoNomeMisto = 'Nome Misto ' + Date.now();
      const novoTelefone = '11988887777';

      ProfilePage.nomeInput.clear().type(novoNomeMisto);
      ProfilePage.telInput.clear().type(novoTelefone);

      ProfilePage.saveProfileButton.click();

      cy.get('h2').contains('⚠️ Confirmação de Segurança').should('be.visible');
      ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfilMisto');
      ProfilePage.modalConfirmButton.click();

      cy.wait('@updatePerfilMisto').its('response.statusCode').should('eq', 200);
      cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');

      cy.reload();
      ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nomeInput.should('have.value', novoNomeMisto);
      
      ProfilePage.telInput.invoke('val').then((val: string) => {
        expect(val).to.contain('*');
      });
    });

    it('deve garantir que o CPF é apenas leitura', () => {
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('be.visible')
        .and('have.attr', 'readonly');

      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .click({ force: true })
        .type('99999999999', { force: true });

      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('not.have.value', '')
        .invoke('val')
        .should('contain', '*');
    });
  });
});
