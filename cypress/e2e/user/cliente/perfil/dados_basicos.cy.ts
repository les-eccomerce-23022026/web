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
        const { token, user: userData } = response.body.dados;
        window.sessionStorage.setItem('les_auth_session', JSON.stringify({ token, user: userData }));
      });
    });
    cy.visit('/perfil');
    // Esperar o perfil carregar com timeout estendido para ambientes mais lentos
    ProfilePage.nomeInput.should('not.have.value', '', { timeout: 30000 });
    cy.wait(2000); // Pausa inicial para o vídeo mostrar os dados carregados
  });

  describe('Dados Não Críticos', () => {
    it('deve permitir alterar nome e gênero simultaneamente sem exigir senha', () => {
      // Mostrar dados atuais
      ProfilePage.nomeInput.invoke('val').then(val => cy.log('Nome Atual: ' + val));
      cy.wait(1000);

      const novoNome = 'Nome Alterado ' + Date.now();
      ProfilePage.nomeInput.clear().type(novoNome);
      ProfilePage.generoSelect.select('Feminino');
      
      cy.wait(2000); // Pausa para o vídeo mostrar o novo valor digitado antes de salvar

      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      cy.wait(2000); 
      
      // Validar persistência e mostrar na tela
      cy.reload();
      ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nomeInput.should('have.value', novoNome);
      ProfilePage.generoSelect.should('have.value', 'Feminino');
      cy.wait(2000);
    });

    it('deve permitir alterar a data de nascimento sem exigir senha', () => {
      ProfilePage.nascimentoInput.invoke('val').then(val => cy.log('Data Atual: ' + val));
      cy.wait(1000);

      const novaData = '1995-05-15';
      ProfilePage.nascimentoInput.clear().type(novaData);
      
      cy.wait(2000);

      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      cy.wait(2000);
      
      cy.reload();
      ProfilePage.nascimentoInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nascimentoInput.should('have.value', novaData);
      cy.wait(2000);
    });
  });

  describe('Dados Críticos', () => {
    it('deve exigir senha para alterar o e-mail', () => {
      ProfilePage.emailInput.invoke('val').then(val => cy.log('Email Atual: ' + val));
      cy.wait(1000);

      const novoEmail = `novo_email_${Date.now()}@teste.com`;
      ProfilePage.emailInput.clear().type(novoEmail);
      
      cy.wait(2000); // Mostrar novo email antes de disparar o modal

      ProfilePage.saveProfileButton.click();

      // Valida o modal de confirmação de segurança
      cy.get('h2').contains('⚠️ Confirmação de Segurança').should('be.visible');
      cy.wait(2000); 
      
      ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
      cy.wait(1000);
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfil');
      ProfilePage.modalConfirmButton.click();

      cy.wait('@updatePerfil').its('response.statusCode').should('eq', 200);

      cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');
      cy.wait(2000);

      // No reload, o e-mail virá mascarado.
      cy.reload();
      ProfilePage.emailInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.emailInput.invoke('val').then((val: string) => {
        expect(val).to.contain('*'); 
        expect(val).to.contain('@teste.com');
      });
      cy.wait(2000);
    });

    it('deve exigir senha para alteração mista (nome + telefone)', () => {
      const novoNomeMisto = 'Nome Misto ' + Date.now();
      const novoTelefone = '11988887777';

      ProfilePage.nomeInput.clear().type(novoNomeMisto);
      ProfilePage.telInput.clear().type(novoTelefone);
      
      cy.wait(2000);

      ProfilePage.saveProfileButton.click();

      cy.get('h2').contains('⚠️ Confirmação de Segurança').should('be.visible');
      cy.wait(2000);
      
      ProfilePage.passwordConfirmInput.should('be.visible').type(testUser.senha);
      cy.wait(1000);
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfilMisto');
      ProfilePage.modalConfirmButton.click();

      cy.wait('@updatePerfilMisto').its('response.statusCode').should('eq', 200);
      cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');
      cy.wait(2000);

      cy.reload();
      ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
      ProfilePage.nomeInput.should('have.value', novoNomeMisto);
      
      ProfilePage.telInput.invoke('val').then((val: string) => {
        expect(val).to.contain('*');
      });
      cy.wait(2000);
    });

    it('deve garantir que o CPF é apenas leitura', () => {
      // 1. Garantir que o campo existe e é readonly
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('be.visible')
        .and('have.attr', 'readonly');
      
      // 2. Tentar interagir (não deve mudar nada)
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .click({ force: true })
        .type('99999999999', { force: true });
      
      // 3. Validar valor final mascarado
      cy.get('[data-cy="perfil-cpf-input"]', { timeout: 15000 })
        .should('not.have.value', '')
        .invoke('val')
        .should('contain', '*');
    });
  });
});
