import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Perfil - Atualização de Dados Cadastrais', () => {
  const user = { 
    uuid: "user-id-123", 
    nome: "João Teste", 
    email: "joao@teste.com", 
    role: "cliente",
    cpf: "123.456.789-00",
    telefone: { ddd: "11", numero: "999887766" }
  };

  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/clientes/perfil', {
      statusCode: 200,
      body: { 
        sucesso: true, 
        dados: { 
          ...user, 
          emailMascarado: "jo**@teste.com",
          cpfMascarado: "123.***.***-00",
          enderecos: [], 
          cartoes: [] 
        } 
      }
    }).as('getPerfil');
    cy.visit('/perfil');
    cy.wait('@getPerfil');
  });

  it('deve atualizar o nome com sucesso (dado não crítico)', () => {
    cy.intercept('PATCH', '**/clientes/perfil', {
      statusCode: 200,
      body: { sucesso: true, dados: { message: "Perfil atualizado" } }
    }).as('updatePerfil');

    ProfilePage.nomeInput.clear().type('João Silva Souza');
    ProfilePage.saveProfileButton.click();

    cy.wait('@updatePerfil');
    ProfilePage.successMessage.should('contain', 'Dados atualizados com sucesso');
  });

  it('deve exigir confirmação de senha ao alterar e-mail (dado crítico)', () => {
    cy.intercept('PATCH', '**/clientes/perfil', {
      statusCode: 200,
      body: { sucesso: true, dados: { message: "Email atualizado" } }
    }).as('updateSeguro');

    ProfilePage.emailInput.clear().type('novo.email@teste.com');
    ProfilePage.saveProfileButton.click();

    // Deve abrir o modal de confirmação
    cy.get('[data-cy="perfil-modal-password-input"]').should('be.visible');
    ProfilePage.confirmWithPassword('senha123');

    cy.wait('@updateSeguro');
    ProfilePage.successMessage.should('contain', 'Dados atualizados');
  });

  it('deve falhar ao informar um CPF inválido (validação frontend)', () => {
    ProfilePage.cpfInput.clear().type('123'); // Curto demais
    ProfilePage.saveProfileButton.click();

    ProfilePage.errorMessage.should('contain', 'O CPF deve ter exatamente 11 números');
  });

  it('deve exibir erro quando a senha de confirmação está incorreta (falha backend)', () => {
    cy.intercept('PATCH', '**/clientes/perfil', {
      statusCode: 401,
      body: { sucesso: false, mensagem: "Senha atual incorreta." }
    }).as('updateFail');

    ProfilePage.telInput.clear().type('11911112222');
    ProfilePage.saveProfileButton.click();
    
    ProfilePage.confirmWithPassword('senha_errada');

    cy.wait('@updateFail');
    ProfilePage.errorMessage.should('be.visible').and(($p) => {
      expect($p.text()).to.match(/Senha|incorreta|inválida/i);
    });
  });
});
