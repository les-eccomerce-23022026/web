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
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');

    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

    cy.visit('/ia-assistente', { failOnStatusCode: false });
  });

  it('deve renderizar a interface do assistente com campo de entrada e botão de envio', () => {
    cy.get('[data-testid="ia-chatbot-container"]').should('be.visible');
    cy.get('[data-testid="ia-chatbot-input"]')
      .should('be.visible')
      .and('have.attr', 'placeholder');
    cy.get('[data-testid="ia-chatbot-enviar"]')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('deve exibir mensagem de boas-vindas ao carregar a página (RF0101)', () => {
    cy.get('[data-testid="ia-chatbot-container"]').should('be.visible');
    cy.get('[data-testid="ia-mensagem-boas-vindas"]').should('be.visible');
  });

  it('deve enviar uma mensagem ao chatbot e exibir a resposta do assistente (RF0104)', () => {
    const pergunta = 'Quero livros de ficção científica épica com mundos complexos';

    cy.get('[data-testid="ia-chatbot-input"]').type(pergunta);
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.get('[data-testid="ia-chatbot-mensagem-usuario"]')
      .should('be.visible')
      .and('contain.text', pergunta);

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-chatbot-mensagem-assistente"]')
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

    cy.get('[data-testid="ia-chatbot-input"]').type(pergunta);
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIAValidado');
  });

  it('deve exibir os produtos recomendados com título, autor e motivo (RF0105)', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').should('have.length.at.least', 1);

    cy.get('[data-testid="ia-produto-card"]').first().within(() => {
      cy.get('[data-testid="ia-produto-titulo"]').should('not.be.empty');
      cy.get('[data-testid="ia-produto-autor"]').should('not.be.empty');
      cy.get('[data-testid="ia-produto-motivo"]').should('not.be.empty');
    });
  });

  it('deve exibir o preço dos produtos recomendados formatado em reais', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').first().within(() => {
      cy.get('[data-testid="ia-produto-preco"]')
        .should('be.visible')
        .and('contain.text', 'R$');
    });
  });

  it('deve exibir link de navegação para cada produto recomendado', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').first().within(() => {
      cy.get('[data-testid="ia-produto-link"]')
        .should('have.attr', 'href')
        .and('include', '/livro/');
    });
  });

  it('deve permitir envio de mensagem via tecla Enter (acessibilidade)', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('livros de suspense{enter}');

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-chatbot-mensagem-assistente"]').should('be.visible');
  });

  it('deve limpar o campo de entrada após envio da mensagem', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('livros de romance');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-chatbot-input"]').should('have.value', '');
  });

  it('deve exibir a justificativa textual de cada recomendação (RF0105)', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').each(($card) => {
      cy.wrap($card)
        .find('[data-testid="ia-produto-motivo"]')
        .should('not.be.empty');
    });
  });

  it('deve desabilitar o botão de envio enquanto o campo de texto estiver vazio', () => {
    cy.get('[data-testid="ia-chatbot-input"]').clear();
    cy.get('[data-testid="ia-chatbot-enviar"]').should('be.disabled');

    cy.get('[data-testid="ia-chatbot-input"]').type('livros');
    cy.get('[data-testid="ia-chatbot-enviar"]').should('not.be.disabled');
  });
});
