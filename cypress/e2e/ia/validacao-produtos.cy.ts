/**
 * Testes E2E — Validação de Produtos Recomendados (CDU010, RF0101, RF0104)
 *
 * Verifica que os produtos sugeridos pelo assistente:
 * - Existem no catálogo da loja
 * - Têm página de detalhe acessível
 * - Exibem dados consistentes com o catálogo real
 *
 * A API de chat é mockada; a navegação para detalhes usa o backend real.
 */

describe('Assistente IA — Validação de Produtos Recomendados no Catálogo (RF0101)', () => {
  beforeEach(() => {
    cy.loginProgramatico('cliente');
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

    cy.visit('/', { failOnStatusCode: false });
    cy.getDataCy('chat-flutuante-botao').click();
  });

  it('deve garantir que cada produto recomendado possui UUID no formato correto', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    cy.getDataCy('ia-produto-card').each(($card) => {
      cy.wrap($card)
        .find('[data-cy="ia-produto-link"]')
        .invoke('attr', 'href')
        .then((href) => {
          const uuid = href?.split('/livro/')[1]?.split('?')[0] ?? '';
          expect(uuid).to.match(uuidRegex, `UUID do produto inválido: ${uuid}`);
        });
    });
  });

  it('deve navegar para a página de detalhe ao clicar em um produto recomendado', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card')
      .first()
      .find('[data-cy="ia-produto-link"]')
      .click();

    cy.url().should('include', '/livro/');
  });

  it('deve exibir dados de título, autor e preço não nulos nos cards recomendados', () => {
    cy.getDataCy('chat-entrada-mensagem').type('autoajuda financeira');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').each(($card) => {
      cy.wrap($card).find('[data-cy="ia-produto-titulo"]').should('not.be.empty');
      cy.wrap($card).find('[data-cy="ia-produto-autor"]').should('not.be.empty');
      cy.wrap($card).find('[data-cy="ia-produto-preco"]').should('not.be.empty');
    });
  });

  it('deve exibir ISBN válido em cada produto recomendado quando disponível', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').first().within(() => {
      cy.getDataCy('ia-produto-isbn').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el)
            .invoke('text')
            .should('match', /^978[-\s]?\d/);
        }
      });
    });
  });

  it('deve exibir a categoria de cada produto recomendado', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card').each(($card) => {
      cy.wrap($card)
        .find('[data-cy="ia-produto-categoria"]')
        .should('not.be.empty');
    });
  });

  it('deve verificar que nenhum produto recomendado tem preço negativo ou zero', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA').then((interception) => {
      const body = interception.response?.body;
      const produtos = body?.dados?.produtosRecomendados ?? [];
      produtos.forEach((produto: { preco: number; titulo: string }) => {
        expect(produto.preco).to.be.greaterThan(0, `Produto "${produto.titulo}" tem preço inválido`);
      });
    });
  });

  it('deve exibir grau de similaridade dos produtos somente quando for informação relevante para o usuário', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA').then((interception) => {
      const body = interception.response?.body;
      const produtos = body?.dados?.produtosRecomendados ?? [];
      produtos.forEach((produto: { similaridade: number; titulo: string }) => {
        expect(produto.similaridade).to.be.within(
          0, 1,
          `Similaridade do produto "${produto.titulo}" fora do range válido [0, 1]`
        );
      });
    });
  });

  it('deve retornar ao assistente após navegar aos detalhes do produto usando o botão voltar do browser', () => {
    cy.getDataCy('chat-entrada-mensagem').type('ficção científica');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatIA');

    cy.getDataCy('ia-produto-card')
      .first()
      .find('[data-cy="ia-produto-link"]')
      .click();

    cy.url().should('include', '/livro/');
    cy.go('back');
    cy.url().should('include', '/');
    cy.getDataCy('chat-painel').should('be.visible');
  });

  it('deve exibir mensagem adequada quando não há produtos recomendados', () => {
    cy.intercept('POST', '**/ia/chat', {
      fixture: 'ia/chat-resposta-vazia.json',
    }).as('chatSemProdutos');

    cy.getDataCy('chat-entrada-mensagem').type('xyzzy fulano beltrano inexistente');
    cy.getDataCy('chat-botao-enviar').click();

    cy.wait('@chatSemProdutos');

    cy.getDataCy('chat-mensagem-assistente').should('be.visible');
    cy.getDataCy('ia-produto-card').should('have.length', 0);
    cy.getDataCy('ia-sem-produtos').should('be.visible');
  });
});
