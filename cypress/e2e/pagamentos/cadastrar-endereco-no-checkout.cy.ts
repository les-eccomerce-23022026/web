/**
 * Testes E2E de Cadastro de Novo Endereço no Checkout
 * RF0036 — Endereço de Entrega
 * 
 * Cobertura do fluxo de cadastro de novo endereço durante o checkout:
 * - Cliente sem endereços cadastrados
 * - Redirecionamento para perfil para cadastro
 * - Cadastro de novo endereço
 * - Retorno ao checkout com endereço disponível
 * - Seleção do novo endereço para entrega
 */

function apiHeadersCliente(): Record<string, string> {
  const useTestDb = Cypress.env('injectTestDbHeader') === true;
  return {
    'Content-Type': 'application/json; charset=utf-8',
    ...(useTestDb ? { 'x-use-test-db': 'true' } : {}),
  };
}

describe('Pagamentos — Cadastrar Endereço Durante o Checkout', () => {
  beforeEach(() => {
    const email = (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
    const senha =
      (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKL\u00C7123';
    
    // Login e limpar carrinho
    cy.autenticarViaApi(email, senha);
    cy.limparCarrinhoViaApi();
    
    // Remover todos os endereços do cliente
    cy.removerEnderecosUsuarioViaApi();
    
    // Adicionar livro ao carrinho
    cy.adicionarPrimeiroLivroCarrinhoDetalhe();

    cy.url().should('include', '/carrinho');
    cy.contains('Carrinho de Compras', { timeout: 15000 }).should('be.visible');

    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');
  });

  describe('Fluxo Sem Endereços Cadastrados', () => {
    it('deve exibir mensagem quando não há endereços cadastrados', () => {
      cy.get('[data-cy="checkout-no-addresses"]')
        .should('exist');
      
      cy.contains('Nenhum endereço cadastrado')
        .should('be.visible');
      
      cy.contains('É necessário cadastrar um endereço para continuar a compra')
        .should('be.visible');
    });

    it('deve exibir link para ir ao perfil cadastrar endereço', () => {
      cy.get('[data-cy="checkout-add-address-link"]')
        .should('exist')
        .should('contain', 'Ir ao perfil para cadastrar endereço');
    });

    it('deve redirecionar para perfil ao clicar no link', () => {
      cy.get('[data-cy="checkout-add-address-link"]')
        .click();
      
      cy.url()
        .should('include', '/minha-conta');
    });

    it('deve manter botão de finalizar desabilitado sem endereço', () => {
      cy.get('[data-cy="checkout-finish-button"]')
        .should('be.disabled');
    });
  });

  describe('Cadastro de Endereço no Perfil e Retorno ao Checkout', () => {
    it('deve cadastrar novo endereço no perfil e retornar ao checkout', () => {
      // Clicar para ir ao perfil
      cy.get('[data-cy="checkout-add-address-link"]')
        .click();
      
      cy.url()
        .should('include', '/minha-conta');
      
      // Navegar para seção de endereços (se necessário)
      cy.contains('Endereços', { timeout: 10000 })
        .should('be.visible')
        .click();
      
      // Preencher formulário de novo endereço
      cy.get('[data-cy="endereco-logradouro-input"]', { timeout: 10000 })
        .should('be.visible')
        .type('Rua Nova Teste');
      
      cy.get('[data-cy="endereco-numero-input"]')
        .type('456');
      
      cy.get('[data-cy="endereco-complemento-input"]')
        .type('Apto 2');
      
      cy.get('[data-cy="endereco-bairro-input"]')
        .type('Centro');
      
      cy.get('[data-cy="endereco-cidade-input"]')
        .type('São Paulo');
      
      cy.get('[data-cy="endereco-estado-input"]')
        .select('SP');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01100-000');
      
      cy.get('[data-cy="endereco-tipo-input"]')
        .select('entrega');
      
      cy.get('[data-cy="endereco-apelido-input"]')
        .type('Trabalho');
      
      // Marcar como principal
      cy.get('[data-cy="endereco-principal-checkbox"]')
        .check();
      
      // Salvar endereço
      cy.get('[data-cy="endereco-salvar-button"]')
        .click();
      
      // Verificar mensagem de sucesso
      cy.contains('Endereço salvo com sucesso')
        .should('be.visible');
      
      // Retornar ao checkout
      cy.visit('/checkout');
      cy.url()
        .should('include', '/checkout');
      
      // Verificar que endereço está disponível
      cy.get('[data-cy="checkout-addresses"]')
        .should('exist');
      
      cy.get('[data-cy^="checkout-address-item-"]')
        .should('have.length.at.least', 1);
      
      // Verificar que o novo endereço aparece
      cy.contains('Rua Nova Teste')
        .should('be.visible');
    });

    it('deve selecionar o novo endereço e continuar com o checkout', () => {
      // Cadastrar endereço (via API para agilizar)
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Teste Checkout',
          numero: '789',
          complemento: 'Sala 3',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          tipo: 'entrega',
          principal: true,
          apelido: 'Escritório',
        },
      }).then(() => {
        // Recarregar checkout
        cy.visit('/checkout');
        
        // Selecionar o endereço
        cy.get('[data-cy^="checkout-address-item-"]')
          .first()
          .scrollIntoView()
          .should('be.visible')
          .click();
        
        cy.get('[data-cy^="checkout-address-item-"]')
          .first()
          .should('have.attr', 'data-selected', 'true');
        
        // Verificar mensagem de confirmação
        cy.contains('Endereço selecionado para entrega')
          .should('be.visible');
      });
    });
  });

  describe('Validações de Cadastro de Endereço', () => {
    beforeEach(() => {
      // Navegar para perfil
      cy.get('[data-cy="checkout-add-address-link"]')
        .click();
      
      cy.url()
        .should('include', '/minha-conta');
      
      cy.contains('Endereços')
        .should('be.visible')
        .click();
    });

    it('deve validar campos obrigatórios do endereço', () => {
      // Tentar salvar sem preencher campos
      cy.get('[data-cy="endereco-salvar-button"]')
        .click();
      
      // Verificar mensagens de erro
      cy.contains('Logradouro é obrigatório')
        .should('be.visible');
      
      cy.contains('Número é obrigatório')
        .should('be.visible');
      
      cy.contains('CEP é obrigatório')
        .should('be.visible');
    });

    it('deve validar formato do CEP', () => {
      cy.get('[data-cy="endereco-cep-input"]')
        .type('12345');
      
      cy.get('[data-cy="endereco-salvar-button"]')
        .click();
      
      cy.contains('CEP inválido')
        .should('be.visible');
    });

    it('deve formatar CEP automaticamente', () => {
      cy.get('[data-cy="endereco-cep-input"]')
        .type('01100000');
      
      cy.get('[data-cy="endereco-cep-input"]')
        .should('have.value', '01100-000');
    });
  });

  describe('Múltiplos Endereços no Checkout', () => {
    it('deve exibir lista de endereços quando há múltiplos cadastrados', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Cadastrar dois endereços via API
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Primeiro',
          numero: '100',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
          tipo: 'entrega',
          principal: true,
          apelido: 'Casa',
        },
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/clientes/perfil/enderecos`,
          headers: apiHeadersCliente(),
          body: {
            logradouro: 'Rua Segundo',
            numero: '200',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01310-100',
            tipo: 'entrega',
            principal: false,
            apelido: 'Trabalho',
          },
        });
      }).then(() => {
        // Recarregar checkout
        cy.visit('/checkout');
        
        // Verificar que há 2 endereços
        cy.get('[data-cy^="checkout-address-item-"]')
          .should('have.length', 2);
        
        // Verificar que ambos endereços aparecem
        cy.contains('Rua Primeiro')
          .should('be.visible');
        
        cy.contains('Rua Segundo')
          .should('be.visible');
      });
    });

    it('deve permitir alternar entre endereços', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Cadastrar dois endereços via API
      cy.request({
        method: 'POST',
        url: `${apiUrl}/clientes/perfil/enderecos`,
        headers: apiHeadersCliente(),
        body: {
          logradouro: 'Rua Alternar 1',
          numero: '100',
          complemento: '',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000',
          tipo: 'entrega',
          principal: true,
          apelido: 'Casa',
        },
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/clientes/perfil/enderecos`,
          headers: apiHeadersCliente(),
          body: {
            logradouro: 'Rua Alternar 2',
            numero: '200',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01310-100',
            tipo: 'entrega',
            principal: false,
            apelido: 'Trabalho',
          },
        });
      }).then(() => {
        // Recarregar checkout
        cy.visit('/checkout');
        
        // Selecionar primeiro endereço
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(0)
          .scrollIntoView()
          .click();
        
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(0)
          .should('have.attr', 'data-selected', 'true');
        
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(1)
          .should('have.attr', 'data-selected', 'false');
        
        // Alternar para segundo endereço
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(1)
          .scrollIntoView()
          .click();
        
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(1)
          .should('have.attr', 'data-selected', 'true');
        
        cy.get('[data-cy^="checkout-address-item-"]')
          .eq(0)
          .should('have.attr', 'data-selected', 'false');
      });
    });
  });
});
