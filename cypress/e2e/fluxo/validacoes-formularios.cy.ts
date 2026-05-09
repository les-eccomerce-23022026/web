/**
 * Testes E2E de Casos de Borda - Validações de Formulários
 * 
 * Cobertura de casos de borda e validações de formulários:
 * - Motivo de troca vazio
 * - Endereço incompleto
 * - Limite de caracteres em campos de texto
 * - Campos obrigatórios não preenchidos
 * 
 * Estratégia: E2E UI real focado em validações de frontend
 */

describe('Casos de Borda - Validações de Formulários (UI Real)', () => {
  let vendaUuid: string;
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
    
    // Setup: criar venda entregue para testes de troca
    cy.criarVendaAprovadaApi().then((dados) => {
      vendaUuid = dados.vendaUuid;
    });
    
    cy.despacharPedidoApi(vendaUuid);
    cy.confirmarEntregaApi(vendaUuid);
  });

  describe('Validações de Formulário de Troca', () => {
    beforeEach(() => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
    });

    it('deve impedir solicitação de troca sem selecionar itens', () => {
      // Tentar solicitar sem selecionar nenhum item
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="erro-selecionar-item"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain', 'Selecione pelo menos um item');
    });

    it('deve impedir solicitação de troca com motivo vazio', () => {
      // Selecionar item
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      // Tentar solicitar sem motivo
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="erro-motivo-obrigatorio"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain', 'Motivo obrigatório');
    });

    it('deve impedir solicitação de troca com motivo muito curto', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      // Preencher motivo com menos de 10 caracteres
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Defeito');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação (se houver validação de tamanho mínimo)
      cy.get('[data-cy="erro-motivo-curto"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain', 'mínimo');
    });

    it('deve impedir solicitação de troca com motivo muito longo', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      // Preencher motivo com mais de 500 caracteres
      const motivoLongo = 'A'.repeat(501);
      cy.get('[data-cy="troca-motivo-input"]')
        .type(motivoLongo);
      
      // Verificar que o campo não aceita mais caracteres
      cy.get('[data-cy="troca-motivo-input"]')
        .should('have.value.length.at.most', 500);
    });

    it('deve permitir solicitação de troca com motivo válido', () => {
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      cy.get('[data-cy="troca-motivo-input"]')
        .type('Produto com defeito de fabricação');
      
      cy.get('[data-cy="btn-solicitar-troca"]')
        .scrollIntoView()
        .click();
      
      // Verificar sucesso
      cy.get('[data-cy="sucesso-troca"]', { timeout: 10000 })
        .should('be.visible');
    });
  });

  describe('Validações de Formulário de Endereço', () => {
    beforeEach(() => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/minha-conta');
      cy.get('[data-cy="tab-enderecos"]').click();
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
    });

    it('deve impedir cadastro de endereço sem logradouro', () => {
      // Preencher apenas número
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-logradouro-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir cadastro de endereço sem número', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-numero-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir cadastro de endereço sem CEP', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-cep-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir cadastro de endereço com CEP inválido', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('00000'); // CEP incompleto
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-cep-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir cadastro de endereço sem cidade', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01310-100');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-cidade-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir cadastro de endereço sem estado', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01310-100');
      
      cy.get('[data-cy="endereco-cidade-input"]')
        .type('São Paulo');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="endereco-estado-input"]')
        .should('have.class', 'error');
    });

    it('deve permitir cadastro de endereço completo', () => {
      cy.get('[data-cy="endereco-logradouro-input"]')
        .type('Rua Teste Completo');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('123');
      
      cy.get('[data-cy="endereco-complemento-input"]')
        .type('Apto 1');
      
      cy.get('[data-cy="endereco-bairro-input"]')
        .type('Centro');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01310-100');
      
      cy.get('[data-cy="endereco-cidade-input"]')
        .type('São Paulo');
      
      cy.get('[data-cy="endereco-estado-input"]')
        .select('SP');
      
      cy.get('[data-cy="endereco-submit-button"]')
        .scrollIntoView()
        .click();
      
      // Verificar sucesso
      cy.get('[data-cy="notification-toast"]', { timeout: 10000 })
        .should('be.visible')
        .should('contain', 'Endereço salvo');
    });
  });

  describe('Validações de Formulário de Login', () => {
    it('deve impedir login com email vazio', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-senha-input"]')
        .type(senhaCliente);
      
      cy.get('[data-cy="login-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="login-email-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir login com senha vazia', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-email-input"]')
        .type(emailCliente);
      
      cy.get('[data-cy="login-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="login-senha-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir login com email inválido', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-email-input"]')
        .type('email-invalido');
      
      cy.get('[data-cy="login-senha-input"]')
        .type(senhaCliente);
      
      cy.get('[data-cy="login-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="login-email-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir login com credenciais incorretas', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-email-input"]')
        .type(emailCliente);
      
      cy.get('[data-cy="login-senha-input"]')
        .type('senha-incorreta');
      
      cy.get('[data-cy="login-submit-button"]')
        .click();
      
      // Verificar erro de autenticação
      cy.get('[data-cy="login-erro"]', { timeout: 5000 })
        .should('be.visible')
        .should('contain', 'Credenciais inválidas');
    });
  });

  describe('Validações de Formulário de Registro', () => {
    it('deve impedir registro sem nome', () => {
      cy.visit('/registro');
      
      cy.get('[data-cy="registro-email-input"]')
        .type('novo@email.com');
      
      cy.get('[data-cy="registro-senha-input"]')
        .type('@Senha123');
      
      cy.get('[data-cy="registro-confirmacao-senha-input"]')
        .type('@Senha123');
      
      cy.get('[data-cy="registro-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="registro-nome-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir registro com senhas diferentes', () => {
      cy.visit('/registro');
      
      cy.get('[data-cy="registro-nome-input"]')
        .type('Novo Usuário');
      
      cy.get('[data-cy="registro-email-input"]')
        .type('novo@email.com');
      
      cy.get('[data-cy="registro-senha-input"]')
        .type('@Senha123');
      
      cy.get('[data-cy="registro-confirmacao-senha-input"]')
        .type('@Senha456');
      
      cy.get('[data-cy="registro-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="registro-confirmacao-senha-input"]')
        .should('have.class', 'error');
    });

    it('deve impedir registro com senha fraca', () => {
      cy.visit('/registro');
      
      cy.get('[data-cy="registro-nome-input"]')
        .type('Novo Usuário');
      
      cy.get('[data-cy="registro-email-input"]')
        .type('novo@email.com');
      
      cy.get('[data-cy="registro-senha-input"]')
        .type('123456'); // Senha fraca
      
      cy.get('[data-cy="registro-confirmacao-senha-input"]')
        .type('123456');
      
      cy.get('[data-cy="registro-submit-button"]')
        .click();
      
      // Verificar erro de validação
      cy.get('[data-cy="registro-senha-input"]')
        .should('have.class', 'error');
    });
  });

  describe('Validações de Limite de Caracteres', () => {
    it('deve respeitar limite de caracteres no nome', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/minha-conta');
      
      cy.get('[data-cy="tab-perfil"]').click();
      
      const nomeLongo = 'A'.repeat(101);
      cy.get('[data-cy="perfil-nome-input"]')
        .clear()
        .type(nomeLongo);
      
      // Verificar que o campo não aceita mais de 100 caracteres
      cy.get('[data-cy="perfil-nome-input"]')
        .should('have.value.length.at.most', 100);
    });

    it('deve respeitar limite de caracteres no motivo de troca', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit(`/pedidos/${vendaUuid}/troca`);
      
      cy.get('[data-cy^="troca-item-checkbox-"]')
        .first()
        .check();
      
      const motivoLongo = 'A'.repeat(501);
      cy.get('[data-cy="troca-motivo-input"]')
        .type(motivoLongo);
      
      // Verificar que o campo não aceita mais de 500 caracteres
      cy.get('[data-cy="troca-motivo-input"]')
        .should('have.value.length.at.most', 500);
    });

    it('deve respeitar limite de caracteres no CEP', () => {
      cy.loginApi(emailCliente, senhaCliente);
      cy.visit('/minha-conta');
      
      cy.get('[data-cy="tab-enderecos"]').click();
      cy.get('[data-cy="endereco-add-button"]').scrollIntoView().click();
      
      const cepLongo = '01310-100123';
      cy.get('[data-cy="endereco-cep-input"]')
        .type(cepLongo);
      
      // Verificar que o campo não aceita mais de 9 caracteres (formato 00000-000)
      cy.get('[data-cy="endereco-cep-input"]')
        .should('have.value.length.at.most', 9);
    });
  });
});
