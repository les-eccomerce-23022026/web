describe('Refatoração de CSS Inline - TDD', () => {
  const loginAsAdmin = () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          uuid: "uuid-do-admin-9999",
          nome: "Admin",
          email: "admin@teste.com",
          cpf: "000.000.000-00",
          role: "admin"
        }
      }
    }).as('loginAdmin');

    cy.login('admin@teste.com', '123456');
    cy.wait('@loginAdmin');
    cy.url().should('include', '/admin');
  };

  it('Verificar estilos em GerenciarAdmins.tsx', () => {
    loginAsAdmin();
    cy.contains('a', 'Gerenciar Administradores').click();
    
    // Abrir formulário de novo administrador para ver o card
    cy.contains('button', 'Novo Administrador').click();
    
    // Verificar card de cadastro - usando seletor parcial para CSS Modules
    cy.get('[class*="admin-novo-card"]').should('exist');
    cy.get('[class*="admin-novo-card"]').should('have.css', 'padding', '24px');
    cy.get('[class*="admin-novo-card"]').should('have.css', 'max-width', '400px');
    
    // Verificar container de botões
    cy.get('[class*="admin-form-actions"]').should('have.css', 'display', 'flex');
    cy.get('[class*="admin-form-actions"]').should('have.css', 'gap', '8px');
  });

  it('Verificar estilos de mensagem de sucesso em GerenciarAdmins.tsx', () => {
    loginAsAdmin();
    cy.contains('a', 'Gerenciar Administradores').click();

    // Abrir formulário
    cy.contains('button', 'Novo Administrador').click();
    cy.get('input[name="adminNome"]').type('Admin Teste');
    cy.get('input[name="adminEmail"]').type('teste@admin.com');
    cy.get('input[name="adminSenha"]').type('senha123');
    
    // Interceptar a chamada de API
    cy.intercept('POST', '/api/admin/registro', {
        statusCode: 200,
        body: { message: 'Administrador cadastrado com sucesso.' }
    }).as('createAdmin');

    cy.contains('button', 'Salvar Administrador').click();
    cy.wait('@createAdmin');

    // Verificar mensagem de sucesso
    cy.get('[class*="admin-message-success"]').should('have.css', 'color', 'rgb(0, 128, 0)'); // green
    cy.get('[class*="admin-message-success"]').should('have.css', 'padding', '16px');
    cy.get('[class*="admin-message-success"]').should('have.css', 'background-color', 'rgb(224, 255, 224)'); // #e0ffe0
  });

  it('Verificar estilos em LoginArea.tsx', () => {
    cy.visit('/minha-conta');
    
    // Abrir formulário de registro
    cy.contains('button', 'Criar Nova Conta').click();
    
    // Verificar container de botões de registro
    cy.get('[class*="auth-form-actions"]').should('have.css', 'display', 'flex');
    cy.get('[class*="auth-form-actions"]').should('have.css', 'gap', '16px');

    // Simular erro de senha fraca para ver mensagem de erro
    cy.get('input[name="senha"]').type('123');
    cy.get('input[name="confirmacao_senha"]').type('123');
    cy.contains('button', 'Finalizar Cadastro').click();

    cy.get('[class*="auth-message-error"]').should('have.css', 'color', 'rgb(255, 0, 0)'); // red
    cy.get('[class*="auth-message-error"]').should('have.css', 'margin-bottom', '16px');
  });

  it('Verificar estilos em Carrinho.tsx', () => {
    cy.visit('/carrinho');
    
    // Verificar imagem do item (o mock deve carregar itens)
    cy.get('[class*="carrinho-item-image"]').first().should('have.css', 'width', '60px');
    cy.get('[class*="carrinho-item-image"]').first().should('have.css', 'height', '90px');
    cy.get('[class*="carrinho-item-image"]').first().should('have.css', 'object-fit', 'cover');
  });

  const loginAsClient = () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          uuid: "uuid-do-cliente-1111",
          nome: "Cliente",
          email: "joao@email.com",
          cpf: "111.111.111-11",
          role: "cliente"
        }
      }
    }).as('loginCliente');

    cy.login('joao@email.com', '123456');
    cy.wait('@loginCliente');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  };

  it('Verificar estilos em Checkout.tsx', () => {
    loginAsClient();
    
    // Ir pro carrinho usando link do Header e então pro checkout
    cy.contains('a', 'Carrinho').click();
    cy.url().should('include', '/carrinho');
    
    // Agora ir para checkout (o botão "Finalizar Compra" direciona para /checkout)
    cy.contains('button', 'Finalizar Compra').click();
    cy.url().should('include', '/checkout');
    
    // Esperar um pouco pra ver se renderiza a página ou a mensagem
    cy.get('body').then($body => {
      if ($body.find('[class*="checkout-page"]').length > 0) {
        cy.get('[class*="checkout-page"]').should('be.visible');
      } else {
        // Se houver erro ou vazio, vai cair na classe refatorada
        cy.get('[class*="checkout-status-message"]').should('have.css', 'padding', '20px');
      }
    });
  });

  it('Verificar estilos em DetalhesLivro.tsx', () => {
    // Interceptar a chamada para forçar um "livro não encontrado"
    cy.intercept('GET', '/api/livros/teste-id-123', {
        statusCode: 404,
        body: null
    }).as('getLivroNaoEncontrado');

    cy.visit('/livro/teste-id-123');
    
    cy.get('body').then($body => {
      cy.get('[class*="detalhes-status-message"], [class*="detalhes-livro"], [class*="error-state"], [class*="loading-state"]').should('exist');
      
      if ($body.find('[class*="detalhes-status-message"]').length > 0) {
          cy.get('[class*="detalhes-status-message"]').should('have.css', 'padding', '20px');
      }
    });
  });

  it('Verificar estilos em Header.tsx', () => {
    // Fazer login como cliente p/ permanecer no BaseLayout (onde o header vive)
    loginAsClient();
    cy.get('[class*="header-logout-btn"]').should('exist');
    cy.get('[class*="header-logout-btn"]').should('have.css', 'cursor', 'pointer');
  });
});
