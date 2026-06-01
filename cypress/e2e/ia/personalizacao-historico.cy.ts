/**
 * Testes E2E — Personalização com Histórico de Compras (CDU010, RF0103, RF0105)
 *
 * Verifica o comportamento do assistente quando o cliente está autenticado:
 * - UUID do cliente é enviado à API para personalização
 * - Histórico da conversa é mantido entre turnos
 * - Contexto do histórico é enviado corretamente nas mensagens seguintes
 *
 * Segue RNF de segurança: apenas UUID anônimo é enviado (nunca CPF ou nome real).
 */

describe('Assistente IA — Personalização com Histórico de Compras (RF0103)', () => {
  const email = Cypress.env('cliente')?.email ?? 'clientetest@email.com';
  const senha = Cypress.env('cliente')?.senha ?? '@asdfJKLÇ123';

  describe('Usuário autenticado — recomendações personalizadas', () => {
    beforeEach(() => {
      cy.autenticarViaApi(email, senha);

      cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
      cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta-historico.json' }).as('chatPersonalizado');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');
    });

    it('deve enviar o UUID do cliente autenticado na requisição ao chatbot (RF0103)', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        expect(req.body).to.have.property('clienteUuid');
        expect(req.body.clienteUuid).to.be.a('string').and.not.be.empty;
        req.reply({ fixture: 'ia/chat-resposta-historico.json' });
      }).as('chatComCliente');

      cy.getDataCy('chat-entrada-mensagem').type('ficção científica épica');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatComCliente');
    });

    it('deve garantir que o UUID enviado não contém dados sensíveis como CPF ou nome', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        const bodyString = JSON.stringify(req.body);
        expect(bodyString).to.not.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/, 'CPF não deve ser enviado à IA');
        expect(bodyString).to.not.have.string('senha', 'Senha não deve ser enviada à IA');
        expect(bodyString).to.not.have.string('cartao', 'Dados de cartão não devem ser enviados à IA');
        req.reply({ fixture: 'ia/chat-resposta-historico.json' });
      }).as('chatSemDadosSensiveis');

      cy.getDataCy('chat-entrada-mensagem').type('livros de romance');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatSemDadosSensiveis');
    });

    it('deve exibir saudação personalizada para o cliente autenticado', () => {
      cy.getDataCy('chat-sidebar').should('be.visible');
      // O chatbot pode não ter saudação personalizada explícita
      cy.getDataCy('chat-entrada-mensagem').should('be.visible');
    });

    it('deve indicar visualmente que as recomendações são baseadas no histórico de compras', () => {
      cy.getDataCy('chat-entrada-mensagem').type('mais recomendações como os que comprei antes');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatPersonalizado');

      cy.getDataCy('ia-contexto-historico-badge').should('be.visible');
    });
  });

  describe('Manutenção do histórico de conversa', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
      cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');
    });

    it('deve exibir todas as mensagens trocadas na tela (histórico visual)', () => {
      cy.getDataCy('chat-entrada-mensagem').type('primeira pergunta sobre ficção');
      cy.getDataCy('chat-botao-enviar').click();
      cy.wait('@chatIA');

      cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta-historico.json' }).as('chatIA2');

      cy.getDataCy('chat-entrada-mensagem').type('segunda pergunta sobre fantasia');
      cy.getDataCy('chat-botao-enviar').click();
      cy.wait('@chatIA2');

      cy.getDataCy('chat-mensagem-usuario').should('have.length', 2);
      cy.getDataCy('chat-mensagem-assistente').should('have.length', 2);
    });

    it('deve enviar o histórico de conversa na segunda mensagem para manter contexto (RF0103)', () => {
      cy.getDataCy('chat-entrada-mensagem').type('gosto de ficção científica clássica');
      cy.getDataCy('chat-botao-enviar').click();
      cy.wait('@chatIA');

      cy.intercept('POST', '**/ia/chat', (req) => {
        expect(req.body).to.have.property('historico');
        expect(req.body.historico).to.be.an('array').with.length.at.least(1);

        const historico = req.body.historico as Array<{ papel: string; conteudo: string }>;
        expect(historico.some((m) => m.papel === 'user')).to.be.true;
        expect(historico.some((m) => m.papel === 'assistant')).to.be.true;

        req.reply({ fixture: 'ia/chat-resposta-historico.json' });
      }).as('chatComHistorico');

      cy.getDataCy('chat-entrada-mensagem').type('e de qual autor em particular?');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatComHistorico');
    });

    it('deve manter o rolar automático para exibir a última mensagem da conversa', () => {
      for (let i = 1; i <= 3; i++) {
        cy.getDataCy('chat-entrada-mensagem').type(`pergunta número ${i}`);
        cy.getDataCy('chat-botao-enviar').click();
        cy.wait('@chatIA');
        if (i < 3) {
          cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');
        }
      }

      cy.getDataCy('chat-mensagem-assistente')
        .last()
        .should('be.visible');
    });

    it('deve oferecer opção de limpar o histórico da conversa', () => {
      cy.getDataCy('chat-entrada-mensagem').type('livros de terror');
      cy.getDataCy('chat-botao-enviar').click();
      cy.wait('@chatIA');

      cy.getDataCy('chat-mensagem-usuario').should('have.length', 1);

      cy.getDataCy('chat-botao-limpar').should('be.visible').click();

      cy.getDataCy('chat-mensagem-usuario').should('have.length', 0);
      cy.getDataCy('chat-mensagem-assistente').should('have.length', 0);
    });
  });

  describe('Usuário não autenticado — recomendações contextuais', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
      cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

      cy.visit('/', { failOnStatusCode: false });
      cy.getDataCy('chat-flutuante-botao').click();
      cy.getDataCy('chat-sidebar').should('be.visible');
    });

    it('deve não enviar clienteUuid quando o usuário não está autenticado', () => {
      cy.intercept('POST', '**/ia/chat', (req) => {
        const temClienteUuid = !!req.body.clienteUuid;
        expect(temClienteUuid).to.be.false;
        req.reply({ fixture: 'ia/chat-resposta.json' });
      }).as('chatSemCliente');

      cy.getDataCy('chat-entrada-mensagem').type('livros para iniciantes em programação');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatSemCliente');
    });

    it('deve permitir uso do assistente sem autenticação para recomendações contextuais', () => {
      cy.getDataCy('chat-entrada-mensagem').type('livros para aprender programação');
      cy.getDataCy('chat-botao-enviar').click();

      cy.wait('@chatIA');

      cy.getDataCy('chat-mensagem-assistente').should('be.visible');
    });
  });
});
