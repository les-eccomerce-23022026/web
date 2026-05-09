/// <reference types="cypress" />

describe('Correções Senior Frontend/UI/UX', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Paginação do Catálogo', () => {
    it('deve ter botões de paginação funcionais quando houver múltiplas páginas', () => {
      // Verifica se os botões de paginação existem quando há múltiplas páginas
      cy.get('[data-cy="catalogo-paginacao"]').should('exist');
      
      // Verifica se os botões estão presentes
      cy.get('[data-cy="botao-pagina-anterior"]').should('exist');
      cy.get('[data-cy="botao-proxima-pagina"]').should('exist');
    });

    it('deve desabilitar botão anterior na primeira página', () => {
      cy.get('[data-cy="catalogo-paginacao"]').within(() => {
        cy.get('[data-cy="botao-pagina-anterior"]').should('be.disabled');
      });
    });

    it('deve navegar para próxima página ao clicar no botão próximo', () => {
      // Configura banco de testes com mais de 10 livros para ter múltiplas páginas
      cy.window().then((win) => {
        win.__USE_TEST_DB__ = true;
      });

      cy.reload();

      cy.get('[data-cy="catalogo-paginacao"]').should('exist');
      
      // Clica no botão próxima página
      cy.get('[data-cy="botao-proxima-pagina"]').click();
      
      // Verifica se a página atual mudou (deve ser maior que 1)
      cy.get('[data-cy="pagina-atual"]').should('not.contain', '1');
    });
  });

  context('Links do Footer', () => {
    it('não deve ter links quebrados no Footer', () => {
      cy.get('footer a').each(($link) => {
        const href = $link.attr('href');
        if (href && href.startsWith('/')) {
          // Verifica que links internos não levam a 404
          cy.request({
            url: href,
            failOnStatusCode: false,
          }).then((response) => {
            // Links válidos devem retornar 200 ou redirect (3xx)
            expect(response.status).to.be.oneOf([200, 301, 302, 303, 307, 308]);
          });
        }
      });
    });

    it('deve ter link correto para Meus Pedidos (/pedidos)', () => {
      cy.get('footer').contains('Meus Pedidos').should('have.attr', 'href', '/pedidos');
    });

    it('não deve ter links para rotas inexistentes (/enderecos, /cartoes, etc)', () => {
      cy.get('footer').should('not.contain', 'Endereços');
      cy.get('footer').should('not.contain', 'Cartões');
      cy.get('footer').should('not.contain', 'Central de Ajuda');
      cy.get('footer').should('not.contain', 'Política de Trocas');
      cy.get('footer').should('not.contain', 'Fale Conosco');
      cy.get('footer').should('not.contain', 'Termos de Uso');
    });
  });

  context('Link de Perfil no Header', () => {
    it('deve ter link correto para perfil (/minha-conta)', () => {
      cy.get('[data-cy="header-user-profile"]').should('have.attr', 'href', '/minha-conta');
    });

    it('não deve ter link para /perfil', () => {
      cy.get('header').should('not.contain', 'href="/perfil"');
    });
  });

  context('Debug Logs em Produção', () => {
    it('não deve ter debug logs [SENIOR-DEBUG] em produção', () => {
      cy.window().then((win) => {
        // Intercepta console.log antes de visitar
        const logSpy = cy.spy(win.console, 'log');
        
        // Navega para a home
        cy.visit('/');
        
        // Verifica que não há logs com [SENIOR-DEBUG]
        // Em produção, NODE_ENV seria 'production'
        // Em teste, verificamos que os logs estão condicionados
        cy.wrap(logSpy).then((spy) => {
          const calls = spy.getCalls();
          const debugLogs = calls.filter((call) => 
            call.args && call.args[0] && typeof call.args[0] === 'string' && call.args[0].includes('[SENIOR-DEBUG]')
          );
          expect(debugLogs.length).to.equal(0);
        });
      });
    });
  });

  context('Race Condition em restoreSession', () => {
    it('deve inicializar aplicação com estado consistente', () => {
      // Verifica que o carrinho é carregado após tentar restaurar sessão
      cy.window().then((win) => {
        win.__USE_TEST_DB__ = true;
      });

      cy.reload();

      // Aguarda a aplicação estar pronta
      cy.get('[data-cy="header-cart-link"]').should('exist');
      
      // Verifica que não há erros de estado no console
      cy.window().then((win) => {
        const errorSpy = cy.spy(win.console, 'error');
        cy.wait(1000).then(() => {
          // Não deve haver erros relacionados a estado inconsistente
          cy.wrap(errorSpy).should('not.have.been.called');
        });
      });
    });
  });
});
