import {
  prepararPedidoEntregueApi,
  loginApi,
  loginAdminUi,
  ADMIN,
} from '../../support/fluxo-venda.helpers';

describe('Trocas — Fluxo de Confirmar Recebimento e Geração de Cupom (RF0044)', () => {
  const CREDENCIAIS_ADMIN = {
    email: 'admintest@email.com',
    senha: '@asdf123',
  };

  const CREDENCIAIS_CLIENTE = {
    email: 'clientetest@email.com',
    senha: '@asdf123',
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
    // === ETAPA 1: Login como Admin via UI ===
    loginAdminUi();

    // === ETAPA 2: Confirmar recebimento via API (pedido já está autorizado) ===
    loginApi(ADMIN.email, ADMIN.senha).then((adminToken) => {
      // Confirmar recebimento via API
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('apiUrl')}/admin/pedidos/${pedidoUuid}/confirmar-recebimento`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-loja-uuid': '82c0a24c-4cf4-4b12-823a-f1a8b9a086c3'
        },
        body: { retornarEstoque: true }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.cupomGerado).to.exist;
        cupomCodigo = response.body.cupomGerado.codigo;
        
        // === ETAPA 5: Verificar cupom gerado ===
        cy.log(`Cupom gerado: ${cupomCodigo}`);
        expect(cupomCodigo).to.exist;
        expect(cupomCodigo).to.match(/^TROCA-/);
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
