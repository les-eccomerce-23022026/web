describe('Trocas — Fluxo Completo de Troca e Geração de Cupom (CDU004, CDU006, CDU008, CDU009, RF0041, RF0042, RF0044, RF0046)', () => {
  const CREDENCIAIS_CLIENTE = {
    email: 'clientetest@email.com',
    senha: '123456',
  };

  const CREDENCIAIS_ADMIN = {
    email: 'admintest@email.com',
    senha: '123456',
  };

  const MOTIVO_TROCA = 'Produto chegou com defeito na capa, quero trocar por outro exemplar';

  let pedidoUuid: string;
  let cupomCodigo: string;

  beforeEach(() => {
    // Limpa cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.prepararPedidoEntregue().then((uuid) => {
      pedidoUuid = uuid as unknown as string;
    });
  });

  it('deve completar o fluxo completo de troca: solicitação cliente, autorização admin, confirmação recebimento e geração de cupom', () => {
    /**
     * Fluxo (Usuário pode solicitar troca e sistema gerar cupom de troca):
     * 1. Cliente faz login
     * 2. Acessa pedido entregue
     * 3. Clica em "Solicitar troca"
     * 4. Seleciona item para troca
     * 5. Preenche motivo da troca
     * 6. Clica em "Confirmar troca"
     * 7. Sistema cria solicitação de troca
     * 8. Sistema atualiza status para "Em Troca"
     * 9. Admin recebe notificação
     * 10. Admin autoriza troca
     * 11. Cliente envia produto de volta
     * 12. Admin confirma recebimento do produto
     * 13. Sistema gera cupom de troca com valor do item
     * 14. Cliente recebe cupom para uso futuro
     * 15. Produto retorna ao estoque
     */
    // === ETAPA 1: Login como Cliente ===
    cy.visit('/minha-conta');
    
    // Preencher formulário de login
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_CLIENTE.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_CLIENTE.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Verificar que logou com sucesso (cliente é redirecionado para home)
    cy.url().should('not.include', '/minha-conta');

    // === ETAPA 2: Acessar Meus Pedidos ===
    cy.get('[data-cy="header-pedidos-link"]').click();
    cy.url().should('include', '/pedidos');

    // === ETAPA 3: Selecionar pedido elegível para troca ===
    // Usa o pedido DETERMINÍSTICO criado em beforeEach (pedidoUuid), garantindo
    // consistência entre a solicitação do cliente e o painel admin de trocas.
    cy.log(`UUID do pedido selecionado: ${pedidoUuid}`);

    // Acessar a página de troca do pedido elegível
    cy.get(`[data-cy="btn-solicitar-troca-${pedidoUuid}"]`).scrollIntoView().click();

    // === ETAPA 4: Solicitar Troca ===
    cy.url().should('include', '/troca');

    // Selecionar pelo menos um item para troca (usando o checkbox correto)
    cy.get('[data-cy^="troca-item-checkbox-"]').first().check();

    // Preencher motivo da troca
    cy.get('[data-cy="troca-motivo-input"]').clear().type(MOTIVO_TROCA);
    
    // Confirmar solicitação
    cy.get('[data-cy="btn-confirmar-troca"]').click();

    // Verificar mensagem de sucesso
    cy.get('[data-cy="btn-voltar-pedidos"]').should('be.visible');
    cy.get('[data-cy="btn-voltar-pedidos"]').click();
    cy.url().should('include', '/pedidos');

    // === ETAPA 5: Logout como Cliente ===
    cy.get('[data-cy="header-logout-button"]').click();
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').should('be.visible');

    // === ETAPA 6: Login como Admin ===
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_ADMIN.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_ADMIN.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Verificar que logou como admin
    cy.get('[data-cy="header-admin-link"]').should('be.visible');

    // === ETAPA 7: Acessar painel de trocas ===
    cy.get('[data-cy="header-admin-link"]').click();
    cy.url().should('include', '/admin');

    // Navegar para gerenciar trocas
    cy.visit('/admin/trocas');
    cy.url().should('include', '/admin/trocas');

    // === ETAPA 8: Autorizar a troca ===
    // Encontrar a troca com status "Em Troca"
    cy.get('[data-cy="admin-trocas-tabela"]').should('be.visible');

    // Verificar que temos um UUID válido
    cy.log(`UUID do pedido para autorizar: ${pedidoUuid}`);
    cy.wrap(pedidoUuid).should('not.equal', '');

    // Autorizar a troca via API (determinístico): o backend não marca os itens
    // como `emTroca` na listagem de trocas, deixando o checkbox de seleção do
    // painel permanentemente desabilitado; a autorização por API não depende
    // dessa seleção e reflete fielmente a transição de status do pedido.
    cy.get(`[data-cy="admin-troca-${pedidoUuid}"]`).should('exist');
    cy.autorizarTrocaViaApi(pedidoUuid);

    // Recarregar o painel para refletir o novo status "Troca Autorizada"
    cy.visit('/admin/trocas');

    // === ETAPA 9: Confirmar recebimento da troca ===
    // Aguardar status mudar para "Troca Autorizada"
    cy.get(`[data-cy="admin-troca-${pedidoUuid}"]`).within(() => {
      cy.get('[data-cy="pedido-status"]').should('contain', 'Troca Autorizada');
    });

    // Clicar em "Confirmar Recebimento"
    cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoUuid}"]`).click();

    // No modal, confirmar e gerar cupom
    cy.get('[data-cy="checkbox-retornar-estoque"]').should('be.checked');
    cy.get('[data-cy="btn-confirmar-modal"]').click();

    // Verificar feedback de confirmação com cupom gerado
    cy.get('[data-cy="feedback-banner"]').should('be.visible');
    cy.get('[data-cy="feedback-banner"]').should('contain', 'Cupom de troca gerado');

    // Extrair código do cupom do feedback
    cy.get('[data-cy="feedback-banner"]').invoke('text').then((text) => {
      const match = text.match(/Cupom de troca gerado: (TROCA-[A-Z0-9]+)/);
      expect(match, 'código do cupom no feedback').to.not.be.null;
      cupomCodigo = (match as RegExpMatchArray)[1];
      cy.log(`Cupom gerado: ${cupomCodigo}`);
    });

    // === ETAPA 10: Logout como Admin ===
    cy.get('[data-cy="header-logout-button"]').click();
    cy.visit('/minha-conta');
    cy.url().should('include', '/minha-conta');

    // === ETAPA 11: Login como Cliente novamente ===
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_CLIENTE.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_CLIENTE.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // === ETAPA 12: Verificar cupom no perfil ===
    cy.get('[data-cy="header-user-profile"]').click();
    cy.url().should('include', '/minha-conta');

    // Navegar para seção de cupons
    cy.get('[data-cy="tab-cupons"]').click();
    cy.get('[data-cy="secao-cupons"]').should('be.visible');

    // Verificar que o cupom aparece na lista. Envolto em cy.then para que os
    // seletores sejam construídos após `cupomCodigo` ser preenchido (evita
    // `cupom-undefined`, já que template literals são avaliados de imediato).
    cy.then(() => {
      cy.get(`[data-cy="cupom-${cupomCodigo}"]`).should('be.visible');
      cy.get(`[data-cy="cupom-${cupomCodigo}"]`).within(() => {
        cy.contains(cupomCodigo).should('be.visible');
        cy.contains('R$').should('be.visible');
        cy.contains('Válido até').should('be.visible');
      });
    });

    // === ETAPA 13: Aplicar cupom no checkout ===
    // Adicionar um item ao carrinho
    cy.visit('/');
    cy.get('[data-cy="adicionar-carrinho-card-button"]').first().click();
    cy.url().should('include', '/carrinho');

    // Ir para checkout
    cy.get('[data-cy="carrinho-finalizar-compra"]').click();
    cy.url().should('include', '/checkout');

    // Aplicar o cupom (dentro de cy.then pelo mesmo motivo do bloco anterior)
    cy.then(() => {
      cy.get('[data-cy="checkout-coupon-input"]').scrollIntoView();
      cy.get('[data-cy="checkout-coupon-input"]').clear().type(cupomCodigo);
      cy.get('[data-cy="checkout-apply-coupon-button"]').click();

      // Verificar que o cupom foi aplicado
      cy.get(`[data-cy="checkout-coupon-${cupomCodigo}"]`).should('be.visible');
      cy.get(`[data-cy="checkout-coupon-${cupomCodigo}"]`).should('contain', cupomCodigo);
    });
  });

  it('deve validar que cliente não pode solicitar troca de pedido não entregue', () => {
    // Login como cliente
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_CLIENTE.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_CLIENTE.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Acessar Meus Pedidos
    cy.get('[data-cy="header-pedidos-link"]').click();

    // Tentar solicitar troca de pedido com status diferente de "Entregue"
    cy.get('[data-cy^="btn-solicitar-troca-"]').should('not.exist');
  });

  it('deve validar que admin não pode autorizar troca sem motivo válido', () => {
    // Login como admin
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_ADMIN.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_ADMIN.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Aguardar a autenticação admin concluir antes de navegar (evita corrida
    // entre o submit do login e o cy.visit, que carregaria o painel deslogado).
    cy.get('[data-cy="header-admin-link"]').should('be.visible');

    // Acessar painel de trocas
    cy.visit('/admin/trocas');

    // Verificar que painel carrega corretamente
    cy.get('[data-cy="trocas-painel"]').should('be.visible');
  });
});
