import { ProfilePage } from '../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../support/interfaces';

describe('Clientes — Gerenciar Endereços', () => {
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
    cy.session(`session-enderecos-${testUser.email}`, () => {
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
  });

  it('deve permitir gerenciar múltiplos tipos de endereços', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('enderecos');

    const enderecos = [
      { apelido: 'Casa de Veraneio', logradouro: 'Alameda das Flores', numero: '123', cep: '12345-678', bairro: 'Bairro A', cidade: 'Cidade A', estado: 'SP', tipoResidencia: 'Casa', tipoLogradouro: 'Alameda' },
      { apelido: 'Apartamento Trabalho', logradouro: 'Av Paulista', numero: '1000', cep: '01310-100', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', tipoResidencia: 'Apartamento', tipoLogradouro: 'Avenida' }
    ];

    enderecos.forEach((end) => {
      ProfilePage.addAddressButton.scrollIntoView().should('be.visible').click();
      ProfilePage.fillAddress(end);
      
      // Selects adicionais conforme regras de negócio
      cy.get('[data-cy="endereco-tipo-residencia-select"]').scrollIntoView().should('be.visible').select(end.tipoResidencia);
      cy.get('[data-cy="endereco-tipo-logradouro-select"]').scrollIntoView().should('be.visible').select(end.tipoLogradouro);

      ProfilePage.saveAddressButton.scrollIntoView().should('be.visible').click();
      
      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Endereço salvo');
      
      cy.contains(end.apelido).should('be.visible');
    });

    // Editar o primeiro endereço
    ProfilePage.getEditButton('endereco', 0).scrollIntoView().should('be.visible').click();
    const apelidoEditado = 'EDITADO ' + Date.now();
    ProfilePage.addressApelidoInput.scrollIntoView().should('be.visible').clear().type(apelidoEditado);
    ProfilePage.saveAddressButton.scrollIntoView().should('be.visible').click();
    
    // Valida feedback de sucesso via toast de notificação
    cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
      .should('be.visible')
      .and('have.attr', 'data-cy-notification-type', 'success')
      .and('contain', 'Endereço atualizado');
    
    cy.contains(apelidoEditado).should('be.visible');

    // Remover um por um com confirmação visível
    enderecos.forEach(() => {
      ProfilePage.getDeleteButton('endereco', 0).scrollIntoView().should('be.visible').click();
      
      // Valida o modal com data-cy específico
      cy.get('[data-cy="modal-overlay"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Remover Endereço');
      
      ProfilePage.genericModalConfirmButton.scrollIntoView().should('be.visible').click();
      
      // Valida feedback de sucesso via toast de notificação
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'data-cy-notification-type', 'success')
        .and('contain', 'Endereço removido');
    });
  });
});
