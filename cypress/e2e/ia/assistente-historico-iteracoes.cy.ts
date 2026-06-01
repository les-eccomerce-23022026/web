/**
 * Testes E2E — Histórico por iteração no assistente (multi-turno)
 *
 * Valida dropdowns das últimas 3 iterações anteriores, turno atual expandido
 * e ação "Continuar deste turno" (trunca histórico enviado à API).
 */

describe('Assistente IA — Histórico por iteração (dropdown)', () => {
  const respostaTurno1 = {
    sucesso: true,
    dados: {
      resposta: 'Aqui estão os mais vendidos em fantasia.',
      produtosRecomendados: [
        {
          uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          titulo: 'O Nome do Vento',
          autor: 'Patrick Rothfuss',
          categoria: 'Fantasia',
          sinopse: 'Sinopse teste',
          isbn: '978-0-000-00000-0',
          preco: 68.4,
          similaridade: 0.37,
          motivo: 'Mais vendido em fantasia',
        },
      ],
      contextoUsado: true,
      tempoRespostaMs: 800,
      tipoResposta: 'tendencias',
      numeroTurno: 1,
      intencaoResumida: 'Fantasia · tendências',
      perguntasFollowUp: ['Tem opções mais baratas em fantasia?'],
    },
  };

  const respostaTurno2 = {
    sucesso: true,
    dados: {
      resposta: 'Opções mais acessíveis em fantasia.',
      produtosRecomendados: [],
      contextoUsado: true,
      tempoRespostaMs: 600,
      tipoResposta: 'recomendacao',
      numeroTurno: 2,
      intencaoResumida: 'Fantasia · preço menor',
      perguntasFollowUp: ['Quero uma saga curta para começar'],
    },
  };

  const respostaTurno3 = {
    sucesso: true,
    dados: {
      resposta: 'Sagas curtas para começar.',
      produtosRecomendados: [],
      contextoUsado: false,
      tempoRespostaMs: 500,
      tipoResposta: 'recomendacao',
      numeroTurno: 3,
      intencaoResumida: 'Fantasia · saga curta',
      perguntasFollowUp: [],
    },
  };

  const respostaTurno4 = {
    sucesso: true,
    dados: {
      resposta: 'Comparativo entre títulos.',
      produtosRecomendados: [],
      contextoUsado: false,
      tempoRespostaMs: 500,
      tipoResposta: 'recomendacao',
      numeroTurno: 4,
      intencaoResumida: 'Comparativo de livros',
      perguntasFollowUp: [],
    },
  };

  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').click();
    cy.getDataCy('chat-sidebar').should('be.visible');
  });

  it('deve exibir no máximo 3 dropdowns de turnos anteriores além do turno atual', () => {
    let contador = 0;
    cy.intercept('POST', '**/ia/chat', (req) => {
      contador += 1;
      const respostas = [respostaTurno1, respostaTurno2, respostaTurno3, respostaTurno4];
      req.reply(respostas[contador - 1] ?? respostaTurno4);
    }).as('chatIA');

    cy.getDataCy('chat-entrada-mensagem').type('Livros mais vendidos em Fantasia{enter}');
    cy.wait('@chatIA');
    cy.getDataCy('chat-entrada-mensagem').type('Quero algo mais barato{enter}');
    cy.wait('@chatIA');
    cy.getDataCy('chat-entrada-mensagem').type('Saga curta{enter}');
    cy.wait('@chatIA');
    cy.getDataCy('chat-entrada-mensagem').type('Compare dois livros{enter}');
    cy.wait('@chatIA');

    cy.getDataCy('chat-iteracao-anterior').should('have.length', 3);
    cy.getDataCy('chat-iteracao-atual').should('have.attr', 'data-indice', '4');
  });

  it('deve permitir expandir turno anterior e continuar a conversa a partir dele', () => {
    cy.intercept('POST', '**/ia/chat', (req) => {
      if (!req.body.historico?.length) {
        req.reply(respostaTurno1);
        return;
      }
      if (req.body.historico.length <= 2) {
        req.reply(respostaTurno2);
        return;
      }
      req.reply(respostaTurno3);
    }).as('chatIA');

    cy.getDataCy('chat-entrada-mensagem').type('Livros mais vendidos em Fantasia{enter}');
    cy.wait('@chatIA');
    cy.getDataCy('chat-entrada-mensagem').type('Quero algo mais barato{enter}');
    cy.wait('@chatIA');

    cy.getDataCy('chat-iteracao-anterior').first().click();
    cy.getDataCy('chat-continuar-iteracao').first().click();

    cy.getDataCy('chat-iteracao-atual').should('have.attr', 'data-indice', '1');
    cy.getDataCy('chat-iteracao-anterior').should('have.length', 0);

    cy.getDataCy('chat-entrada-mensagem').type('Nova pergunta após branch{enter}');
    cy.wait('@chatIA').then(({ request }) => {
      expect(request.body.historico).to.be.an('array');
      expect(request.body.historico.length).to.be.at.most(2);
    });
  });
});
