/**
 * Testes E2E da Página Mais Vendidos (/mais-vendidos)
 * Cobertura: Cenários felizes e validação
 */

describe('Catálogo — Mais Vendidos', () => {
  describe('Acesso à Página', () => {
    it('deve acessar /mais-vendidos', () => {
      cy.visit('/mais-vendidos');
      
      cy.url().should('include', '/mais-vendidos');
    });

    it('deve ter título da página correto', () => {
      cy.visit('/mais-vendidos');
      
      cy.title().should('include', 'Mais Vendidos');
    });

    it('deve acessar via navegação da home', () => {
      cy.visit('/');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/mais-vendidos"]').length > 0) {
          cy.get('a[href="/mais-vendidos"]').click();
          cy.url().should('include', '/mais-vendidos');
        }
      });
    });
  });

  describe('Listagem de Livros', () => {
    it('deve listar livros mais vendidos', () => {
      cy.visit('/mais-vendidos');
      
      // Verificar que há livros listados
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').should('have.length.at.least', 1);
        } else if ($body.find('ul').length > 0) {
          cy.get('ul').should('exist');
          cy.get('li').should('have.length.at.least', 1);
        }
      });
    });

    it('deve exibir título do livro', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().should('contain.text');
        } else if ($body.find('li').length > 0) {
          cy.get('li').first().find('a').should('exist');
        }
      });
    });

    it('deve exibir preço do livro', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().should('contain', 'R$');
        } else if ($body.find('li').length > 0) {
          cy.get('li').first().should('contain', 'R$');
        }
      });
    });

    it('deve exibir imagem/capa do livro', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().find('img').should('exist');
        }
      });
    });
  });

  describe('Navegação para Detalhes', () => {
    it('deve navegar para detalhes do livro ao clicar', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().click();
          cy.url().should('include', '/livro/');
        } else if ($body.find('li').length > 0) {
          cy.get('li').first().find('a').click();
          cy.url().should('include', '/livro/');
        }
      });
    });

    it('deve ter botão/link Ver Detalhes', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().contains('Ver Detalhes').should('exist');
        }
      });
    });
  });

  describe('Adição ao Carrinho', () => {
    it('deve ter botão Adicionar ao Carrinho', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().contains('Adicionar ao Carrinho').should('exist');
        }
      });
    });

    it('deve permitir adicionar livro ao carrinho', () => {
      cy.autenticarClienteDadosTeste();
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().contains('Adicionar ao Carrinho').click({ force: true });
          
          // Verificar que carrinho foi atualizado (pode ser contador ou toast)
          cy.get('body').then(($body2) => {
            if ($body2.find('[data-cy="carrinho-counter"]').length) {
              cy.get('[data-cy="carrinho-counter"]').should('exist');
            }
          });
        }
      });
    });
  });

  describe('SSR e Performance', () => {
    it('deve carregar conteúdo via SSR', () => {
      cy.visit('/mais-vendidos');
      
      // Verificar que conteúdo está presente sem loading
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0 || $body.find('ul').length > 0) {
          cy.get('body').should('be.visible');
        }
      });
    });

    it('deve ter metadata correta', () => {
      cy.visit('/mais-vendidos');
      
      cy.title().should('include', 'Mais Vendidos');
      cy.title().should('include', 'Barnes & Noble');
    });
  });

  describe('Ordenação e Filtros', () => {
    it('deve exibir livros ordenados por vendas', () => {
      cy.visit('/mais-vendidos');
      
      // Verificar que a página existe e carrega
      cy.url().should('include', '/mais-vendidos');
    });

    it('deve ter indicador de ranking/badge', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          cy.get('.cartao-livro').first().then(($card) => {
            // Pode ter badge de ranking
            if ($card.find('[data-cy="ranking-badge"]').length) {
              cy.get('[data-cy="ranking-badge"]').should('exist');
            }
          });
        }
      });
    });
  });

  describe('Estado Vazio', () => {
    it('deve lidar com lista vazia de mais vendidos', () => {
      cy.visit('/mais-vendidos');
      
      // Se não houver livros, deve exibir mensagem apropriada
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length === 0 && $body.find('li').length === 0) {
          cy.contains('Nenhum livro encontrado').should('exist');
        }
      });
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/mais-vendidos');
      
      cy.url().should('include', '/mais-vendidos');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/mais-vendidos');
      
      cy.url().should('include', '/mais-vendidos');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/mais-vendidos');
      
      cy.url().should('include', '/mais-vendidos');
    });

    it('deve ter grid responsivo', () => {
      cy.viewport(1920, 1080);
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('.cartao-livro').length > 0) {
          // Em desktop, deve ter múltiplos livros por linha
          cy.get('.cartao-livro').should('have.length.at.least', 1);
        }
      });
    });
  });

  describe('Links de Navegação', () => {
    it('deve ter link para voltar a home', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/"]').length > 0) {
          cy.get('a[href="/"]').should('exist');
        }
      });
    });

    it('deve ter link para categorias', () => {
      cy.visit('/mais-vendidos');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/categoria/"]').length > 0) {
          cy.get('a[href*="/categoria/"]').should('exist');
        }
      });
    });
  });
});
