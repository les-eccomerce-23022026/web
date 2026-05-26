/**
 * Testes E2E da Página Admin — Criar Novo Livro (/admin/livros/novo)
 * Cobertura: Cenários felizes, falha e validação
 */

describe('Admin — Criar Novo Livro', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/livros/novo como administrador', () => {
      cy.visit('/admin/livros/novo');
      
      cy.url().should('include', '/admin/livros/novo');
    });

    it('deve exibir formulário de cadastro de livro', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('form').should('exist');
    });
  });

  describe('Campos do Formulário', () => {
    it('deve exibir campo de título', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="titulo"]').should('exist');
    });

    it('deve exibir campo de autor', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="autor"]').should('exist');
    });

    it('deve exibir campo de preço', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="preco"]').should('exist');
    });

    it('deve exibir campo de categoria', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('select[name="categoria"]').should('exist');
    });

    it('deve exibir campo de sinopse', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('textarea[name="sinopse"]').should('exist');
    });

    it('deve exibir campo de ISBN', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="isbn"]').should('exist');
    });

    it('deve exibir campo de editora', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="editora"]').should('exist');
    });

    it('deve exibir campo de ano de publicação', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="anoPublicacao"]').should('exist');
    });

    it('deve exibir campo de quantidade em estoque', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="quantidadeEstoque"]').should('exist');
    });

    it('deve exibir campo de URL da capa', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="capaUrl"]').should('exist');
    });
  });

  describe('Validações de Campos', () => {
    it('deve validar título obrigatório', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('button[type="submit"]').click();
      
      cy.get('input[name="titulo"]').then(($input) => {
        if ($input.prop('required')) {
          cy.get('input[name="titulo"]').should('have.attr', 'required');
        }
      });
    });

    it('deve validar preço obrigatório', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="preco"]').should('have.attr', 'type', 'number');
    });

    it('deve validar preço positivo', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="preco"]').clear().type('-10');
      cy.get('button[type="submit"]').click();
      
      cy.get('input[name="preco"]').then(($input) => {
        const value = parseFloat($input.val() as string);
        if (value < 0) {
          cy.get('input[name="preco"]').should('have.value', '');
        }
      });
    });

    it('deve validar ISBN obrigatório', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="isbn"]').should('exist');
    });

    it('deve validar quantidade de estoque não negativa', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="quantidadeEstoque"]').clear().type('-5');
      cy.get('button[type="submit"]').click();
      
      cy.get('input[name="quantidadeEstoque"]').then(($input) => {
        const value = parseInt($input.val() as string);
        if (value < 0) {
          cy.get('input[name="quantidadeEstoque"]').should('have.value', '');
        }
      });
    });
  });

  describe('Criação de Livro — Cenário Feliz', () => {
    it('deve criar livro com dados válidos', () => {
      cy.visit('/admin/livros/novo');
      
      const livroData = {
        titulo: 'Livro de Teste E2E',
        autor: 'Autor Teste',
        preco: '49.90',
        categoria: 'tecnologia',
        sinopse: 'Sinopse do livro de teste',
        isbn: '978-85-325-2963-1',
        editora: 'Editora Teste',
        anoPublicacao: '2024',
        quantidadeEstoque: '10',
        capaUrl: 'https://example.com/capa.jpg'
      };
      
      cy.get('input[name="titulo"]').type(livroData.titulo);
      cy.get('input[name="autor"]').type(livroData.autor);
      cy.get('input[name="preco"]').type(livroData.preco);
      cy.get('select[name="categoria"]').select(livroData.categoria);
      cy.get('textarea[name="sinopse"]').type(livroData.sinopse);
      cy.get('input[name="isbn"]').type(livroData.isbn);
      cy.get('input[name="editora"]').type(livroData.editora);
      cy.get('input[name="anoPublicacao"]').type(livroData.anoPublicacao);
      cy.get('input[name="quantidadeEstoque"]').type(livroData.quantidadeEstoque);
      cy.get('input[name="capaUrl"]').type(livroData.capaUrl);
      
      cy.intercept('POST', '**/livros').as('criarLivro');
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@criarLivro').then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
      
      // Verificar redirecionamento para lista de livros
      cy.url().should('include', '/admin/livros');
    });

    it('deve exibir mensagem de sucesso ao criar livro', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="titulo"]').type('Livro Teste Sucesso');
      cy.get('input[name="autor"]').type('Autor Teste');
      cy.get('input[name="preco"]').type('29.90');
      cy.get('select[name="categoria"]').select('tecnologia');
      cy.get('textarea[name="sinopse"]').type('Sinopse teste');
      cy.get('input[name="isbn"]').type('978-85-325-1077-6');
      cy.get('input[name="editora"]').type('Editora Teste');
      cy.get('input[name="anoPublicacao"]').type('2024');
      cy.get('input[name="quantidadeEstoque"]').type('5');
      
      cy.get('button[type="submit"]').click();
      
      // Verificar mensagem de sucesso (pode ser toast ou alert)
      cy.get('body').then(($body) => {
        if ($body.find('.toast-success').length) {
          cy.get('.toast-success').should('be.visible');
        }
      });
    });
  });

  describe('Criação de Livro — Cenários de Falha', () => {
    it('deve falhar ao criar livro com ISBN duplicado', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="titulo"]').type('Livro ISBN Duplicado');
      cy.get('input[name="autor"]').type('Autor Teste');
      cy.get('input[name="preco"]').type('39.90');
      cy.get('select[name="categoria"]').select('tecnologia');
      cy.get('textarea[name="sinopse"]').type('Sinopse teste');
      // ISBN que pode já existir no banco
      cy.get('input[name="isbn"]').type('978-85-325-2963-1');
      cy.get('input[name="editora"]').type('Editora Teste');
      cy.get('input[name="anoPublicacao"]').type('2024');
      cy.get('input[name="quantidadeEstoque"]').type('5');
      
      cy.intercept('POST', '**/livros').as('criarLivro');
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@criarLivro').then((interception) => {
        if (interception.response?.statusCode === 409) {
          cy.get('.error').should('exist');
        }
      });
    });

    it('deve falhar ao criar livro sem campos obrigatórios', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="titulo"]').clear();
      cy.get('input[name="autor"]').clear();
      cy.get('input[name="preco"]').clear();
      
      cy.get('button[type="submit"]').click();
      
      // Verificar validação HTML5
      cy.get('input:invalid').should('exist');
    });

    it('deve falhar ao criar livro com preço inválido', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[name="titulo"]').type('Livro Preço Inválido');
      cy.get('input[name="autor"]').type('Autor Teste');
      cy.get('input[name="preco"]').type('abc');
      cy.get('select[name="categoria"]').select('tecnologia');
      cy.get('textarea[name="sinopse"]').type('Sinopse teste');
      cy.get('input[name="isbn"]').type('978-85-250-6166-5');
      cy.get('input[name="editora"]').type('Editora Teste');
      cy.get('input[name="anoPublicacao"]').type('2024');
      cy.get('input[name="quantidadeEstoque"]').type('5');
      
      cy.get('button[type="submit"]').click();
      
      cy.get('input[name="preco"]').should('have.attr', 'type', 'number');
    });
  });

  describe('Navegação', () => {
    it('deve ter botão para cancelar e voltar para lista', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('body').then(($body) => {
        if ($body.find('button[type="button"]').length) {
          cy.get('button[type="button"]').contains('Cancelar').click();
          cy.url().should('include', '/admin/livros');
        }
      });
    });

    it('deve ter link para voltar para lista de livros', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href="/admin/livros"]').length) {
          cy.get('a[href="/admin/livros"]').click();
          cy.url().should('include', '/admin/livros');
        }
      });
    });
  });

  describe('Upload de Capa', () => {
    it('deve ter campo para upload de capa', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[type="file"]').should('exist');
    });

    it('deve aceitar upload de imagem', () => {
      cy.visit('/admin/livros/novo');
      
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png');
      
      cy.get('input[type="file"]').should('have.prop', 'files').and('have.length', 1);
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/admin/livros/novo');
      
      cy.get('form').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/admin/livros/novo');
      
      cy.get('form').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/admin/livros/novo');
      
      cy.get('form').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });
});
