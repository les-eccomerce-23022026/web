import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Perfil - Gestão de Endereços', () => {
  const mockEnderecos = [
    {
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      apelido: "Casa",
      tipoLogradouro: "Rua",
      logradouro: "Principal",
      numero: "123",
      bairro: "Centro",
      cep: "01234-567",
      cidade: "São Paulo",
      estado: "SP",
      pais: "Brasil",
      tipoResidencia: "Casa"
    }
  ];

  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/clientes/perfil', {
      statusCode: 200,
      body: { 
        sucesso: true, 
        dados: { uuid: "u1", nome: "João", email: "j@j.com", role: "cliente", enderecos: mockEnderecos, cartoes: [] } 
      }
    }).as('getPerfil');
    cy.visit('/perfil');
    cy.wait('@getPerfil');
    
    cy.get('body').should('not.contain', 'Carregando');
    ProfilePage.navigateToTab('enderecos');
  });

  it('deve listar os endereços existentes', () => {
    cy.get('div[data-cy^="endereco-card-"]').should('have.length', 1);
    cy.contains('Casa').should('be.visible');
    cy.contains('Rua Principal, 123').should('be.visible');
  });

  it('deve permitir adicionar um novo endereço com sucesso', () => {
    const novosEnderecos = [
      ...mockEnderecos,
      { 
        uuid: "550e8400-e29b-41d4-a716-446655440002", 
        apelido: "Trabalho", 
        logradouro: "Av Paulista", 
        numero: "1000", 
        cep: "01310-100", 
        cidade: "São Paulo", 
        estado: "SP", 
        pais: "Brasil",
        tipoLogradouro: "Avenida",
        tipoResidencia: "Outro",
        bairro: "Bela Vista"
      }
    ];

    cy.intercept('POST', '**/clientes/perfil/enderecos', {
      statusCode: 201,
      body: novosEnderecos // API retorna a lista atualizada
    }).as('addEndereco');

    ProfilePage.addAddressButton.click();
    
    ProfilePage.fillAddress({
      apelido: 'Trabalho',
      logradouro: 'Av Paulista',
      numero: '1000',
      cep: '01310-100',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    });

    ProfilePage.saveAddressButton.click();

    cy.wait('@addEndereco');
    ProfilePage.successMessage.should('contain', 'Endereço salvo');
  });

  it('deve exibir erro ao tentar salvar endereço inválido (falha backend)', () => {
    cy.intercept('POST', '**/clientes/perfil/enderecos', {
      statusCode: 400,
      body: { sucesso: false, mensagem: "CEP inválido ou não encontrado." }
    }).as('addFail');

    ProfilePage.addAddressButton.should('be.visible').click();
    // Preencher algo para habilitar ou apenas clicar
    ProfilePage.saveAddressButton.should('be.visible').click();

    cy.wait('@addFail');
    ProfilePage.errorMessage.should('be.visible');
  });

  it('deve remover um endereço com sucesso', () => {
    const validUuid = mockEnderecos[0].uuid;

    cy.intercept('DELETE', `**/clientes/perfil/enderecos/${validUuid}`, {
      statusCode: 200,
      body: { sucesso: true, mensagem: "Endereço removido" }
    }).as('deleteEndereco');

    cy.get(`[data-cy="endereco-delete-button-${validUuid}"]`).click();
    
    // Agora o código tem modal de confirmação
    ProfilePage.genericModalConfirmButton.should('be.visible').click();

    cy.wait('@deleteEndereco');
    ProfilePage.successMessage.should('contain', 'removido');
  });
});
