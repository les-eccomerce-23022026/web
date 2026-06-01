/**
 * Visibilidade e comportamento do painel lateral do assistente de IA.
 *
 * - Visitante não logado: FAB não exibido.
 * - Cliente autenticado: FAB visível e clique abre o painel lateral (sidebar).
 * - Administrador: FAB não exibido.
 *
 * Testes de sidebar (drawer/PainelLateral):
 *   - chat-sidebar        → painel lateral aberto
 *   - chat-sidebar-overlay → overlay semitransparente (clicar fora fecha)
 *   - chat-sidebar-fechar → botão X do cabeçalho do drawer
 *   - Tecla Escape        → fecha via window keydown listener
 *   - overflow: hidden    → scroll do body bloqueado enquanto aberto
 */

describe('Assistente IA — Visibilidade por autenticação', () => {
  it('não deve exibir o botão flutuante para visitante não autenticado', () => {
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('not.exist');
  });

  it('deve exibir o botão flutuante para cliente autenticado', () => {
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.loginProgramatico('cliente');
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('be.visible');
  });

  it('não deve exibir o botão flutuante para administrador logado', () => {
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.loginProgramatico('admin');
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').should('not.exist');
  });

  describe('Sidebar — abertura e controles do painel lateral', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
      cy.loginProgramatico('cliente');
      cy.visit('/', { failOnStatusCode: false });
    });

    it('deve abrir o painel lateral (chat-sidebar) ao clicar no botão flutuante', () => {
      // Drawer não existe no DOM antes de abrir (PainelLateral usa "if (!aberto) return null")
      cy.getDataCy('chat-sidebar').should('not.exist');

      cy.getDataCy('chat-flutuante-botao').click();

      cy.getDataCy('chat-sidebar').should('be.visible');
      cy.getDataCy('chat-painel').should('be.visible');
    });

    it('deve fechar o painel lateral ao clicar no overlay (clicar fora fecha)', () => {
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      cy.getDataCy('chat-sidebar-overlay').click();

      cy.getDataCy('chat-sidebar').should('not.exist');
    });

    it('deve fechar o painel lateral ao pressionar a tecla Escape', () => {
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      // PainelLateral escuta window.addEventListener('keydown', ...)
      cy.window().then((win) => {
        win.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      cy.getDataCy('chat-sidebar').should('not.exist');
    });

    it('deve fechar o painel lateral ao clicar no botão fechar do cabeçalho', () => {
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      cy.getDataCy('chat-sidebar-fechar').click();

      cy.getDataCy('chat-sidebar').should('not.exist');
    });

    it('deve bloquear o scroll do body enquanto o painel lateral está aberto', () => {
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      // ChatFlutuante aplica document.body.style.overflow = 'hidden' quando aberto
      cy.get('body').should('have.css', 'overflow', 'hidden');
    });

    it('deve restaurar o scroll do body após fechar o painel lateral', () => {
      cy.getDataCy('chat-flutuante-botao').click();
      cy.get('body').should('have.css', 'overflow', 'hidden');

      cy.getDataCy('chat-sidebar-fechar').click();
      cy.getDataCy('chat-sidebar').should('not.exist');

      // overflow volta ao valor padrão (não 'hidden')
      cy.get('body').invoke('css', 'overflow').should('not.eq', 'hidden');
    });
  });
});
