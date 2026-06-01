/**
 * Testes E2E — Sugestões Rápidas do Assistente de IA (CDU010, RF0101)
 *
 * Verifica os chips de sugestão rápida exibidos no início da conversa.
 * Os chips são renderizados em ChatInterface.tsx dentro do container
 * com aria-label="Sugestões rápidas" quando `mensagens.length <= 1 && !isEnviando`.
 *
 * Chips disponíveis (constante SUGESTOES_RAPIDAS):
 *   - "Status do meu pedido"
 *   - "Livros mais vendidos em Fantasia"
 *   - "Presente para adolescente"
 *
 * Seletores usados (chips não têm data-cy próprio):
 *   - Container:  [aria-label="Sugestões rápidas"]
 *   - Chip:       cy.contains('[aria-label="Sugestões rápidas"] button', 'texto')
 */

describe('Assistente IA — Sugestões Rápidas', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-sidebar').should('be.visible');
  });

  it('deve exibir os chips de sugestão rápida no início da conversa (sem mensagens)', () => {
    cy.get('[aria-label="Sugestões rápidas"]')
      .should('be.visible')
      .within(() => {
        cy.contains('button', 'Status do meu pedido').should('be.visible');
        cy.contains('button', 'Livros mais vendidos em Fantasia').should('be.visible');
        cy.contains('button', 'Presente para adolescente').should('be.visible');
      });
  });

  it('deve exibir exatamente 3 chips de sugestão rápida', () => {
    cy.get('[aria-label="Sugestões rápidas"] button').should('have.length', 3);
  });

  it('deve enviar mensagem automaticamente ao clicar em "Status do meu pedido"', () => {
    cy.intercept('POST', '**/ia/chat', {
      fixture: 'ia/chat-resposta-status-pedido.json',
    }).as('chatStatusPedido');

    cy.contains('[aria-label="Sugestões rápidas"] button', 'Status do meu pedido').click();

    cy.wait('@chatStatusPedido');

    // A mensagem do usuário deve aparecer com o texto do chip
    cy.getDataCy('chat-mensagem-usuario')
      .should('be.visible')
      .and('contain.text', 'Status do meu pedido');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
    cy.getDataCy('chat-erro').should('not.exist');
  });

  it('deve enviar mensagem automaticamente ao clicar em "Livros mais vendidos em Fantasia"', () => {
    cy.contains('[aria-label="Sugestões rápidas"] button', 'Livros mais vendidos em Fantasia').click();

    cy.wait('@chatIA');

    cy.getDataCy('chat-mensagem-usuario')
      .should('be.visible')
      .and('contain.text', 'Livros mais vendidos em Fantasia');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
  });

  it('deve ocultar os chips de sugestão após clicar em um deles', () => {
    cy.contains('[aria-label="Sugestões rápidas"] button', 'Presente para adolescente').click();

    cy.wait('@chatIA');

    // Após a conversa iniciar (mensagens.length > 1), chips não renderizam
    cy.get('[aria-label="Sugestões rápidas"]').should('not.exist');
  });

  it('deve ocultar os chips após digitar e enviar uma mensagem manual', () => {
    cy.getDataCy('chat-entrada-mensagem').type('Livros de aventura');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.get('[aria-label="Sugestões rápidas"]').should('not.exist');
  });

  it('deve mostrar os chips novamente após limpar a conversa', () => {
    // 1) Inicia a conversa (chips desaparecem)
    cy.getDataCy('chat-entrada-mensagem').type('Livros de terror');
    cy.getDataCy('chat-botao-enviar').click();
    cy.wait('@chatIA');
    cy.get('[aria-label="Sugestões rápidas"]').should('not.exist');

    // 2) Limpa a conversa — mensagens zeradas → chips voltam
    cy.getDataCy('chat-botao-limpar').click();

    cy.get('[aria-label="Sugestões rápidas"]').should('be.visible');
    cy.contains('[aria-label="Sugestões rápidas"] button', 'Status do meu pedido').should('be.visible');
  });

  it('deve manter chips desabilitados enquanto há resposta em andamento', () => {
    cy.intercept('POST', '**/ia/chat', (req) => {
      req.on('response', (res) => {
        res.setDelay(1500);
      });
      req.reply({ fixture: 'ia/chat-resposta.json' });
    }).as('chatLento');

    // Clicar no chip envia a mensagem → isEnviando = true → chips não visíveis
    cy.contains('[aria-label="Sugestões rápidas"] button', 'Presente para adolescente').click();

    // Imediatamente após o clique, a mensagem do usuário está visível
    cy.getDataCy('chat-mensagem-usuario').should('be.visible');

    // Durante o loading, os chips não devem aparecer (isEnviando = true)
    cy.get('[aria-label="Sugestões rápidas"]').should('not.exist');

    cy.wait('@chatLento');
  });

  it('deve listar chips com texto idêntico ao da constante SUGESTOES_RAPIDAS', () => {
    const chipEsperados = [
      'Status do meu pedido',
      'Livros mais vendidos em Fantasia',
      'Presente para adolescente',
    ];

    cy.get('[aria-label="Sugestões rápidas"] button').each(($btn, idx) => {
      expect($btn.text().trim()).to.equal(chipEsperados[idx]);
    });
  });
});
