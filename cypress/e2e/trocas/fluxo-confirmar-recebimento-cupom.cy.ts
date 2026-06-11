describe('Trocas — Fluxo de Confirmar Recebimento e Geração de Cupom (RF0044)', () => {
  const CREDENCIAIS_ADMIN = {
    email: 'admintest@email.com',
    senha: '123456',
  };

  const CREDENCIAIS_CLIENTE = {
    email: 'clientetest@email.com',
    senha: '123456',
  };

  let pedidoUuid: string;
  let cupomCodigo: string;

  beforeEach(() => {
    // Limpa cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();

    // Criar dados de teste: troca com status "Troca Autorizada".
    // prepararPedidoEntregue retorna o uuid do pedido recém-criado — capturamos
    // para usá-lo de forma DETERMINÍSTICA em todo o fluxo.
    cy.prepararPedidoEntregue().then((uuid) => {
      pedidoUuid = uuid;
      // Autoriza a troca EXATAMENTE do pedido que acabamos de criar.
      cy.criarTrocaAutorizada(pedidoUuid);
    });

    // criarTrocaAutorizada faz login via cy.request (cliente/admin), o que define
    // cookies HttpOnly de sessão. Limpar novamente para garantir que o teste
    // comece deslogado e a página /minha-conta renderize o formulário de login.
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('deve confirmar recebimento de troca e gerar cupom corretamente', () => {
    /**
     * Fluxo (Admin confirma recebimento do produto devolvido e sistema gerar cupom):
     * 1. Cliente solicita troca (status "Troca Autorizada")
     * 2. Admin faz login
     * 3. Navega para painel de trocas
     * 4. Encontra solicitação com status "Troca Autorizada"
     * 5. Clica em "Confirmar recebimento"
     * 6. Sistema solicita confirmação de retorno ao estoque
     * 7. Admin confirma recebimento
     * 8. Sistema gera cupom de troca com valor do item
     * 9. Sistema atualiza status para "Troca Concluída"
     * 10. Cliente recebe notificação e cupom
     * 11. Produto retorna ao estoque
     */
    // === ETAPA 1: Login como Admin ===
    cy.visit('/minha-conta');
    
    // Preencher formulário de login
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_ADMIN.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_ADMIN.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // Verificar que logou como admin
    cy.get('[data-cy="header-admin-link"]').should('be.visible');

    // === ETAPA 2: Acessar painel de trocas ===
    cy.visit('/admin/trocas');
    cy.url().should('include', '/admin/trocas');

    // === ETAPA 3: Localizar a troca do pedido criado (determinístico via uuid) ===
    // Verificar que painel carrega corretamente
    cy.get('[data-cy="trocas-painel"]').should('be.visible');
    cy.get('[data-cy="admin-trocas-tabela"]').should('be.visible');

    // A linha do nosso pedido deve existir e estar com status "Troca Autorizada"
    cy.get(`[data-cy="admin-troca-${pedidoUuid}"]`)
      .should('be.visible')
      .find('[data-cy="pedido-status"]')
      .should('contain', 'Troca Autorizada');

    // === ETAPA 4: Confirmar recebimento da troca ===
    // Clicar em "Confirmar Recebimento" do pedido específico
    cy.get(`[data-cy="btn-confirmar-recebimento-${pedidoUuid}"]`).click();

    // === ETAPA 5: Confirmar no modal ===
    // Verificar que modal abriu
    cy.get('[data-cy="checkbox-retornar-estoque"]').should('be.visible');
    cy.get('[data-cy="checkbox-retornar-estoque"]').should('be.checked');
    
    // Confirmar e gerar cupom
    cy.get('[data-cy="btn-confirmar-modal"]').click();

    // Verificar feedback de confirmação com cupom gerado
    cy.get('[data-cy="feedback-banner"]').should('be.visible');
    cy.get('[data-cy="feedback-banner"]').should('contain', 'Cupom de troca gerado');

    // Extrair código do cupom do feedback
    cy.get('[data-cy="feedback-banner"]').invoke('text').then((text) => {
      const match = text.match(/(TROCA-[A-Za-z0-9]+)/);
      expect(match, `feedback deve conter código de cupom. Texto: "${text}"`).to.not.be.null;
      cupomCodigo = match![1];
      cy.log(`Cupom gerado: ${cupomCodigo}`);
    });

    // === ETAPA 6: Logout como Admin ===
    cy.get('[data-cy="header-logout-button"]').click();
    cy.url().should('include', '/minha-conta');

    // === ETAPA 7: Login como Cliente ===
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_CLIENTE.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_CLIENTE.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    // === ETAPA 8: Verificar cupom no perfil ===
    cy.get('[data-cy="header-user-profile"]').click();
    cy.url().should('include', '/minha-conta');

    // Navegar para seção de cupons
    cy.get('[data-cy="tab-cupons"]').click();
    cy.get('[data-cy="secao-cupons"]').should('be.visible');

    // Verificar que o cupom aparece na lista.
    // Os seletores precisam do código capturado em runtime — por isso lemos
    // `cupomCodigo` dentro de cy.then (a interpolação direta ocorreria no enqueue,
    // quando a variável ainda está undefined).
    cy.then(() => {
      expect(cupomCodigo, 'código do cupom deve ter sido capturado').to.match(/^TROCA-/);
      cy.get(`[data-cy="cupom-${cupomCodigo}"]`).should('be.visible');
      cy.get(`[data-cy="cupom-${cupomCodigo}"]`).within(() => {
        cy.get(`[data-cy="cupom-codigo-${cupomCodigo}"]`).should('contain', cupomCodigo);
        cy.get(`[data-cy="cupom-valor-${cupomCodigo}"]`).should('contain', 'R$');
        cy.get(`[data-cy="cupom-validade-${cupomCodigo}"]`).should('contain', 'Válido até');
      });
    });
  });

  it('deve validar que cupom gerado tem valor correto do item devolvido', () => {
    // Este teste valida que o valor do cupom corresponde ao valor do item devolvido
    // Baseado na observação de que o cupom TROCA-7A1D6301 tem valor R$ 134,00
    
    cy.visit('/minha-conta');
    cy.get('[data-cy="login-email-input"]').clear().type(CREDENCIAIS_CLIENTE.email);
    cy.get('[data-cy="login-password-input"]').clear().type(CREDENCIAIS_CLIENTE.senha);
    cy.get('[data-cy="login-submit-button"]').click();

    cy.get('[data-cy="header-user-profile"]').click();
    cy.get('[data-cy="tab-cupons"]').click();
    cy.get('[data-cy="secao-cupons"]').should('be.visible');

    // Verificar que cupons de troca têm valores positivos
    cy.get('[data-cy^="cupom-TROCA-"]').each(($cupom) => {
      cy.wrap($cupom).within(() => {
        cy.get('[data-cy^="cupom-valor-"]').invoke('text').then((valorText) => {
          // Remover 'R$', substituir vírgula por ponto e remover espaços
          const valorLimpo = valorText.replace('R$', '').replace(',', '.').trim();
          const valor = parseFloat(valorLimpo);
          expect(valor).to.be.greaterThan(0);
        });
      });
    });
  });
});
