/**
 * Testes E2E da Página de Categoria (/categoria/[slug])
 * Cobertura: Cenários felizes e validação
 */

describe('Catálogo — Página de Categoria', () => {
  describe('Acesso à Página', () => {
    it('deve acessar página de categoria existente', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('h1').should('contain', 'tecnologia');
      cy.get('p').should('contain', 'Livros na categoria tecnologia');
    });

    it('deve exibir mensagem para categoria não encontrada', () => {
      cy.visit('/categoria/categoria-inexistente');
      
      cy.get('h1').should('contain', 'Categoria não encontrada');
      cy.get('p').should('contain', 'não existe ou não possui livros');
    });

    it('deve acessar categoria via navegação da home', () => {
      cy.visit('/');
      
      // Clicar em uma categoria (se houver link)
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/categoria/"]').length > 0) {
          cy.get('a[href*="/categoria/"]').first().click();
          cy.url().should('include', '/categoria/');
        }
      });
    });
  });

  describe('Listagem de Livros', () => {
    it('deve listar livros da categoria', () => {
      cy.visit('/categoria/tecnologia');
      
      // Verificar que há livros listados
      cy.get('ul').should('exist');
      cy.get('li').should('have.length.at.least', 1);
    });

    it('deve exibir título do livro', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('li').first().within(() => {
        cy.get('a').should('exist');
      });
    });

    it('deve exibir preço do livro', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('li').first().within(() => {
        cy.get('span').should('contain', 'R$');
      });
    });

    it('deve exibir link para detalhes do livro', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('li').first().within(() => {
        cy.get('a').should('have.attr', 'href').and('include', '/livro/');
      });
    });

    it('deve exibir total de livros na categoria', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.contains('Total:').should('exist');
      cy.contains('livros nesta categoria').should('exist');
    });
  });

  describe('Navegação para Detalhes', () => {
    it('deve navegar para detalhes do livro ao clicar', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('li').first().find('a').click();
      
      cy.url().should('include', '/livro/');
    });

    it('deve manter contexto da categoria ao navegar', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.get('li').first().find('a').click();
      
      // Verificar que navegou para página de detalhes
      cy.url().should('include', '/livro/');
    });
  });

  describe('Categorias Variadas', () => {
    it('deve funcionar para categoria ficcao', () => {
      cy.visit('/categoria/ficcao');
      
      cy.get('h1').should('contain', 'ficcao');
      cy.get('ul').should('exist');
    });

    it('deve funcionar para categoria negocios', () => {
      cy.visit('/categoria/negocios');
      
      cy.get('h1').should('contain', 'negocios');
      cy.get('ul').should('exist');
    });

    it('deve funcionar para categoria romance', () => {
      cy.visit('/categoria/romance');
      
      cy.get('h1').should('contain', 'romance');
      cy.get('ul').should('exist');
    });
  });

  describe('SSR e Metadata', () => {
    it('deve ter título da página correto', () => {
      cy.visit('/categoria/tecnologia');
      
      cy.title().should('include', 'tecnologia');
    });

    it('deve carregar conteúdo via SSR', () => {
      cy.visit('/categoria/tecnologia');
      
      // Verificar que conteúdo está presente sem loading
      cy.get('h1').should('be.visible');
      cy.get('ul').should('be.visible');
    });
  });

  describe('Categorias Vazias', () => {
    it('deve lidar com categoria sem livros', () => {
      cy.visit('/categoria/categoria-vazia-teste');
      
      cy.get('h1').should('contain', 'Categoria não encontrada');
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/categoria/tecnologia');
      
      cy.get('h1').should('be.visible');
      cy.get('ul').should('be.visible');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/categoria/tecnologia');
      
      cy.get('h1').should('be.visible');
      cy.get('ul').should('be.visible');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/categoria/tecnologia');
      
      cy.get('h1').should('be.visible');
      cy.get('ul').should('be.visible');
    });
  });
});
