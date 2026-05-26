/**
 * Testes E2E da Página Admin — Gestão de Lojas (/admin/lojas)
 * Cobertura: Listagem, criação, edição, filtros, paginação
 */

describe('Admin — Gestão de Lojas', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/lojas como administrador', () => {
      cy.visit('/admin/lojas');
      cy.url().should('include', '/admin/lojas');
    });

    it('deve exibir título "Gerenciar Lojas"', () => {
      cy.visit('/admin/lojas');
      cy.contains('h3', 'Gerenciar Lojas').should('be.visible');
    });

    it('deve exibir botão "Nova Loja"', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').should('be.visible');
    });
  });

  describe('Listagem de Lojas', () => {
    it('deve exibir tabela de lojas', () => {
      cy.visit('/admin/lojas');
      cy.get('table').should('exist');
    });

    it('deve exibir colunas esperadas na tabela', () => {
      cy.visit('/admin/lojas');
      cy.get('thead').within(() => {
        cy.contains('Nome');
        cy.contains('Slug');
        cy.contains('CNPJ');
        cy.contains('Status');
        cy.contains('Ações');
      });
    });

    it('deve listar lojas existentes', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir status "Ativa" ou "Inativa" para cada loja', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy^="loja-status-"]').should('contain.text', /Ativa|Inativa/);
        });
      });
    });
  });

  describe('Filtros', () => {
    it('deve filtrar lojas por nome', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="input-filtro-loja"]').type('Centro');
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy^="loja-nome-"]').should('contain.text', /Centro/i);
        });
      });
    });

    it('deve filtrar lojas por slug', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="input-filtro-loja"]').type('loja-centro');
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy^="loja-slug-"]').should('contain.text', /loja-centro/i);
        });
      });
    });

    it('deve filtrar lojas por CNPJ', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="input-filtro-loja"]').type('12.345');
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy^="loja-cnpj-"]').should('contain.text', /12\.345/);
        });
      });
    });

    it('deve limpar filtro ao apagar texto', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="input-filtro-loja"]').type('Centro');
      cy.get('[data-cy="input-filtro-loja"]').clear();
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('deve exibir estado vazio quando nenhuma loja corresponde ao filtro', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="input-filtro-loja"]').type('ZZZZZZZZZZZZZ');
      cy.contains('Nenhuma loja encontrada').should('be.visible');
    });
  });

  describe('Paginação', () => {
    it('deve exibir controles de paginação se houver múltiplas páginas', () => {
      cy.visit('/admin/lojas');
      // Verifica se há mais de 10 lojas (limite por página)
      cy.get('tbody tr').then(($rows) => {
        if ($rows.length > 10) {
          cy.get('[data-cy="btn-pagina-anterior"]').should('be.visible');
          cy.get('[data-cy="btn-proxima-pagina"]').should('be.visible');
        }
      });
    });

    it('deve desabilitar botão anterior na primeira página', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-pagina-anterior"]').should('be.disabled');
    });

    it('deve navegar para próxima página', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').then(($rows) => {
        if ($rows.length > 10) {
          cy.get('[data-cy="btn-proxima-pagina"]').click();
          cy.get('[data-cy="info-paginacao"]').should('contain.text', 'Página 2');
        }
      });
    });
  });

  describe('Modal de Criação de Loja', () => {
    it('deve abrir modal ao clicar em "Nova Loja"', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('deve exibir campos de formulário corretos', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').should('be.visible');
      cy.get('[data-cy="input-slug-loja"]').should('be.visible');
      cy.get('[data-cy="input-cnpj-loja"]').should('be.visible');
    });

    it('deve exibir título "Nova Loja" no modal', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.contains('Nova Loja').should('be.visible');
    });

    it('deve fechar modal ao clicar em "Cancelar"', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-cancelar-loja"]').click();
      cy.get('[role="dialog"]').should('not.be.visible');
    });

    it('deve exibir erro ao tentar salvar sem preencher campos obrigatórios', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="modal-message-loja"]').should('contain.text', /obrigatório/i);
    });

    it('deve exibir modal de confirmação ao preencher formulário corretamente', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('12.345.678/0001-90');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="confirmacao-texto"]').should('contain.text', 'Loja Teste');
    });
  });

  describe('Modal de Confirmação', () => {
    it('deve exibir modal de confirmação com dados corretos', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Confirmação');
      cy.get('[data-cy="input-slug-loja"]').type('loja-confirmacao');
      cy.get('[data-cy="input-cnpj-loja"]').type('98.765.432/0001-10');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="confirmacao-texto"]').should('contain.text', 'Loja Confirmação');
    });

    it('deve fechar modal de confirmação ao clicar em "Cancelar"', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('12.345.678/0001-90');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="btn-cancelar-confirmacao"]').click();
      cy.get('[role="dialog"]').should('not.be.visible');
    });
  });

  describe('Criação de Loja', () => {
    it('deve criar nova loja com sucesso', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      
      const nomeLoja = `Loja ${Date.now()}`;
      const slugLoja = `loja-${Date.now()}`;
      const cnpjLoja = '12.345.678/0001-90';
      
      cy.get('[data-cy="input-nome-loja"]').type(nomeLoja);
      cy.get('[data-cy="input-slug-loja"]').type(slugLoja);
      cy.get('[data-cy="input-cnpj-loja"]').type(cnpjLoja);
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="btn-confirmar-salvar"]').click();
      
      // Verifica se a mensagem de sucesso aparece
      cy.get('[data-cy="page-message"]').should('contain.text', /sucesso/i);
    });

    it('deve limpar formulário após criar loja', () => {
      cy.visit('/admin/lojas');
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('12.345.678/0001-90');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="btn-confirmar-salvar"]').click();
      
      // Aguarda a mensagem de sucesso desaparecer
      cy.get('[data-cy="page-message"]', { timeout: 6000 }).should('not.exist');
    });
  });

  describe('Edição de Loja', () => {
    it('deve abrir modal de edição ao clicar em "Editar"', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy^="btn-editar-loja-"]').click();
      });
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Editar Loja').should('be.visible');
    });

    it('deve preencher formulário com dados da loja ao editar', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy^="loja-nome-"]').then(($nome) => {
          const nomeLoja = $nome.text();
          cy.get('[data-cy^="btn-editar-loja-"]').click();
          cy.get('[data-cy="input-nome-loja"]').should('have.value', nomeLoja);
        });
      });
    });
  });

  describe('Ativação/Desativação de Loja', () => {
    it('deve abrir modal de confirmação ao clicar em "Desativar"', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy^="btn-excluir-loja-"]').click();
      });
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('deve exibir mensagem apropriada para loja ativa', () => {
      cy.visit('/admin/lojas');
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy^="loja-status-"]').then(($status) => {
          const status = $status.text();
          cy.get('[data-cy^="btn-excluir-loja-"]').click();
          if (status.includes('Ativa')) {
            cy.get('[data-cy="exclusao-texto"]').should('contain.text', /desativar/i);
          }
        });
      });
    });
  });

  describe('Responsividade', () => {
    it('deve exibir tabela em viewport desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/admin/lojas');
      cy.get('table').should('be.visible');
    });

    it('deve exibir tabela em viewport tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/admin/lojas');
      cy.get('table').should('be.visible');
    });
  });
});
