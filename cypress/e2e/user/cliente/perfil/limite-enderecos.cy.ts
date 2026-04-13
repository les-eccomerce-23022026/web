import { ProfilePage } from '../../../../support/pages/user/ProfilePage';
import type { ITestUser } from '../../../../support/interfaces';

describe('Cliente - Perfil - Limite de Endereços (Bloqueio UI)', () => {
  let testUser: ITestUser;

  before(() => {
    cy.getNewUser().then((user) => {
      testUser = user;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/clientes/registro`,
        headers: { 'x-use-test-db': 'true' },
        body: { 
            ...testUser, 
            confirmacaoSenha: testUser.senha,
            enderecoCobranca: {
                apelido: 'Registro 1',
                tipoResidencia: 'Casa',
                tipoLogradouro: 'Rua',
                logradouro: 'Rua das Flores',
                numero: '10',
                bairro: 'Centro',
                cep: '12345-678',
                cidade: 'São Paulo',
                estado: 'SP',
                pais: 'Brasil'
            }
        }
      });
    });
  });

  beforeEach(() => {
    cy.loginWithSession(testUser.email, testUser.senha, 'session-limite-enderecos');
  });

  it('deve desabilitar o botão de adicionar quando houver 5 endereços', () => {
    cy.visit('/perfil');
    ProfilePage.navigateToTab('enderecos');

    // Já tem 1 do registro. Adicionar mais 4.
    for (let i = 1; i <= 4; i++) {
        ProfilePage.addAddressButton.should('not.be.disabled').click({ force: true });
        
        ProfilePage.fillAddress({
            apelido: `Novo ${i}`,
            logradouro: `Logradouro ${i}`,
            numero: `${i}`,
            cep: '12345-000',
            bairro: 'Bairro',
            cidade: 'Cidade',
            estado: 'SP'
        });

        ProfilePage.saveAddressButton.click({ force: true });
        cy.contains('Endereço salvo!').should('be.visible');
    }

    // Agora deve estar bloqueado
    ProfilePage.addAddressButton.should('be.disabled');
    ProfilePage.addAddressButton.should('contain.text', 'Limite de 5 Endereços Atingido');
  });
});
