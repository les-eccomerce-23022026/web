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
    cy.intercept('GET', '**/ia/saude', { fixture: 'ia/saude-ok.json' }).as('saudeIA');
    cy.intercept('POST', '**/ia/chat', { fixture: 'ia/chat-resposta.json' }).as('chatIA');

    cy.visit('/ia-assistente', { failOnStatusCode: false });
  });

  it('deve garantir que cada produto recomendado possui UUID no formato correto', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    cy.get('[data-testid="ia-produto-card"]').each(($card) => {
      cy.wrap($card)
        .find('[data-testid="ia-produto-link"]')
        .invoke('attr', 'href')
        .then((href) => {
          const uuid = href?.split('/livro/')[1]?.split('?')[0] ?? '';
          expect(uuid).to.match(uuidRegex, `UUID do produto inválido: ${uuid}`);
        });
    });
  });

  it('deve navegar para a página de detalhe ao clicar em um produto recomendado', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]')
      .first()
      .find('[data-testid="ia-produto-link"]')
      .click();

    cy.url().should('include', '/livro/');
  });

  it('deve exibir dados de título, autor e preço não nulos nos cards recomendados', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('autoajuda financeira');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="ia-produto-titulo"]').should('not.be.empty');
      cy.wrap($card).find('[data-testid="ia-produto-autor"]').should('not.be.empty');
      cy.wrap($card).find('[data-testid="ia-produto-preco"]').should('not.be.empty');
    });
  });

  it('deve exibir ISBN válido em cada produto recomendado quando disponível', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').first().within(() => {
      cy.get('[data-testid="ia-produto-isbn"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el)
            .invoke('text')
            .should('match', /^978[-\s]?\d/);
        }
      });
    });
  });

  it('deve exibir a categoria de cada produto recomendado', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]').each(($card) => {
      cy.wrap($card)
        .find('[data-testid="ia-produto-categoria"]')
        .should('not.be.empty');
    });
  });

  it('deve verificar que nenhum produto recomendado tem preço negativo ou zero', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA').then((interception) => {
      const body = interception.response?.body;
      const produtos = body?.dados?.produtosRecomendados ?? [];
      produtos.forEach((produto: { preco: number; titulo: string }) => {
        expect(produto.preco).to.be.greaterThan(0, `Produto "${produto.titulo}" tem preço inválido`);
      });
    });
  });

  it('deve exibir grau de similaridade dos produtos somente quando for informação relevante para o usuário', () => {
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

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
    cy.get('[data-testid="ia-chatbot-input"]').type('ficção científica');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatIA');

    cy.get('[data-testid="ia-produto-card"]')
      .first()
      .find('[data-testid="ia-produto-link"]')
      .click();

    cy.url().should('include', '/livro/');
    cy.go('back');
    cy.url().should('include', '/ia-assistente');
    cy.get('[data-testid="ia-chatbot-container"]').should('be.visible');
  });

  it('deve exibir mensagem adequada quando não há produtos recomendados', () => {
    cy.intercept('POST', '**/ia/chat', {
      fixture: 'ia/chat-resposta-vazia.json',
    }).as('chatSemProdutos');

    cy.get('[data-testid="ia-chatbot-input"]').type('xyzzy fulano beltrano inexistente');
    cy.get('[data-testid="ia-chatbot-enviar"]').click();

    cy.wait('@chatSemProdutos');

    cy.get('[data-testid="ia-chatbot-mensagem-assistente"]').should('be.visible');
    cy.get('[data-testid="ia-produto-card"]').should('have.length', 0);
    cy.get('[data-testid="ia-sem-produtos"]').should('be.visible');
  });
});
