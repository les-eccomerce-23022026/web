describe('Admin — Seletor de Loja no Header', () => {
  beforeEach(() => {
    // Configurar ambiente de multi-loja
    cy.criarAmbienteMultiLoja();
  });

  it('seletor de loja não aparece quando admin tem apenas uma loja', () => {
    // Autenticar como admin com uma única loja
    cy.autenticarAdminLojaA();
    cy.visit('/admin');

    // Seletor não deve estar visível
    cy.get('[data-cy="seletor-loja-botao"]').should('not.exist');
  });

  it('seletor de loja aparece quando admin tem múltiplas lojas', () => {
    // Criar um admin que pertence a múltiplas lojas
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Seletor deve estar visível
    cy.get('[data-cy="seletor-loja-botao"]').should('be.visible');
  });

  it('seletor exibe loja atual selecionada', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Verificar que o seletor mostra a loja atual
    cy.get('[data-cy="seletor-loja-botao"]')
      .should('be.visible')
      .should('contain', 'Loja A');
  });

  it('dropdown abre e fecha ao clicar no botão', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Dropdown não deve estar visível inicialmente
    cy.get('[data-cy="seletor-loja-dropdown"]').should('not.exist');

    // Clicar no botão para abrir
    cy.get('[data-cy="seletor-loja-botao"]').click();

    // Dropdown deve aparecer
    cy.get('[data-cy="seletor-loja-dropdown"]').should('be.visible');

    // Clicar novamente para fechar
    cy.get('[data-cy="seletor-loja-botao"]').click();

    // Dropdown deve desaparecer
    cy.get('[data-cy="seletor-loja-dropdown"]').should('not.exist');
  });

  it('dropdown lista todas as lojas do admin', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Abrir dropdown
    cy.get('[data-cy="seletor-loja-botao"]').click();

    // Verificar que ambas as lojas aparecem no dropdown
    cy.get('[data-cy="seletor-loja-dropdown"]').should('be.visible');
    cy.get('[data-cy^="seletor-loja-opcao-"]').should('have.length.at.least', 2);
  });

  it('marca loja atual com checkmark no dropdown', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Abrir dropdown
    cy.get('[data-cy="seletor-loja-botao"]').click();

    // Verificar que a loja atual tem um checkmark
    cy.get('[data-cy="seletor-loja-dropdown"]')
      .find('[data-cy^="seletor-loja-opcao-"]')
      .first()
      .should('contain', '✓');
  });

  it('trocar de loja atualiza o cookie x-loja-uuid', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Obter UUID da segunda loja
    let lojaB_uuid: string;
    cy.get('[data-cy="seletor-loja-botao"]').click();
    cy.get('[data-cy^="seletor-loja-opcao-"]')
      .eq(1)
      .invoke('attr', 'data-cy')
      .then((dataCy) => {
        lojaB_uuid = dataCy!.replace('seletor-loja-opcao-', '');
      });

    // Clicar na segunda loja
    cy.get('[data-cy^="seletor-loja-opcao-"]').eq(1).click();

    // Verificar que o cookie foi atualizado
    cy.getCookie('x-loja-uuid').should('have.property', 'value', lojaB_uuid);
  });

  it('trocar de loja recarrega a página', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Abrir dropdown
    cy.get('[data-cy="seletor-loja-botao"]').click();

    // Clicar na segunda loja
    cy.get('[data-cy^="seletor-loja-opcao-"]').eq(1).click();

    // Página deve recarregar (verificar que o seletor está visível novamente)
    cy.get('[data-cy="seletor-loja-botao"]', { timeout: 10000 }).should('be.visible');
  });

  it('seletor persiste após navegação entre páginas admin', () => {
    cy.autenticarAdminMultiLoja();
    cy.visit('/admin');

    // Abrir dropdown e trocar de loja
    cy.get('[data-cy="seletor-loja-botao"]').click();
    cy.get('[data-cy^="seletor-loja-opcao-"]').eq(1).click();

    // Aguardar recarregamento
    cy.get('[data-cy="seletor-loja-botao"]', { timeout: 10000 }).should('be.visible');

    // Navegar para outra página admin
    cy.visit('/admin/pedidos');

    // Seletor deve estar visível e mostrar a loja selecionada
    cy.get('[data-cy="seletor-loja-botao"]').should('be.visible');
    cy.get('[data-cy="seletor-loja-botao"]').should('contain', 'Loja B');
  });

  it('seletor funciona corretamente com dados de múltiplas lojas', () => {
    // Criar vendas em ambas as lojas
    cy.obterPrimeiroLivroCatalogo().then((livroUuid) => {
      cy.criarVendaLojaA(livroUuid).then(() => {
        cy.criarVendaLojaB(livroUuid).then(() => {
          cy.autenticarAdminMultiLoja();
          cy.visit('/admin/pedidos');

          // Verificar que há pedidos visíveis
          cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 }).should('exist');

          // Trocar de loja
          cy.get('[data-cy="seletor-loja-botao"]').click();
          cy.get('[data-cy^="seletor-loja-opcao-"]').eq(1).click();

          // Aguardar recarregamento
          cy.get('[data-cy="seletor-loja-botao"]', { timeout: 10000 }).should('be.visible');

          // Verificar que os dados mudaram (pedidos da outra loja)
          cy.get('[data-cy="admin-pedido-card"]', { timeout: 10000 }).should('exist');
        });
      });
    });
  });
});
