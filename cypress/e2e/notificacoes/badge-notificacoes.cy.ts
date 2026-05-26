/**
 * Teste E2E: Badge de Notificações
 * 
 * Valida o funcionamento do badge de notificações no header.
 * - Badge aparece quando há notificações não lidas
 * - Badge mostra o número correto de notificações
 * - Badge desaparece quando notificações são marcadas como lidas
 */

describe('Badge de Notificações', () => {
  beforeEach(() => {
    // Configurar headers de multi-tenancy
    cy.intercept('**', (req) => {
      req.headers['x-use-test-db'] = 'true';
    });
  });

  it('deve exibir badge com contador quando há notificações não lidas', () => {
    // Login
    cy.loginProgramatico('cliente');

    // Obter UUID da loja padrão
    cy.obterLojaPadraoUuid().then((lojaUuid) => {
      // Criar notificação não lida via API
      cy.request({
        method: 'POST',
        url: '/api/notificacoes/teste/criar',
        headers: {
          'x-loja-uuid': lojaUuid,
          'x-use-test-db': 'true',
        },
        body: {
          usuarioEmail: 'cliente@teste.com',
          tipo: 'RASTREIO',
          titulo: 'Pedido em Trânsito',
          mensagem: 'Seu pedido foi despachado!',
          codigoRastreio: 'BR123456789',
        },
      });

    // Navegar para home
    cy.visit('/');

    // Validar que badge aparece com contador
    cy.get('[data-cy="header-notificacoes-link"]')
      .should('be.visible')
      .find('[data-cy="notification-badge"]')
      .should('be.visible')
      .and('contain', '1');
  });

  it('deve exibir contador correto quando há múltiplas notificações', () => {
    // Login
    cy.loginProgramatico('cliente');

    // Obter UUID da loja padrão
    cy.obterLojaPadraoUuid().then((lojaUuid) => {
      // Criar 3 notificações não lidas via API
      for (let i = 0; i < 3; i++) {
        cy.request({
          method: 'POST',
          url: '/api/notificacoes/teste/criar',
          headers: {
            'x-loja-uuid': lojaUuid,
            'x-use-test-db': 'true',
          },
          body: {
            usuarioEmail: 'cliente@teste.com',
            tipo: 'RASTREIO',
            titulo: `Notificação ${i + 1}`,
            mensagem: `Mensagem ${i + 1}`,
          },
        });
      }

      // Navegar para home
      cy.visit('/');

      // Validar que badge mostra contador 3
      cy.get('[data-cy="header-notificacoes-link"]')
        .find('[data-cy="notification-badge"]')
        .should('contain', '3');
    });
  });

  it('não deve exibir badge quando não há notificações não lidas', () => {
    // Login
    cy.loginProgramatico('cliente');

    // Navegar para home
    cy.visit('/');

    // Validar que badge não aparece
    cy.get('[data-cy="header-notificacoes-link"]')
      .should('be.visible')
      .find('[data-cy="notification-badge"]')
      .should('not.exist');
  });

  it('deve remover badge ao marcar notificação como lida', () => {
    // Login
    cy.loginProgramatico('cliente');

    // Obter UUID da loja padrão
    cy.obterLojaPadraoUuid().then((lojaUuid) => {
      // Criar notificação não lida via API
      cy.request({
        method: 'POST',
        url: '/api/notificacoes/teste/criar',
        headers: {
          'x-loja-uuid': lojaUuid,
          'x-use-test-db': 'true',
        },
        body: {
          usuarioEmail: 'cliente@teste.com',
          tipo: 'RASTREIO',
          titulo: 'Pedido em Trânsito',
          mensagem: 'Seu pedido foi despachado!',
        },
      }).then((response) => {
        const notificacaoUuid = response.body.uuid;

        // Navegar para home
        cy.visit('/');

        // Validar que badge aparece
        cy.get('[data-cy="header-notificacoes-link"]')
          .find('[data-cy="notification-badge"]')
          .should('be.visible');

        // Marcar notificação como lida via API
        cy.request({
          method: 'PUT',
          url: `/api/notificacoes/${notificacaoUuid}/lida`,
          headers: {
            'x-loja-uuid': lojaUuid,
            'x-use-test-db': 'true',
          },
        });

        // Aguardar polling do hook (30s) ou recarregar página
        cy.reload();

        // Validar que badge não aparece mais
        cy.get('[data-cy="header-notificacoes-link"]')
          .find('[data-cy="notification-badge"]')
          .should('not.exist');
      });
    });
  });

  it('deve atualizar contador após marcar notificação como lida', () => {
    // Login
    cy.loginProgramatico('cliente');

    // Obter UUID da loja padrão
    cy.obterLojaPadraoUuid().then((lojaUuid) => {
      // Criar 2 notificações não lidas via API
      const notificacoesUuids: string[] = [];

      cy.request({
        method: 'POST',
        url: '/api/notificacoes/teste/criar',
        headers: {
          'x-loja-uuid': lojaUuid,
          'x-use-test-db': 'true',
        },
        body: {
          usuarioEmail: 'cliente@teste.com',
          tipo: 'RASTREIO',
          titulo: 'Notificação 1',
          mensagem: 'Mensagem 1',
        },
      }).then((response) => {
        notificacoesUuids.push(response.body.uuid);
      });

      cy.request({
        method: 'POST',
        url: '/api/notificacoes/teste/criar',
        headers: {
          'x-loja-uuid': lojaUuid,
          'x-use-test-db': 'true',
        },
        body: {
          usuarioEmail: 'cliente@teste.com',
          tipo: 'RASTREIO',
          titulo: 'Notificação 2',
          mensagem: 'Mensagem 2',
        },
      }).then((response) => {
        notificacoesUuids.push(response.body.uuid);
      });

      // Navegar para home
      cy.visit('/');

      // Validar que badge mostra contador 2
      cy.get('[data-cy="header-notificacoes-link"]')
        .find('[data-cy="notification-badge"]')
        .should('contain', '2');

      // Marcar uma notificação como lida
      cy.request({
        method: 'PUT',
        url: `/api/notificacoes/${notificacoesUuids[0]}/lida`,
        headers: {
          'x-loja-uuid': lojaUuid,
          'x-use-test-db': 'true',
        },
      });

      // Recarregar página
      cy.reload();

      // Validar que contador atualizou para 1
      cy.get('[data-cy="header-notificacoes-link"]')
        .find('[data-cy="notification-badge"]')
        .should('contain', '1');
    });
  });
});
