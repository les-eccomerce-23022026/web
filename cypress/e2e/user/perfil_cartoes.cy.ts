import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Perfil - Gestão de Cartões', () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440001";
  const mockCartoes = [
    {
      uuid: validUuid,
      final: "4444",
      bandeira: "Visa",
      nomeImpresso: "JOAO TESTE",
      validade: "12/2030"
    }
  ];

  beforeEach(() => {
    cy.loginProgramatico('cliente');
    
    // Intercepta o perfil (que contém dados básicos e endereços)
    cy.intercept('GET', '**/clientes/perfil', {
      statusCode: 200,
      body: { 
        sucesso: true, 
        dados: { uuid: "u1", nome: "João", role: "cliente", enderecos: [], cartoes: [] } 
      }
    }).as('getPerfil');

    // Intercepta a listagem de cartões (chamada separada no fetchPerfilCompleto)
    cy.intercept('GET', '**/clientes/perfil/cartoes', {
      statusCode: 200,
      body: mockCartoes
    }).as('getCartoes');

    cy.visit('/perfil');
    cy.wait(['@getPerfil', '@getCartoes']);
    
    cy.get('body').should('not.contain', 'Carregando');
    ProfilePage.navigateToTab('cartoes');
  });

  it('deve listar os cartões cadastrados', () => {
    cy.get('div[data-cy^="cartao-card-"]').should('have.length', 1);
    cy.contains('Visa').should('be.visible');
    cy.contains('•••• •••• •••• 4444').should('be.visible');
  });

  it('deve permitir adicionar um novo cartão com sucesso', () => {
    const novoCartao = { 
      uuid: "550e8400-e29b-41d4-a716-446655440002", 
      final: "5555", 
      bandeira: "Mastercard", 
      nomeImpresso: "JOAO NOVO", 
      validade: "01/2032" 
    };

    cy.intercept('POST', '**/clientes/perfil/cartoes', {
      statusCode: 201,
      body: novoCartao
    }).as('addCartao');

    ProfilePage.addCardButton.should('be.visible').click();
    ProfilePage.cardFormPanel.should('be.visible');
    
    ProfilePage.fillCard({
      numero: '1234123412345555',
      nome: 'JOAO NOVO',
      bandeira: 'Mastercard',
      validade: '01/2032',
      cvv: '123'
    });

    ProfilePage.saveCardButton.click();

    cy.wait('@addCartao');
    ProfilePage.successMessage.should('contain', 'Cartão salvo');
  });

  it('deve validar formato de validade incorreto (validação frontend)', () => {
    ProfilePage.addCardButton.should('be.visible').click();
    ProfilePage.cardFormPanel.should('be.visible');

    ProfilePage.cardValidadeInput.clear().type('992020');
    ProfilePage.cardCvvInput.clear().type('123');
    ProfilePage.saveCardButton.click();

    ProfilePage.errorMessage.should('be.visible');
  });

  it('deve remover um cartão com sucesso', () => {
    cy.intercept('DELETE', `**/clientes/perfil/cartoes/${validUuid}`, {
      statusCode: 200,
      body: { sucesso: true, mensagem: "Cartão removido" }
    }).as('deleteCartao');

    cy.get(`[data-cy="cartao-delete-button-${validUuid}"]`).click();
    
    // Novo modal de confirmação
    ProfilePage.genericModalConfirmButton.should('be.visible').click();

    cy.wait('@deleteCartao');
    ProfilePage.successMessage.should('contain', 'removido');
  });
});
