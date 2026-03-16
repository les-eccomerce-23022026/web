describe('Auth - Login e Fluxo de Cadastro Inicial', () => {
  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve exibir o formulário de login com os campos corretos', () => {
    cy.contains('h2', 'Já sou Cliente').should('be.visible');
    
    // Usando data-cy conforme a implementação real
    cy.getDataCy('login-email-input').should('be.visible');
    cy.getDataCy('login-password-input').should('be.visible');
    cy.getDataCy('login-submit-button').should('be.visible').and('contain', 'Entrar');
    
    cy.contains('a', 'Esqueci minha senha').should('be.visible');
  });

  it('deve realizar login simulado e atualizar o estado do Header', () => {
    const fakeUser = { 
      uuid: "user-123", 
      nome: "João Teste", 
      email: "joao@teste.com", 
      role: "cliente" 
    };

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        sucesso: true,
        dados: {
          token: "fake-jwt-token",
          user: fakeUser
        }
      }
    }).as('loginRequest');

    // Preenche os campos
    cy.getDataCy('login-email-input').type('joao@teste.com');
    cy.getDataCy('login-password-input').type('senha123');
    
    // Submete
    cy.getDataCy('login-submit-button').click();
    
    cy.wait('@loginRequest');

    // Deve redirecionar (padrão do useLoginArea é para / se for cliente)
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // No Header, o ícone de perfil deve ter o title com o nome do usuário
    cy.getDataCy('header-user-profile')
      .should('be.visible')
      .and('have.attr', 'title', `Olá, ${fakeUser.nome}`);
    
    // Botão de logout deve estar visível
    cy.getDataCy('header-logout-button').should('be.visible');
    
    // Sair da conta
    cy.getDataCy('header-logout-button').click();

    // Deve voltar ao estado de "Minha Conta"
    cy.getDataCy('header-login-link').should('be.visible');
    cy.getDataCy('header-user-profile').should('not.exist');
  });

  it('deve exibir e permitir alternar para a área de criação de nova conta', () => {
    cy.contains('h2', 'Quero me Cadastrar').should('be.visible');
    cy.getDataCy('register-toggle-button').should('be.visible').and('contain', 'Criar Nova Conta');
    
    // Clica para abrir o cadastro
    cy.getDataCy('register-toggle-button').click();
    
    // Deve exibir o título de Criar Conta e o Stepper
    cy.contains('h2', 'Criar Conta').should('be.visible');
    cy.contains('span', 'Dados Pessoais').should('be.visible');
    
    // Verifica se o campo de nome do primeiro step está visível
    cy.getDataCy('register-nome-input').should('be.visible');
  });
});
