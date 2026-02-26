describe('Autenticação e Registro', () => {

  beforeEach(() => {
    // We can visit the home or start at minha-conta
  });

  context('1. Fluxo e Dados de Autenticação (Login)', () => {
    it('deve logar como cliente retornando uuid, cpf, role e token', () => {
      // Setup network intercept for login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            uuid: "uuid-do-cliente-1234",
            nome: "João Comprador",
            email: "joao.comprador@email.com",
            cpf: "123.456.789-00",
            role: "cliente"
          }
        }
      }).as('loginRequest');

      cy.login('joao.comprador@email.com', 'password123');
      cy.wait('@loginRequest');

      // Check URL and state
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.getDataCy('header-user-profile').should('be.visible').and('contain', 'João Comprador');

      // Admin routes should be blocked
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
    });

    it('deve logar como administrador e permitir acesso ao painel de administração', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            uuid: "uuid-do-admin-9999",
            nome: "Administrador do Sistema",
            email: "admin@livraria.com.br",
            cpf: "000.111.222-33",
            role: "admin"
          }
        }
      }).as('loginAdmin');

      cy.login('admin@livraria.com.br', 'password123');
      cy.wait('@loginAdmin');

      // Admin routes should be allowed (the app navigates automatically)
      cy.url().should('include', '/admin');
      cy.contains('h2', 'Painel Administrativo Corporativo').should('be.visible');
    });

    it('deve proteger rotas sensíveis como /checkout antes de logar', () => {
      cy.visit('/checkout');
      // Deve ser redirecionado para a tela de login
      cy.url().should('include', '/minha-conta');
    });
  });

  context('2. Fluxo e Dados de Registro do Cliente (Cadastro Real)', () => {
    it('deve permitir o registro de um novo cliente com senha forte requerida', () => {
      cy.intercept('POST', '/api/clientes/registro', {
        statusCode: 201,
        body: { message: "Cadastro realizado com sucesso." }
      }).as('registerRequest');

      cy.visit('/minha-conta');
      // Abrir formulario
      cy.getDataCy('register-toggle-button').click();

      cy.getDataCy('register-nome-input').type('João Silva');
      cy.getDataCy('register-cpf-input').type('123.456.789-00');
      cy.getDataCy('register-email-input').type('joao.comprador@email.com');
      
      // Teste de senha fraca
      cy.getDataCy('register-senha-input').type('1234');
      cy.getDataCy('register-confirmacao-senha-input').type('1234');
      cy.getDataCy('register-submit-button').click();
      cy.contains('A senha deve conter pelo menos 8 caracteres, maiúsculas, minúsculas e especiais').should('be.visible');

      // Teste de senha forte
      cy.getDataCy('register-senha-input').clear().type('Password@123');
      cy.getDataCy('register-confirmacao-senha-input').clear().type('Password@123');
      cy.getDataCy('register-submit-button').click();

      cy.wait('@registerRequest').its('request.body').should((body) => {
        expect(body).to.include.keys('nome', 'cpf', 'email', 'senha', 'confirmacao_senha');
        expect(body).to.not.have.property('role'); // Nunca enviar role publicamente
      });
      cy.contains('Cadastro realizado com sucesso').should('be.visible');
    });
  });

  context('3. Cadastro de Perfil de Administradores', () => {
    it('deve permitir cadastro de admin apenas pelo painel de um admin autenticado', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: {
            uuid: "uuid-do-admin-9999",
            nome: "Admin",
            role: "admin"
          }
        }
      }).as('loginAdminOnly');
      
      cy.login('admin', '123456');
      cy.wait('@loginAdminOnly');
      
      // Access admin user management
      cy.contains('a', 'Gerenciar Administradores').click();
      cy.contains('button', 'Novo Administrador').click();
      
      cy.intercept('POST', '/api/admin/registro', {
        statusCode: 201
      }).as('adminRegister');

      cy.get('input[name="adminNome"]').type('Novo Admin');
      cy.get('input[name="adminEmail"]').type('novoadmin@livraria.com');
      cy.get('input[name="adminSenha"]').type('SuperSenha@2026');
      cy.contains('button', 'Salvar Administrador').click();

      cy.wait('@adminRegister');
      cy.contains('Administrador cadastrado com sucesso.').should('be.visible');
    });
  });

  context('4. Atualização e Exclusão de Contas (CRUD de Clientes)', () => {
    it('deve permitir acesso ao perfil e edição de dados, alteração de senha e inativação de conta', () => {
      // Mock login as cliente
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: "TokenMock",
          user: {
            uuid: "uuid-do-cliente-1234",
            nome: "João Comprador",
            email: "joao.comprador@email.com",
            role: "cliente"
          }
        }
      }).as('loginCliente');

      cy.login('joao', '123');
      cy.wait('@loginCliente');

      // Go to profile
      cy.getDataCy('header-user-profile').click();
      cy.url().should('include', '/perfil');

      // Atualização de Dados
      cy.intercept('PUT', '/api/clientes/perfil', { statusCode: 200 }).as('updateProfile');
      cy.get('input[name="nome"]').clear().type('João Silva Souza');
      cy.contains('button', 'Atualizar Dados').click();
      cy.wait('@updateProfile');
      cy.contains('Dados atualizados com sucesso').should('be.visible');

      // Alteração de Senha
      cy.intercept('PUT', '/api/clientes/senha', { statusCode: 200 }).as('changePassword');
      cy.get('input[name="senha_atual"]').type('senhaAtual123');
      cy.get('input[name="nova_senha"]').type('NovaSenha@321');
      cy.contains('button', 'Alterar Senha').click();
      cy.wait('@changePassword');
      cy.contains('Senha atualizada com sucesso').should('be.visible');

      // Inativação da Conta
      cy.on('window:confirm', () => true);
      cy.intercept('DELETE', '/api/clientes/perfil', { statusCode: 200 }).as('inativarConta');
      cy.contains('button', 'Solicitar Exclusão da Conta').click();
      cy.wait('@inativarConta');
      
      // Should logout after inativacao and redirect to login page
      cy.url().should('include', '/minha-conta');
    });
  });
});
