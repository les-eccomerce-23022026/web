import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Gestão de Endereços', () => {
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
        const { token, user: userData } = response.body.dados;
        window.sessionStorage.setItem('les_auth_session', JSON.stringify({ token, user: userData }));
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
      ProfilePage.addAddressButton.click({ force: true });
      ProfilePage.fillAddress(end);
      
      // Selects adicionais conforme regras de negócio
      cy.get('[data-cy="endereco-tipo-residencia-select"]').select(end.tipoResidencia, { force: true });
      cy.get('[data-cy="endereco-tipo-logradouro-select"]').select(end.tipoLogradouro, { force: true });

      ProfilePage.saveAddressButton.click({ force: true });
      cy.contains('Endereço salvo!').should('be.visible');
      cy.contains(end.apelido).should('be.visible');
      cy.wait(1000); // Pausa para o vídeo
    });

    // Editar o primeiro endereço
    ProfilePage.getEditButton('endereco', 0).click({ force: true });
    const apelidoEditado = 'EDITADO ' + Date.now();
    ProfilePage.addressApelidoInput.clear({ force: true }).type(apelidoEditado, { force: true });
    ProfilePage.saveAddressButton.click({ force: true });
    cy.contains('Endereço atualizado!').should('be.visible');
    cy.contains(apelidoEditado).should('be.visible');
    cy.wait(1000);

    // Remover um por um com confirmação visível
    enderecos.forEach(() => {
      ProfilePage.getDeleteButton('endereco', 0).click({ force: true });
      
      // Valida o modal com título correto ("Remover Endereço")
      cy.get('h2').contains('Remover Endereço').should('be.visible');
      cy.wait(1000); // Pausa para mostrar o modal
      
      ProfilePage.genericModalConfirmButton.click({ force: true });
      cy.contains('Endereço removido!').should('be.visible');
      cy.wait(1000);
    });
  });
});
