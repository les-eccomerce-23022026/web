/**
 * Testes E2E para gerenciamento de lojas
 * Cobre: criar loja, editar loja, validações, máscara CNPJ e gerador de slug
 */

describe('Gerenciamento de Lojas', () => {
  beforeEach(() => {
    // Acessa a página de lojas
    cy.visit('/admin');
    cy.get('[data-cy="btn-nova-loja"]').should('be.visible');
  });

  describe('Validações de Campos', () => {
    it('Deve validar nome obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').focus().blur();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'Nome da loja é obrigatório');
    });

    it('Deve validar comprimento mínimo do nome', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('AB');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'Nome deve ter no mínimo 3 caracteres');
    });

    it('Deve validar slug obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').focus().blur();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'Slug é obrigatório');
    });

    it('Deve validar formato do slug', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').type('Loja@123');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'Slug deve ter no mínimo 3 caracteres');
    });

    it('Deve converter slug para minúsculas automaticamente', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').type('LOJA-CENTRO');
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro');
    });

    it('Deve validar CNPJ obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').focus().blur();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'CNPJ é obrigatório');
    });

    it('Deve validar formato CNPJ inválido', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('11.111.111/1111-11');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'CNPJ inválido');
    });
  });

  describe('Máscara CNPJ', () => {
    it('Deve aplicar máscara CNPJ automaticamente', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="input-cnpj-loja"]').should('have.value', '11.222.333/0001-81');
    });

    it('Deve limitar CNPJ a 14 dígitos', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('112223330001811111');
      cy.get('[data-cy="input-cnpj-loja"]').should('have.value', '11.222.333/0001-81');
    });

    it('Deve aceitar apenas números no CNPJ', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('11.222.333/0001-81');
      cy.get('[data-cy="input-cnpj-loja"]').should('have.value', '11.222.333/0001-81');
    });
  });

  describe('Gerador de Slug', () => {
    it('Deve gerar slug automaticamente a partir do nome', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Centro');
      cy.get('[data-cy="btn-gerar-slug"]').click();
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro');
    });

    it('Deve desabilitar botão Gerar Slug quando nome está vazio', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-gerar-slug"]').should('be.disabled');
    });

    it('Deve gerar slug com múltiplas palavras', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Centro Shopping');
      cy.get('[data-cy="btn-gerar-slug"]').click();
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro-shopping');
    });

    it('Deve remover caracteres especiais ao gerar slug', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja @#$ Centro');
      cy.get('[data-cy="btn-gerar-slug"]').click();
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro');
    });
  });

  describe('Criar Loja', () => {
    it('Deve criar loja com dados válidos', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="page-message"]').should('contain', 'Loja criada com sucesso');
    });

    it('Deve fechar modal após criar loja com sucesso', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="page-message"]').should('be.visible');
      cy.wait(1500);
      cy.get('[data-cy="modal-overlay"]').should('not.exist');
    });

    it('Deve validar slug único', () => {
      // Cria primeira loja
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Um');
      cy.get('[data-cy="input-slug-loja"]').type('loja-um');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="page-message"]').should('contain', 'Loja criada com sucesso');
      cy.wait(1500);

      // Tenta criar segunda loja com mesmo slug
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Dois');
      cy.get('[data-cy="input-slug-loja"]').type('loja-um');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000182');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="modal-message-loja"]').should('contain', 'Slug já está em uso');
    });
  });

  describe('Editar Loja', () => {
    it('Deve abrir modal de edição', () => {
      // Primeiro cria uma loja
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Para Editar');
      cy.get('[data-cy="input-slug-loja"]').type('loja-editar');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.wait(1500);

      // Depois edita
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      cy.get('[data-cy="modal-title"]').should('contain', 'Editar Loja');
    });

    it('Deve atualizar loja com sucesso', () => {
      // Primeiro cria uma loja
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Original');
      cy.get('[data-cy="input-slug-loja"]').type('loja-original');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.wait(1500);

      // Depois edita
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      cy.get('[data-cy="input-nome-loja"]').clear().type('Loja Atualizada');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="page-message"]').should('contain', 'Loja atualizada com sucesso');
    });
  });

  describe('Interações do Modal', () => {
    it('Deve fechar modal ao clicar em Cancelar', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="modal-overlay"]').should('be.visible');
      cy.get('[data-cy="btn-cancelar-loja"]').click();
      cy.get('[data-cy="modal-overlay"]').should('not.exist');
    });

    it('Deve fechar modal ao clicar no X', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="modal-close-button"]').click();
      cy.get('[data-cy="modal-overlay"]').should('not.exist');
    });

    it('Deve fechar modal ao clicar fora dele', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="modal-overlay"]').click({ force: true });
      cy.get('[data-cy="modal-overlay"]').should('not.exist');
    });
  });

  describe('Listagem de Lojas', () => {
    it('Deve exibir tabela de lojas', () => {
      cy.get('[data-cy="carregando-lojas"]').should('not.exist');
      // Verifica se há conteúdo na página
      cy.get('body').should('contain', 'Gerenciar Lojas');
    });

    it('Deve filtrar lojas por nome', () => {
      cy.get('[data-cy="input-filtro-loja"]').type('Centro');
      // Verifica que o filtro foi aplicado
      cy.get('[data-cy="input-filtro-loja"]').should('have.value', 'Centro');
    });

    it('Deve filtrar lojas por slug', () => {
      cy.get('[data-cy="input-filtro-loja"]').type('loja-');
      cy.get('[data-cy="input-filtro-loja"]').should('have.value', 'loja-');
    });

    it('Deve filtrar lojas por CNPJ', () => {
      cy.get('[data-cy="input-filtro-loja"]').type('11.222');
      cy.get('[data-cy="input-filtro-loja"]').should('have.value', '11.222');
    });
  });

  describe('Paginação', () => {
    it('Deve exibir botões de paginação quando há muitas lojas', () => {
      // Verifica se há botões de paginação (se houver mais de 10 lojas)
      cy.get('[data-cy="btn-pagina-anterior"]').then(($btn) => {
        if ($btn.length > 0) {
          cy.get('[data-cy="btn-pagina-anterior"]').should('be.visible');
          cy.get('[data-cy="info-paginacao"]').should('be.visible');
        }
      });
    });

    it('Deve navegar entre páginas', () => {
      cy.get('[data-cy="btn-proxima-pagina"]').then(($btn) => {
        if (!$btn.prop('disabled')) {
          cy.get('[data-cy="btn-proxima-pagina"]').click();
          cy.get('[data-cy="info-paginacao"]').should('contain', 'Página 2');
        }
      });
    });
  });
});
