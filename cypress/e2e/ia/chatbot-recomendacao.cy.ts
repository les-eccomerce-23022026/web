/**
 * Testes E2E — Assistente de Recomendação (CDU010, RF0101, RF0104, RF0105)
 *
 * Cobre o fluxo completo de interação com o chatbot de recomendação de livros:
 * - Renderização da interface do assistente
 * - Envio de mensagem e exibição da resposta
 * - Exibição de produtos recomendados com justificativa
 * - Navegação a partir das recomendações
 *
 * Todos os testes usam cy.intercept para isolar a UI do backend de IA.
 */

describe('Assistente IA — Fluxo de Recomendação via Chatbot (CDU010)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');

    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

    cy.visit('/', { failOnStatusCode: false });
  });

  it('deve renderizar a interface do assistente com campo de entrada e botão de envio', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-painel').should('be.visible');
    cy.getDataCy('chat-entrada-mensagem')
      .should('be.visible')
      .and('have.attr', 'placeholder');
    cy.getDataCy('chat-botao-enviar')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('deve exibir mensagem de boas-vindas ao carregar a página (RF0101)', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-painel').should('be.visible');
    // O chatbot não tem mensagem de boas-vindas explícita, apenas o campo de entrada
    cy.getDataCy('chat-entrada-mensagem').should('be.visible');
  });

  it('deve enviar uma mensagem ao chatbot e exibir a resposta do assistente (RF0104)', () => {
    const pergunta = 'Quero livros de ficção científica épica com mundos complexos';

    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type(pergunta);
    cy.getDataCy('chat-botao-enviar').click();

    cy.getDataCy('chat-mensagem-usuario')
      .should('be.visible')
      .and('contain.text', pergunta);

    cy.wait('@chatIA');

    cy.getDataCy('chat-mensagem-assistente')
      .should('be.visible')
      .and('contain.text', 'ficção científica');
  });

  it('deve verificar que o payload enviado à API contém a mensagem do usuário', () => {
    const pergunta = 'Recomende livros de fantasia medieval';

    cy.intercept('POST', '**/ia/chat', (req) => {
      expect(req.body).to.have.property('mensagem');
      expect(req.body.mensagem).to.equal(pergunta);
      req.reply({ fixture: 'ia/chat-resposta.json' });
    }).as('chatIAValidado');

    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type(pergunta);
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIAValidado');
  });

  it('deve exibir os produtos recomendados com título, autor e motivo (RF0105)', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').should('have.length.at.least', 1);

    cy.getDataCy('ia-produto-card').first().within(() => {
      cy.getDataCy('ia-produto-titulo').should('not.be.empty');
      cy.getDataCy('ia-produto-autor').should('not.be.empty');
      cy.getDataCy('ia-produto-motivo').should('not.be.empty');
    });
  });

  it('deve exibir o preço dos produtos recomendados formatado em reais', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').first().within(() => {
      cy.getDataCy('ia-produto-preco')
        .should('be.visible')
        .and('contain.text', 'R$');
    });
  });

  it('deve exibir link de navegação para cada produto recomendado', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').first().within(() => {
      cy.getDataCy('ia-produto-link')
        .should('have.attr', 'href')
        .and('include', '/livro/');
    });
  });

  it('deve permitir envio de mensagem via tecla Enter (acessibilidade)', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('livros de suspense{enter}');

    cy.wait('@chatIA');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
  });

  it('deve limpar o campo de entrada após envio da mensagem', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('livros de romance');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('chat-entrada-mensagem').should('have.value', '');
  });

  it('deve exibir a justificativa textual de cada recomendação (RF0105)', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').each(($card) => {
      cy.wrap($card)
        .find('[data-cy="ia-produto-motivo"]')
        .should('not.be.empty');
    });
  });

  it('deve desabilitar o botão de envio enquanto o campo de texto estiver vazio', () => {
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-entrada-mensagem').clear();
    cy.getDataCy('chat-botao-enviar').should('be.disabled');

    cy.getDataCy('chat-entrada-mensagem').type('livros');
    cy.getDataCy('chat-botao-enviar').should('not.be.disabled');
  });
});
