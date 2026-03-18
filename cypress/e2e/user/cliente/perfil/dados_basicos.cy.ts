import { ProfilePage } from '../../../../support/pages/user/ProfilePage';

describe('Cliente - Perfil - Dados Básicos e Críticos', () => {
  let testUser: any;

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
    // Esperar o perfil carregar (o campo de nome deve ser populado)
    ProfilePage.nomeInput.should('not.have.value', '', { timeout: 15000 });
  });

  describe('Dados Não Críticos', () => {
    it('deve permitir alterar nome e gênero simultaneamente sem exigir senha', () => {
      const novoNome = 'Nome Alterado ' + Date.now();
      
      ProfilePage.nomeInput.clear().type(novoNome);
      ProfilePage.generoSelect.select('Feminino');
      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      
      // Validar persistência
      cy.reload();
      ProfilePage.nomeInput.should('have.value', novoNome);
      ProfilePage.generoSelect.should('have.value', 'Feminino');
    });

    it('deve permitir alterar a data de nascimento sem exigir senha', () => {
      const novaData = '1995-05-15';
      
      ProfilePage.nascimentoInput.clear().type(novaData);
      ProfilePage.saveProfileButton.click();

      cy.contains('Dados atualizados com sucesso!', { timeout: 10000 }).should('be.visible');
      
      cy.reload();
      ProfilePage.nascimentoInput.should('have.value', novaData);
    });
  });

  describe('Dados Críticos', () => {
    it('deve exigir senha para alterar o e-mail', () => {
      const novoEmail = `novo_email_${Date.now()}@teste.com`;
      
      ProfilePage.emailInput.clear().type(novoEmail);
      ProfilePage.saveProfileButton.click();

      ProfilePage.passwordConfirmInput.should('be.visible');
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfil');
      
      ProfilePage.confirmWithPassword(testUser.senha);

      cy.wait('@updatePerfil').its('response.statusCode').should('eq', 200);

      cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');

      // No reload, o e-mail virá mascarado. Ex: n***9@teste.com
      cy.reload();
      ProfilePage.emailInput.should('not.have.value', '');
      ProfilePage.emailInput.invoke('val').then((val: any) => {
        expect(val).to.contain('*'); // Deve estar mascarado
        expect(val).to.contain('@teste.com'); // Deve manter o domínio
      });
    });

    it('deve exigir senha para alteração mista (nome + telefone)', () => {
      const novoNomeMisto = 'Nome Misto ' + Date.now();
      const novoTelefone = '11988887777';

      ProfilePage.nomeInput.clear().type(novoNomeMisto);
      ProfilePage.telInput.clear().type(novoTelefone);
      ProfilePage.saveProfileButton.click();

      ProfilePage.passwordConfirmInput.should('be.visible');
      
      cy.intercept('PATCH', '**/clientes/perfil').as('updatePerfilMisto');
      
      ProfilePage.confirmWithPassword(testUser.senha);

      cy.wait('@updatePerfilMisto').its('response.statusCode').should('eq', 200);
      cy.contains(/Dados atualizados/i, { timeout: 10000 }).should('be.visible');

      cy.reload();
      ProfilePage.nomeInput.should('have.value', novoNomeMisto);
      
      // Telefone mascarado. Ex: (11) 9****-7777
      ProfilePage.telInput.invoke('val').then((val: any) => {
        const cleanVal = val.replace(/\D/g, '');
        // Deve conter o DDD e o final do número se a máscara for padrão
        expect(cleanVal).to.contain('11');
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
