describe('Login / Cadastro de Conta', () => {
  beforeEach(() => {
    cy.visit('/minha-conta');
  });

  it('deve exibir o formulário de login para clientes existentes', () => {
    cy.contains('h2', 'Já sou Cliente').should('be.visible');
    // Campo de e-mail ou CPF
    cy.get('input[placeholder="joao@email.com"]').should('exist');
    cy.contains('label', 'E-mail ou CPF').should('be.visible');
    
    // Campo de senha
    cy.get('input[type="password"]').should('exist');
    cy.contains('label', 'Senha').should('be.visible');
    
    // Botão de ação
    cy.contains('button', 'Entrar').should('be.visible');
    cy.contains('a', 'Esqueci minha senha').should('be.visible');
  });

  it('deve permitir realizar login simulado e mudar o Header', () => {
    // Digita o email
    cy.get('input[placeholder="joao@email.com"]').type('joao@email.com');
    // Digita a senha
    cy.get('input[type="password"]').type('123456');
    
    // Clica no Entrar
    cy.contains('button', 'Entrar').click();

    // Deve redirecionar para a home
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // No Header, deve aparecer "Olá, joao" e o botão de sair
    cy.contains('span', 'Olá, joao').should('be.visible');
    cy.contains('span', 'Sair').should('be.visible');
    
    // Sair da conta
    cy.contains('span', 'Sair').click();

    // Voltou ao estado normal
    cy.contains('a', 'Minha Conta').should('be.visible');
  });

  it('deve exibir a área para criar nova conta', () => {
    cy.contains('h2', 'Quero me Cadastrar').should('be.visible');
    cy.contains('button', 'Criar Nova Conta').should('be.visible');
    cy.contains('p', 'Crie sua conta na LES Livraria').should('be.visible');
  });
});
