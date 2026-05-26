/**
 * Testes E2E para gerenciamento de lojas
 * Cobre: criar loja, editar loja, validações e feedback visual
 */

describe('Gerenciamento de Lojas', () => {
  beforeEach(() => {
    // Acessa a página de lojas
    cy.visit('/admin/lojas');
    cy.get('[data-cy="btn-nova-loja"]').should('be.visible');
  });

  describe('Criar Loja', () => {
    it('Deve exibir modal ao clicar em Nova Loja', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="modal-content"]').should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Nova Loja');
    });

    it('Deve validar campo nome obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').focus().blur();
      cy.contains('Nome é obrigatório').should('be.visible');
    });

    it('Deve validar comprimento mínimo do nome', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('AB');
      cy.get('[data-cy="input-nome-loja"]').blur();
      cy.contains('Nome deve ter no mínimo 3 caracteres').should('be.visible');
    });

    it('Deve validar campo slug obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').focus().blur();
      cy.contains('Slug é obrigatório').should('be.visible');
    });

    it('Deve validar formato do slug', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').type('Loja@123');
      cy.get('[data-cy="input-slug-loja"]').blur();
      cy.contains('Slug deve ter no mínimo 3 caracteres').should('be.visible');
    });

    it('Deve converter slug para minúsculas automaticamente', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-slug-loja"]').type('LOJA-CENTRO');
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro');
    });

    it('Deve validar campo CNPJ obrigatório', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').focus().blur();
      cy.contains('CNPJ é obrigatório').should('be.visible');
    });

    it('Deve validar formato CNPJ inválido', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('11.111.111/1111-11');
      cy.get('[data-cy="input-cnpj-loja"]').blur();
      cy.contains('CNPJ inválido').should('be.visible');
    });

    it('Deve aplicar máscara CNPJ automaticamente', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="input-cnpj-loja"]').should('have.value', '11.222.333/0001-81');
    });

    it('Deve gerar slug automaticamente a partir do nome', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Centro');
      cy.get('[data-cy="input-nome-loja"]').blur();
      cy.get('[data-cy="btn-gerar-slug"]').click();
      cy.get('[data-cy="input-slug-loja"]').should('have.value', 'loja-centro');
    });

    it('Deve desabilitar botão Gerar Slug quando nome está vazio', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-gerar-slug"]').should('be.disabled');
    });

    it('Deve desabilitar botão Salvar quando há erros', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-salvar-loja"]').should('be.disabled');
    });

    it('Deve criar loja com dados válidos', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').should('not.be.disabled');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="msg-sucesso-loja"]').should('contain', 'Loja criada com sucesso');
    });

    it('Deve limpar formulário após criar loja com sucesso', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="msg-sucesso-loja"]').should('be.visible');
      cy.wait(1500);
      cy.get('[data-cy="modal-content"]').should('not.exist');
    });
  });

  describe('Editar Loja', () => {
    it('Deve abrir modal de edição ao clicar em Editar', () => {
      cy.get('[data-cy="lojas-table"]').should('be.visible');
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      cy.get('[data-cy="modal-content"]').should('be.visible');
      cy.get('[data-cy="modal-title"]').should('contain', 'Editar Loja');
    });

    it('Deve exibir toggle de status em modo edição', () => {
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      cy.get('[data-cy="toggle-ativo-loja"]').should('be.visible');
    });

    it('Deve alternar status da loja', () => {
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      const toggleAntes = cy.get('[data-cy="toggle-ativo-loja"]');
      cy.get('[data-cy="toggle-ativo-loja"]').click();
      // Verifica que o toggle mudou de classe
      cy.get('[data-cy="toggle-ativo-loja"]').should('have.class', 'ativo');
    });

    it('Deve atualizar loja com sucesso', () => {
      cy.get('[data-cy^="btn-editar-loja-"]').first().click();
      cy.get('[data-cy="input-nome-loja"]').clear().type('Loja Atualizada');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="msg-sucesso-loja"]').should('contain', 'Loja atualizada com sucesso');
    });
  });

  describe('Interações do Modal', () => {
    it('Deve fechar modal ao clicar em Cancelar', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="btn-cancelar-loja"]').click();
      cy.get('[data-cy="modal-content"]').should('not.exist');
    });

    it('Deve fechar modal ao clicar no X', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="modal-close-button"]').click();
      cy.get('[data-cy="modal-content"]').should('not.exist');
    });

    it('Deve desabilitar campos enquanto carrega', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.get('[data-cy="input-slug-loja"]').type('loja-teste');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').should('be.disabled');
      cy.get('[data-cy="input-slug-loja"]').should('be.disabled');
      cy.get('[data-cy="input-cnpj-loja"]').should('be.disabled');
    });
  });

  describe('Listagem de Lojas', () => {
    it('Deve exibir tabela de lojas', () => {
      cy.get('[data-cy="lojas-table"]').should('be.visible');
      cy.get('[data-cy="lojas-table"] thead').should('be.visible');
    });

    it('Deve exibir colunas corretas', () => {
      cy.get('[data-cy="lojas-table"] th').should('have.length', 5);
      cy.get('[data-cy="lojas-table"] th').eq(0).should('contain', 'Nome');
      cy.get('[data-cy="lojas-table"] th').eq(1).should('contain', 'Slug');
      cy.get('[data-cy="lojas-table"] th').eq(2).should('contain', 'CNPJ');
      cy.get('[data-cy="lojas-table"] th').eq(3).should('contain', 'Status');
      cy.get('[data-cy="lojas-table"] th').eq(4).should('contain', 'Ações');
    });

    it('Deve exibir mensagem quando não há lojas', () => {
      // Limpa todas as lojas (se houver)
      cy.request('DELETE', '/api/lojas/all').then(() => {
        cy.reload();
        cy.get('[data-cy="empty-lojas"]').should('contain', 'Nenhuma loja cadastrada');
      });
    });
  });

  describe('Validações em Tempo Real', () => {
    it('Deve limpar erro ao editar campo com erro', () => {
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').focus().blur();
      cy.contains('Nome é obrigatório').should('be.visible');
      cy.get('[data-cy="input-nome-loja"]').type('Loja Teste');
      cy.contains('Nome é obrigatório').should('not.exist');
    });

    it('Deve validar slug único', () => {
      // Cria primeira loja
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Um');
      cy.get('[data-cy="input-slug-loja"]').type('loja-um');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000181');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.wait(1500);

      // Tenta criar segunda loja com mesmo slug
      cy.get('[data-cy="btn-nova-loja"]').click();
      cy.get('[data-cy="input-nome-loja"]').type('Loja Dois');
      cy.get('[data-cy="input-slug-loja"]').type('loja-um');
      cy.get('[data-cy="input-cnpj-loja"]').type('11222333000182');
      cy.get('[data-cy="btn-salvar-loja"]').click();
      cy.get('[data-cy="msg-erro-loja"]').should('contain', 'Slug já está em uso');
    });
  });
});
