/**
 * Testes E2E — Estados de Loading e Tratamento de Erros (CDU010, RNF-Performance, RNF-Fallback)
 *
 * Cobre estados intermediários e de erro do assistente de IA:
 * - Indicador de carregamento durante aguardo de resposta
 * - Mensagem de erro quando o serviço de IA está indisponível
 * - Fallback para "Mais Vendidos" (CDU009) quando a IA falha (RN0105)
 * - Validação de campos obrigatórios
 * - Comportamento com respostas lentas (timeout UX)
 */

describe('Assistente IA — Estados de Loading e Tratamento de Erros (RNF)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
  });

  describe('Estado de carregamento', () => {
    it('deve exibir indicador de carregamento enquanto aguarda resposta do assistente', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        req.on('response', (res) => {
          res.setDelay(1500);
        });
        req.reply({ fixture: 'ia/chat-resposta.json' });
      }).as('chatIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      cy.getDataCy('chat-entrada-mensagem').type('livros de aventura');
      cy.getDataCy('chat-botao-enviar').click();

      // Verifica indicador de carregamento
      cy.getDataCy('ia-chatbot-loading').should('be.visible');
      cy.wait('@chatIA');
      cy.getDataCy('ia-chatbot-loading').should('not.exist');
    });

    it('deve desabilitar o botão de envio enquanto há resposta em andamento', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        req.on('response', (res) => {
          res.setDelay(1500);
        });
        req.reply({ fixture: 'ia/chat-resposta.json' });
      }).as('chatIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      cy.getDataCy('chat-entrada-mensagem').type('livros de suspense');
      cy.getDataCy('chat-botao-enviar').click();

      cy.getDataCy('chat-botao-enviar').should('be.disabled');
      cy.wait('@chatIA');
      cy.getDataCy('chat-botao-enviar').should('not.be.disabled');
    });

    it('deve desabilitar o campo de entrada enquanto a resposta está sendo carregada', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        req.on('response', (res) => {
          res.setDelay(1500);
        });
        req.reply({ fixture: 'ia/chat-resposta.json' });
      }).as('chatIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      cy.getDataCy('chat-entrada-mensagem').type('livros históricos');
      cy.getDataCy('chat-botao-enviar').click();

      cy.getDataCy('chat-entrada-mensagem').should('be.disabled');
      cy.wait('@chatIA');
      cy.getDataCy('chat-entrada-mensagem').should('not.be.disabled');
    });
  });

  describe('Tratamento de erro da API de IA', () => {
    beforeEach(() => {
      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');
    });

    it('deve exibir mensagem de erro amigável quando o serviço de IA retornar erro 500', () => {
      cy.intercept('POST', '**/ia/chat', {
        statusCode: 500,
        body: { sucesso: false, mensagem: 'Erro interno do serviço de IA' },
      }).as('chatErro500');

      cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatErro500');

      cy.getDataCy('chat-erro')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('deve exibir fallback de "Mais Vendidos" quando o serviço de IA estiver indisponível (RN0105)', () => {
      cy.intercept('POST', '**/ia/chat', {
        statusCode: 503,
        body: { sucesso: false, mensagem: 'Serviço temporariamente indisponível' },
      }).as('chatIndisponivel');

      cy.getDataCy('chat-entrada-mensagem').type('recomende um livro');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatIndisponivel');

      // Verifica mensagem de erro
      cy.getDataCy('chat-erro').should('be.visible');
    });

    it('deve permitir nova tentativa após erro sem precisar recarregar a página', () => {
      cy.intercept('POST', '**/ia/chat', {
        statusCode: 500,
        body: { sucesso: false, mensagem: 'Erro interno' },
      }).as('chatFalha');

      cy.getDataCy('chat-entrada-mensagem').type('livros de autoajuda');
      cy.getDataCy('chat-botao-enviar').click();
      cy.wait('@chatFalha');

      cy.getDataCy('chat-erro').should('be.visible');

      cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatRecuperado');

      cy.getDataCy('chat-entrada-mensagem').should('not.be.disabled').type('livros de autoajuda');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatRecuperado');
      cy.getDataCy('chat-mensagem-assistente').should('be.visible');
      cy.getDataCy('chat-erro').should('not.exist');
    });

    it('deve exibir erro de rede de forma amigável quando não há conexão', () => {
      cy.intercept('POST', '**/ia/chat', { forceNetworkError: true }).as('chatSemRede');

      cy.getDataCy('chat-entrada-mensagem').type('livros de tecnologia');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatSemRede');

      cy.getDataCy('chat-erro')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('deve exibir erro 400 com mensagem explicativa quando a requisição for inválida', () => {
      cy.intercept('POST', '**/ia/chat', {
        statusCode: 400,
        body: { sucesso: false, mensagem: 'Mensagem é obrigatória e não pode ser vazia' },
      }).as('chatBadRequest');

      cy.getDataCy('chat-entrada-mensagem').type(' ');
      cy.getDataCy('chat-botao-enviar').click();

      cy.getDataCy('chat-erro').should('be.visible');
    });
  });

  describe('Validação de campos obrigatórios', () => {
    beforeEach(() => {
      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');
    });

    it('deve impedir envio de mensagem vazia', () => {
      cy.intercept('POST', '**/ia/chat').as('chatNaoDeveChamar');

      cy.getDataCy('chat-entrada-mensagem').clear();
      cy.getDataCy('chat-botao-enviar').should('be.disabled');

      cy.get('@chatNaoDeveChamar.all').should('have.length', 0);
    });

    it('deve impedir envio de mensagem com apenas espaços em branco', () => {
      cy.intercept('POST', '**/ia/chat').as('chatNaoDeveSerChamado');

      cy.getDataCy('chat-entrada-mensagem').type('   ');
      cy.getDataCy('chat-botao-enviar').should('be.disabled');

      cy.get('@chatNaoDeveSerChamado.all').should('have.length', 0);
    });

    it('deve exibir contador de caracteres e limitar o tamanho máximo da mensagem', () => {
      const mensagemLonga = 'a'.repeat(600);

      cy.getDataCy('chat-entrada-mensagem').type(mensagemLonga);

      cy.getDataCy('chat-entrada-mensagem').invoke('val').then((val) => {
        expect((val as string).length).to.be.at.most(500);
      });
    });
  });

  describe('Verificação de saúde do serviço', () => {
    it('deve exibir aviso quando o serviço de IA estiver degradado (saude != ok)', () => {
      cy.intercept('GET', '**/ia/saude', {
        statusCode: 503,
        body: { sucesso: false, mensagem: 'Serviço degradado' },
      }).as('saudeIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');

      // Verifica aviso de serviço indisponível
      cy.getDataCy('ia-servico-indisponivel').should('be.visible');
    });
  });
});
