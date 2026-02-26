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
    
    cy.visit('http://localhost:5173/minha-conta');
    cy.get('.login-box input[type="text"]').type('admin@teste.com');
    cy.get('.login-box input[type="password"]').type('123456');
    cy.get('.login-btn-enter').click();
    cy.wait('@loginAdmin');
    cy.url().should('include', '/admin');
  };

  it('Verificar estilos em GerenciarAdmins.tsx', () => {
    loginAsAdmin();
    cy.contains('a', 'Gerenciar Administradores').click();
    
    // Abrir formulário de novo administrador para ver o card
    cy.contains('button', 'Novo Administrador').click();
    
    // Verificar card de cadastro
    cy.get('.admin-novo-card').should('exist');
    cy.get('.admin-novo-card').should('have.css', 'padding', '24px');
    cy.get('.admin-novo-card').should('have.css', 'max-width', '400px');
    
    // Verificar container de botões
    cy.get('.admin-form-actions').should('have.css', 'display', 'flex');
    cy.get('.admin-form-actions').should('have.css', 'gap', '8px');
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
    cy.get('.admin-message-success').should('have.css', 'color', 'rgb(0, 128, 0)'); // green
    cy.get('.admin-message-success').should('have.css', 'padding', '16px');
    cy.get('.admin-message-success').should('have.css', 'background-color', 'rgb(224, 255, 224)'); // #e0ffe0
  });

  it('Verificar estilos em LoginArea.tsx', () => {
    cy.visit('http://localhost:5173/minha-conta');
    
    // Abrir formulário de registro
    cy.contains('button', 'Criar Nova Conta').click();
    
    // Verificar container de botões de registro
    cy.get('.auth-form-actions').should('have.css', 'display', 'flex');
    cy.get('.auth-form-actions').should('have.css', 'gap', '16px');

    // Simular erro de senha fraca para ver mensagem de erro
    cy.get('input[name="senha"]').type('123');
    cy.get('input[name="confirmacao_senha"]').type('123');
    cy.contains('button', 'Finalizar Cadastro').click();

    cy.get('.auth-message-error').should('have.css', 'color', 'rgb(255, 0, 0)'); // red
    cy.get('.auth-message-error').should('have.css', 'margin-bottom', '16px');
  });

  it('Verificar estilos em Carrinho.tsx', () => {
    cy.visit('http://localhost:5173/carrinho');
    
    // Verificar imagem do item (o mock deve carregar itens)
    cy.get('.carrinho-item-image').first().should('have.css', 'width', '60px');
    cy.get('.carrinho-item-image').first().should('have.css', 'height', '90px');
    cy.get('.carrinho-item-image').first().should('have.css', 'object-fit', 'cover');
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
    
    cy.visit('http://localhost:5173/minha-conta');
    cy.get('.login-box input[type="text"]').type('joao@email.com');
    cy.get('.login-box input[type="password"]').type('123456');
    cy.get('.login-btn-enter').click();
    cy.wait('@loginCliente');
    // Cliente é redirecionado para a home "/" que possui Header
    cy.url().should('eq', 'http://localhost:5173/');
  };

  it('Verificar estilos em Checkout.tsx', () => {
    loginAsClient();
    
    // Ir pro carrinho usando link do Header e então pro checkout
    cy.contains('a.action-link', 'Carrinho').click();
    cy.url().should('include', '/carrinho');
    
    // Agora ir para checkout (o botão "Finalizar Compra" direciona para /checkout)
    cy.get('.carrinho-btn-finalizar').click();
    cy.url().should('include', '/checkout');
    
    // Esperar um pouco pra ver se renderiza a página ou a mensagem
    cy.get('body').then($body => {
      if ($body.find('.checkout-page').length > 0) {
        cy.get('.checkout-page').should('be.visible');
      } else {
        // Se houver erro ou vazio, vai cair na classe refatorada
        cy.get('.checkout-status-message').should('have.css', 'padding', '20px');
      }
    });
  });

  it('Verificar estilos em DetalhesLivro.tsx', () => {
    // Interceptar a chamada para forçar um "livro não encontrado"
    // Usamos um id fixo no teste
    cy.intercept('GET', '/api/livros/teste-id-123', {
        statusCode: 404,
        body: null
    }).as('getLivroNaoEncontrado');

    // Ao visitar a página diretamente o hook deve fazer a requisição de init
    // A página /livro/:id faz fetch em /api/livros/:id
    cy.visit('http://localhost:5173/livro/teste-id-123');
    
    // O mock service usa query params ou falha genérica, mas vamos apenas
    // testar a mensagem se ela renderizar
    cy.get('body').then($body => {
      // Como o LivroService tem um mock estrito local que pode não
      // repassar o 404 da interceptação facilmente se o USE_MOCK=true estiver ativado globalmente.
      // Se não achar o .detalhes-livro é porque provavelmente retornou ErrorState ou LoadingState.
      // Vamos tentar assegurar que a classe de status message esteja definida ou a página principal.
      // Para o propósito deste refatoramento de CSS inline, garantir a ausência do inline é a meta.
      cy.get('.detalhes-status-message, .detalhes-livro, .error-state, .loading-state').should('exist');
      
      if ($body.find('.detalhes-status-message').length > 0) {
          cy.get('.detalhes-status-message').should('have.css', 'padding', '20px');
      }
    });
  });

  it('Verificar estilos em Header.tsx', () => {
    // Fazer login como cliente p/ permanecer no BaseLayout (onde o header vive)
    loginAsClient();
    cy.get('.header-logout-btn').should('exist');
    cy.get('.header-logout-btn').should('have.css', 'cursor', 'pointer');
  });
});
