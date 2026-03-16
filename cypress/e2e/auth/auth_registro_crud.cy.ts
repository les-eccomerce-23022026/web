describe('Auth - Fluxos de Registro, Login e Gestão de Perfil (CRUD)', () => {

  context('Autenticação de Usuários', () => {
    it('deve logar como cliente e validar informações no Header', () => {
      const fakeUser = {
        uuid: "uuid-cliente-123",
        nome: "João Comprador",
        email: "joao.comprador@email.com",
        cpf: "123.456.789-00",
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

      cy.login('joao.comprador@email.com', 'password123');
      cy.wait('@loginRequest');

      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      cy.getDataCy('header-user-profile')
        .should('be.visible')
        .and('have.attr', 'title', `Olá, ${fakeUser.nome}`);

      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('not.include', '/admin');
    });

    it('deve logar como administrador e acessar o painel administrativo', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          sucesso: true,
          dados: {
            token: "fake-jwt-token-admin",
            user: {
              uuid: "uuid-admin-999",
              nome: "Admin Sistema",
              role: "admin"
            }
          }
        }
      }).as('loginAdmin');

      cy.login('admin@gmail.com', 'password123');
      cy.wait('@loginAdmin');

      cy.url().should('include', '/admin');
      cy.contains('h2', 'Painel Administrativo').should('be.visible');
    });
  });

  context('Registro de Novo Cliente (Fluxo Completo)', () => {
    it('deve validar senha forte e permitir registro com sucesso através do stepper', () => {
      cy.intercept('POST', '**/clientes/registro', {
        statusCode: 201,
        body: { sucesso: true, dados: { message: "Cadastro realizado com sucesso." } }
      }).as('registerRequest');

      cy.visit('/minha-conta');
      cy.getDataCy('register-toggle-button').click();

      // Step 1: Dados Pessoais
      cy.getDataCy('register-nome-input').type('João Silva');
      cy.getDataCy('register-cpf-input').type('123.456.789-00');
      cy.getDataCy('register-email-input').type('joao.novo@email.com');
      cy.getDataCy('register-nascimento-input').type('1990-01-01');
      
      // DDD e Número
      cy.get('label').contains('DDD').parent().find('input').type('11');
      cy.get('label').contains('Número').parent().find('input').type('999887766');

      // Senha forte
      cy.getDataCy('register-senha-input').clear().type('StrongPass@2026');
      cy.getDataCy('register-confirmacao-senha-input').clear().type('StrongPass@2026');
      
      // Avançar para Step 2
      cy.getDataCy('register-next-step-button').click();
      cy.contains('Endereço de Cobrança').should('be.visible');

      // Step 2: Endereço
      cy.get('input[placeholder="Nome da rua"]').type('Rua das Flores');
      cy.get('input[placeholder="123"]').type('100');
      cy.get('input[placeholder="00000-000"]').type('01234-567');
      cy.get('label').contains('Bairro').parent().find('input').type('Centro');
      cy.get('label').contains('Cidade').parent().find('input').type('São Paulo');
      cy.get('input[placeholder="SP"]').type('SP');

      cy.getDataCy('register-submit-button').click();
      cy.wait('@registerRequest');
      cy.contains('Cadastro realizado com sucesso').should('be.visible');
    });
  });

  context('Gestão de Perfil do Cliente', () => {
    const fakeUser = { uuid: "c-123", nome: "João", role: "cliente", email: "joao@teste.com" };

    beforeEach(() => {
      // Usar login programático
      cy.loginProgramatico('cliente');

      // Mock do Perfil
      cy.intercept('GET', '**/clientes/perfil', {
        statusCode: 200,
        body: {
          sucesso: true,
          dados: {
            uuid: fakeUser.uuid,
            nome: fakeUser.nome,
            email: fakeUser.email,
            cpf: "111.222.333-44",
            role: "cliente",
            enderecos: [],
            cartoes: []
          }
        }
      }).as('getPerfil');
    });

    it('deve permitir visualizar e navegar pelas seções do perfil', () => {
      cy.visit('/perfil');
      cy.wait('@getPerfil');
      
      cy.get('body').should('not.contain', 'Carregando');
      cy.get('h1').should('contain', 'Meu Perfil');

      // Navegação por abas - usando o texto visível (com emoji se necessário)
      cy.contains('Endereços').click();
      cy.contains('Cartões').click();
      cy.contains('Senha').click();
      cy.contains('h2', 'Alterar Senha').should('be.visible');
      
      cy.get('[data-testid="tab-perigo"]').click();
      cy.contains('h2', 'Zona de Perigo').should('be.visible');
    });

    it('deve permitir solicitar a inativação da conta', () => {
      cy.visit('/perfil');
      cy.wait('@getPerfil');
      cy.get('[data-testid="tab-perigo"]').click();
      
      cy.intercept('DELETE', '**/clientes/perfil', {
        statusCode: 200,
        body: { sucesso: true, dados: { mensagem: "Inativado" } }
      }).as('inativarRequest');

      cy.get('[data-testid="btn-solicitar-exclusao"]').click();
      
      // Confirmar no Modal
      cy.get('[data-testid="modal-confirm-button"]').should('be.visible').click();

      cy.wait('@inativarRequest');
      cy.url().should('include', '/minha-conta');
    });
  });
});
