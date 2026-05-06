import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Dados Básicos e Críticos', () => {
  let testUser: ITestUser;

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: { ...testUser, confirmacaoSenha: testUser.senha }
      });
    });
  });

  beforeEach(() => {
    cy.session(`session-perfil-${testUser.email}`, () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        headers: { 'x-use-test-db': 'true' },
        body: { email: testUser.email, senha: testUser.senha }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body?.dados?.user).to.exist;
      });
    });
    cy.visit('/perfil');
    // Esperar o perfil carregar com timeout estendido para ambientes mais lentos
    ProfilePage.nomeInput.should('not.have.value', '', { timeout: 30000 });
  });

  describe('Dados Não Críticos', () => {
    it('deve permitir alterar nome e gênero simultaneamente sem exigir senha', () => {
      // Mostrar dados atuais
      ProfilePage.nomeInput.invoke('val').then(val => cy.log('Nome Atual: ' + val));

      const novoNome = 'Nome Alterado ' + Date.now();
      ProfilePage.nomeInput.clear().type(novoNome);
      ProfilePage.generoSelect.select('Feminino');

      ProfilePage.saveProfileButton.click();

      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Dados atualizados');
      
      // Validar persistência e mostrar na tela
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

      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Dados atualizados');
      
      cy.reload();
      ProfilePage.nascimentoInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nascimentoInput.should('have.value', novaData);
    });
  });

  describe('Dados Críticos', () => {
    it('deve exigir senha para alterar o e-mail', () => {
      ProfilePage.emailInput.invoke('val').then(val => cy.log('Email Atual: ' + val));

      const novoEmail = `novo_email_${Date.now()}@teste.com`;
      ProfilePage.emailInput.clear().type(novoEmail);

      ProfilePage.saveProfileButton.click();

      // Valida o modal de confirmação de segurança com data-cy específico
      cy.get('[data-cy="modal-overlay"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Confirmação de Segurança');
      
      ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfil');
      ProfilePage.modalConfirmButton.click();

      cy.wait('@updatePerfil').its('response.statusCode').should('eq', 200);

      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', /Dados atualizados/i);

      // No reload, o e-mail virá mascarado.
      cy.reload();
      ProfilePage.emailInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.emailInput.invoke('val').then((val: string) => {
        expect(val).to.contain('*'); 
        expect(val).to.contain('@teste.com');
      });
    });

    it('deve exigir senha para alteração mista (nome + telefone)', () => {
      const novoNomeMisto = 'Nome Misto ' + Date.now();
      const novoTelefone = '11988887777';

      ProfilePage.nomeInput.clear().type(novoNomeMisto);
      ProfilePage.telInput.clear().type(novoTelefone);

      ProfilePage.saveProfileButton.click();

      // Valida o modal de confirmação de segurança com data-cy específico
      cy.get('[data-cy="modal-overlay"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Confirmação de Segurança');
      
      ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfilMisto');
      ProfilePage.modalConfirmButton.click();

      cy.wait('@updatePerfilMisto').its('response.statusCode').should('eq', 200);
      
      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', /Dados atualizados/i);

      cy.reload();
      ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nomeInput.should('have.value', novoNomeMisto);
      
      ProfilePage.telInput.invoke('val').then((val: string) => {
        expect(val).to.contain('*');
      });
    });

    it('deve garantir que o CPF é apenas leitura', () => {
      // 1. Garantir que o campo existe e é readonly
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('be.visible')
        .and('have.attr', 'readonly');
      
      // 2. Tentar interagir (não deve mudar nada)
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .scrollIntoView()
        .should('be.visible')
        .click()
        .type('99999999999');
      
      // 3. Validar valor final mascarado
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('not.have.value', '')
        .invoke('val')
        .should('contain', '*');
    });
  });
});
