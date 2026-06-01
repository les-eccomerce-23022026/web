/**
 * Testes E2E — Pós-Venda: Status do Pedido (CDU010, RF0101)
 *
 * Verifica que o assistente de IA responde corretamente a perguntas
 * de pós-venda sobre acompanhamento de pedidos do cliente:
 *
 * - Fluxo completo: pergunta → resposta com dados do pedido
 * - Payload enviado contém a mensagem do usuário
 * - Resposta menciona dados relevantes (número, status, previsão)
 * - Perguntas de acompanhamento (follow-up) mantêm o histórico
 *
 * A API de chat é mockada com cy.intercept usando a fixture
 * ia/chat-resposta-status-pedido.json (inclui dados de pedido na resposta).
 */

describe('Assistente IA — Pós-Venda: Status do Pedido', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.intercept('POST', '**/ia/chat', {
      fixture: 'ia/chat-resposta-status-pedido.json',
    }).as('chatStatusPedido');

    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-sidebar').should('be.visible');
  });

  it('deve permitir ao cliente perguntar sobre o status do pedido', () => {
    const pergunta = 'Qual o status do meu pedido?';

    cy.getDataCy('chat-entrada-mensagem').type(pergunta);
    cy.getDataCy('chat-botao-enviar').click();

    cy.getDataCy('chat-mensagem-usuario')
      .should('be.visible')
      .and('contain.text', pergunta);

    cy.wait('@chatStatusPedido');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
    cy.getDataCy('chat-erro').should('not.exist');
  });

  it('deve validar que a resposta menciona dados relevantes do pedido (RF0101)', () => {
    cy.getDataCy('chat-entrada-mensagem').type('Status do meu pedido');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatStatusPedido').then((interception) => {
      const resposta: string = interception.response?.body?.dados?.resposta ?? '';

      expect(resposta, 'A resposta não pode ser vazia').to.not.be.empty;

      // A resposta deve mencionar pelo menos um dado relevante do pedido
      const mencionaDadosDoPedido =
        /pedido|status|entrega|despacho|rastreamento|separação|prazo/i.test(resposta);
      expect(mencionaDadosDoPedido, 'A resposta deve mencionar dados do pedido').to.be.true;
    });

    cy.getDataCy('chat-mensagem-assistente')
      .should('be.visible')
      .and('not.have.text', '');
  });

  it('deve exibir o número do pedido na resposta do assistente', () => {
    cy.getDataCy('chat-entrada-mensagem').type('Status do meu pedido LIV-2024-8891');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatStatusPedido');

    cy.getDataCy('chat-mensagem-assistente')
      .should('be.visible')
      .and('contain.text', 'LIV-2024-8891');
  });

  it('deve validar que o payload enviado à API contém a mensagem do usuário', () => {
    const pergunta = 'Onde está meu pedido #LIV-2024-8891?';

    cy.intercept('POST', '**/ia/chat', (req) => {
      expect(req.body).to.have.property('mensagem');
      expect(req.body.mensagem).to.equal(pergunta);
      req.reply({ fixture: 'ia/chat-resposta-status-pedido.json' });
    }).as('chatPayloadValidado');

    cy.getDataCy('chat-entrada-mensagem').type(pergunta);
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatPayloadValidado');
    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
  });

  it('deve manter histórico e permitir perguntas de acompanhamento sobre o pedido', () => {
    cy.getDataCy('chat-entrada-mensagem').type('Status do meu pedido');
    cy.getDataCy('chat-botao-enviar').click();
    cy.wait('@chatStatusPedido');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');

    // Segunda pergunta deve enviar o histórico da conversa
    cy.intercept('POST', '**/ia/chat', (req) => {
      expect(req.body).to.have.property('historico');
      expect(req.body.historico).to.be.an('array').and.have.length.at.least(1);
      req.reply({ fixture: 'ia/chat-resposta-status-pedido.json' });
    }).as('chatFollowUp');

    cy.getDataCy('chat-entrada-mensagem').type('E qual a previsão de entrega?');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatFollowUp');
    cy.getDataCy('chat-mensagem-assistente').should('have.length.at.least', 2);
  });

  it('deve exibir previsão de entrega na resposta quando disponível', () => {
    cy.getDataCy('chat-entrada-mensagem').type('Quando meu pedido vai chegar?');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatStatusPedido').then((interception) => {
      const resposta: string = interception.response?.body?.dados?.resposta ?? '';
      const mencionaEntrega = /entrega|previsão|prazo|dias úteis/i.test(resposta);
      expect(mencionaEntrega, 'A resposta deve mencionar prazo de entrega').to.be.true;
    });

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
  });

  it('deve impedir envio de pergunta vazia sobre status do pedido', () => {
    cy.intercept('POST', '**/ia/chat').as('chatNaoDeveChamar');

    cy.getDataCy('chat-entrada-mensagem').clear();
    cy.getDataCy('chat-botao-enviar').should('be.disabled');

    cy.get('@chatNaoDeveChamar.all').should('have.length', 0);
  });
});
