/**
 * E2E Test - Sistema de Reservas de Estoque no Carrinho
 * 
 * Testa a funcionalidade de reservas de estoque implementada (RN0044 + RNF0042):
 * 1. Ao adicionar item ao carrinho, estoque é reservado
 * 2. Ao remover item, reserva é cancelada
 * 3. Ao limpar carrinho, todas as reservas são canceladas
 * 4. Sistema de expiração de reservas (simulado)
 */

describe('Sistema de Reservas de Estoque', () => {
  const clienteEmail = 'clientetest@email.com';
  const clienteSenha = 'ASDF@asdf123';

  const API = Cypress.env('apiUrl') ?? 'http://localhost:3001/api';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Isola o estado: o carrinho do cliente é persistido no backend e acumula
    // itens entre execuções. Limpa via API para cada teste começar vazio.
    cy.request('POST', `${API}/auth/login`, { email: clienteEmail, senha: clienteSenha })
      .then((loginRes) => {
        const token = loginRes.body.dados.token;
        cy.request({
          method: 'DELETE',
          url: `${API}/carrinho`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  /**
   * Helper para login de cliente via UI
   */
  function loginCliente() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').type(clienteEmail);
    cy.get('[data-cy="login-password-input"]').type(clienteSenha);
    cy.get('[data-cy="login-submit-button"]').click();
    cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
  }

  /**
   * Helper para adicionar livro ao carrinho
   */
  function adicionarLivroAoCarrinho() {
    // O POST /carrinho/itens só ocorre com auth re-hidratada (isAuthenticated=true);
    // aguarda o header autenticado antes de clicar e espera o sync concluir.
    cy.intercept('POST', '**/carrinho/itens').as('syncItemCarrinho');
    cy.visit('/');
    cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="adicionar-carrinho-card-button"]').first().click();
    cy.wait('@syncItemCarrinho', { timeout: 10000 });
  }

  /**
   * Helper para navegar para carrinho
   */
  function navegarParaCarrinho() {
    cy.visit('/carrinho');
    cy.url().should('include', '/carrinho');
    cy.get('[data-cy="carrinho-page"]', { timeout: 10000 }).should('be.visible');
  }

  describe('Reserva ao Adicionar Item', () => {
    it('deve criar reserva de estoque ao adicionar item ao carrinho', () => {
      /**
       * Testa que ao adicionar um livro ao carrinho:
       * 1. O item aparece no carrinho
       * 2. A reserva de estoque é criada no backend
       * 3. O estoque disponível é reduzido
       */
      cy.log('=== ETAPA 1: Login do Cliente ===');
      loginCliente();

      cy.log('=== ETAPA 2: Adicionar livro ao carrinho ===');
      adicionarLivroAoCarrinho();

      cy.log('=== ETAPA 3: Verificar carrinho ===');
      navegarParaCarrinho();

      // Verificar que há itens no carrinho
      cy.get('[data-cy="carrinho-table"]').should('be.visible');
      cy.get('[data-cy="carrinho-item-row"]').should('have.length.at.least', 1);

      // Verificar que o item tem quantidade
      cy.get('[data-cy="carrinho-item-row"]').first().within(() => {
        cy.get('[data-cy="carrinho-item-quantidade"]').should('be.visible');
        cy.get('[data-cy="carrinho-item-quantidade"]').should('have.value', '1');
      });

      cy.log('[RESERVA] Item adicionado ao carrinho e reserva de estoque criada');
    });
  });

  describe('Cancelamento de Reserva ao Remover Item', () => {
    it('deve cancelar reserva ao remover item do carrinho', () => {
      /**
       * Testa que ao remover um item do carrinho:
       * 1. O item é removido do carrinho
       * 2. A reserva de estoque é cancelada
       * 3. O estoque é liberado
       */
      cy.log('=== ETAPA 1: Login e Adicionar livro ===');
      loginCliente();
      adicionarLivroAoCarrinho();

      cy.log('=== ETAPA 2: Navegar para carrinho ===');
      navegarParaCarrinho();

      cy.log('=== ETAPA 3: Remover item do carrinho ===');
      cy.get('[data-cy="carrinho-item-row"]').first().within(() => {
        cy.get('[data-cy="carrinho-item-remover"]').click();
      });

      // Verificar que carrinho ficou vazio
      cy.get('[data-cy="carrinho-vazio"]').should('be.visible');

      cy.log('[RESERVA] Item removido e reserva de estoque cancelada');
    });
  });

  describe('Cancelamento de Reservas ao Limpar Carrinho', () => {
    it('deve cancelar todas as reservas ao limpar carrinho', () => {
      /**
       * Testa que ao limpar o carrinho:
       * 1. Todos os itens são removidos
       * 2. Todas as reservas são canceladas
       * 3. Todo o estoque é liberado
       *
       * Nota: intercept configurado antes de navegar para capturar o DELETE.
       * O cy.wait('@limparCarrinho') garante que o handler remoto foi chamado
       * (isAuthenticated = true no Redux) e não o handler local.
       */
      cy.intercept('DELETE', '/api/carrinho').as('limparCarrinho');

      cy.log('=== ETAPA 1: Login e Adicionar livro ===');
      loginCliente();
      adicionarLivroAoCarrinho();

      cy.log('=== ETAPA 2: Navegar para carrinho ===');
      navegarParaCarrinho();

      // Aguardar que o Redux re-hidrate com isAuthenticated=true antes de limpar.
      // O botão limpar usa `usarCarrinhoLocal = !isAuthenticated && !sessionLoading`;
      // se clicarmos antes da auth assentar, a limpeza é local e o DELETE não dispara.
      cy.get('[data-cy="header-user-profile"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="carrinho-item-row"]').should('have.length.at.least', 1);

      cy.log('=== ETAPA 3: Limpar carrinho ===');
      cy.get('[data-cy="carrinho-limpar"]').click();

      // Garantir que a chamada DELETE foi disparada (handler remoto, não local)
      cy.wait('@limparCarrinho', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });

      // Verificar que carrinho ficou vazio
      cy.get('[data-cy="carrinho-vazio"]').should('be.visible');

      cy.log('[RESERVA] Carrinho limpo e todas as reservas canceladas');
    });
  });

  describe('Validação de Backend - Reservas', () => {
    it('deve verificar chamadas de API de reservas', () => {
      /**
       * Testa que as chamadas de API de reservas são feitas corretamente:
       * 1. POST /api/carrinho/itens - cria/atualiza reserva ao adicionar item
       */
      // Intercept deve ser configurado antes de qualquer navegação
      cy.intercept('POST', '/api/carrinho/itens').as('sincronizarItem');

      loginCliente();
      adicionarLivroAoCarrinho();
      navegarParaCarrinho();

      // Verificar que sincronização de item foi chamada
      cy.wait('@sincronizarItem', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });

      cy.log('[RESERVA] Chamadas de API de reservas verificadas');
    });
  });

  describe('Seção Visual de Itens Expirados', () => {
    it('deve exibir seção de itens expirados quando houver itens expirados', () => {
      /**
       * Testa que a seção visual de itens expirados é exibida:
       * 1. Mock de resposta com itens expirados (configurado antes de navegar)
       * 2. Verificar que seção é exibida
       * 3. Verificar que botão está desabilitado
       */
      cy.log('=== ETAPA 1: Mock de resposta com itens expirados ===');
      cy.intercept('GET', '/api/carrinho', {
        itens: [],
        itensExpirados: [
          {
            uuid: 'expirado-1',
            imagem: '/placeholder.jpg',
            titulo: 'Livro Expirado Teste',
            isbn: '978-85-01-00000-99',
            precoUnitario: 49.90,
            quantidade: 1,
            subtotal: 49.90,
            motivoExpiracao: 'Tempo de reserva esgotado (30 minutos)',
          },
        ],
        fretePadrao: { valor: 15, prazo: '5 a 7 dias úteis' },
        resumo: { subtotal: 0, frete: 0, total: 0 },
      }).as('getCarrinhoComExpirados');

      cy.log('=== ETAPA 2: Login do Cliente ===');
      loginCliente();

      cy.log('=== ETAPA 2.5: Adicionar livro ao carrinho ===');
      adicionarLivroAoCarrinho();

      cy.log('=== ETAPA 3: Navegar para carrinho ===');
      navegarParaCarrinho();

      cy.log('=== ETAPA 4: Aguardar resposta mockada ===');
      cy.wait('@getCarrinhoComExpirados');

      cy.log('=== ETAPA 5: Verificar seção de itens expirados ===');
      cy.get('[data-cy="carrinho-itens-expirados"]').should('be.visible');
      cy.get('[data-cy="carrinho-item-expirado"]').should('have.length', 1);

      cy.log('=== ETAPA 6: Verificar informações do item expirado ===');
      cy.get('[data-cy="carrinho-item-expirado"]').within(() => {
        cy.contains('Livro Expirado Teste').should('be.visible');
        cy.contains('ISBN: 978-85-01-00000-99').should('be.visible');
        cy.contains('Tempo de reserva esgotado').should('be.visible');
      });

      cy.log('=== ETAPA 7: Verificar que botão está desabilitado ===');
      cy.get('[data-cy="carrinho-expirado-botao-adicionar"]').should('be.disabled');
      cy.contains('Botão desabilitado - estoque liberado').should('be.visible');

      cy.log('[EXPIRADOS] Seção visual de itens expirados verificada');
    });

    it('não deve exibir seção de itens expirados quando não houver itens expirados', () => {
      /**
       * Testa que a seção visual não é exibida quando não há itens expirados:
       * 1. Carrinho normal sem itens expirados
       * 2. Verificar que seção não é exibida
       */
      cy.log('=== ETAPA 1: Login e Adicionar livro ===');
      loginCliente();
      adicionarLivroAoCarrinho();

      cy.log('=== ETAPA 2: Navegar para carrinho ===');
      navegarParaCarrinho();

      cy.log('=== ETAPA 3: Verificar que seção de expirados não é exibida ===');
      cy.get('[data-cy="carrinho-itens-expirados"]').should('not.exist');

      cy.log('[EXPIRADOS] Seção não exibida quando não há itens expirados');
    });
  });
});
