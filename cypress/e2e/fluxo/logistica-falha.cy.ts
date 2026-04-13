/**
 * Teste E2E - Sprint 3: Logística e Exceções
 * Fluxo: Falha na Entrega -> Re-endereçamento pelo Cliente -> Novo Despacho pelo Admin
 */

const PEDIDO_FALHA_UUID = 'e1e1e1e1-2222-3333-4444-555555555555';
const ENTREGA_FALHA_UUID = 'd1d1d1d1-2222-3333-4444-555555555555';

describe('Logística - Fluxo de Falha e Re-endereçamento (Sprint 3)', () => {
  const apiUrl = Cypress.env('apiUrl') as string;

  beforeEach(() => {
    // Interceptar as APIs para simular o estado inicial (Pedido Em Trânsito)
    const pedidoInicial = {
      id: PEDIDO_FALHA_UUID,
      totalVenda: 150.00,
      status: 'EM TRÂNSITO',
      usuarioUuid: 'user-cliente-uuid',
      itens: [
        { id: 'item-1', livroUuid: 'livro-1', quantidade: 1, precoUnitario: 150.00 }
      ],
      criadoEm: new Date().toISOString()
    };

    const entregaInicial = {
      uuid: ENTREGA_FALHA_UUID,
      vendaUuid: PEDIDO_FALHA_UUID,
      tipoFrete: 'SEDEX',
      custo: 20.00,
      endereco: { logradouro: 'Rua Antiga', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000000' },
      criadoEm: new Date().toISOString()
    };

    cy.intercept('GET', `${apiUrl}/admin/pedidos*`, [pedidoInicial]).as('getPedidosAdmin');
    cy.intercept('GET', `${apiUrl}/minhas-vendas*`, [pedidoInicial]).as('getPedidosCliente');
    cy.intercept('GET', `${apiUrl}/entregas?vendaUuid=${PEDIDO_FALHA_UUID}`, [entregaInicial]).as('getEntregaVenda');
    cy.intercept('GET', `${apiUrl}/entregas/${ENTREGA_FALHA_UUID}`, entregaInicial).as('getEntregaDetalhe');
    cy.intercept('GET', `${apiUrl}/vendas/${PEDIDO_FALHA_UUID}`, pedidoInicial).as('getPedidoDetalhe');
  });

  it('deve permitir que o Admin registre falha e o Cliente corrija o endereço', () => {
    // 1. ADMIN REGISTRA FALHA
    cy.loginProgramatico('admin');
    cy.visit('/admin/pedidos');
    cy.wait('@getPedidosAdmin');

    // Simular resposta de falha
    cy.intercept('PATCH', `${apiUrl}/entregas/${ENTREGA_FALHA_UUID}/falha`, { statusCode: 204 }).as('patchFalha');
    
    // Atualizar o pedido para refletir a falha após o clique
    cy.intercept('GET', `${apiUrl}/admin/pedidos*`, [{
      id: PEDIDO_FALHA_UUID,
      status: 'FALHA NA ENTREGA',
      totalVenda: 150.00,
      usuarioUuid: 'user-cliente-uuid',
      itens: [{ id: 'item-1', livroUuid: 'livro-1', quantidade: 1, precoUnitario: 150.00 }],
      criadoEm: new Date().toISOString()
    }]).as('getPedidosAdminFalha');

    cy.get(`[id="btn-falha-entrega-${PEDIDO_FALHA_UUID}"]`).should('be.visible').click();
    cy.wait('@patchFalha');
    cy.wait('@getPedidosAdminFalha');

    cy.contains('Falha na Entrega').should('be.visible');
    cy.contains('Aguardando re-endereçamento pelo cliente').should('be.visible');

    // 2. CLIENTE CORRIGE ENDEREÇO
    cy.loginProgramatico('cliente');
    
    // Mockar pedido com falha para o cliente
    cy.intercept('GET', `${apiUrl}/minhas-vendas*`, [{
      id: PEDIDO_FALHA_UUID,
      status: 'FALHA NA ENTREGA',
      totalVenda: 150.00,
      usuarioUuid: 'user-cliente-uuid',
      itens: [{ id: 'item-1', livroUuid: 'livro-1', quantidade: 1, precoUnitario: 150.00 }],
      criadoEm: new Date().toISOString()
    }]).as('getPedidosClienteFalha');

    cy.visit('/pedidos');
    cy.wait('@getPedidosClienteFalha');

    cy.contains('Não conseguimos entregar seu pedido').should('be.visible');
    cy.get(`[data-cy="btn-corrigir-endereco-${PEDIDO_FALHA_UUID}"]`).should('be.visible').click();

    // Simular lista de endereços do cliente
    cy.intercept('GET', `${apiUrl}/clientes/perfil`, {
      dados: {
        user: { uuid: 'user-cliente-uuid', nome: 'Cliente Teste' },
        enderecos: [
          { uuid: 'end-novo', apelido: 'Casa Nova', logradouro: 'Rua Nova', numero: '456', bairro: 'Novo', cidade: 'São Paulo', estado: 'SP', cep: '02000000' }
        ]
      }
    }).as('getPerfil');

    cy.contains('Corrigir endereço de entrega').should('be.visible');
    
    // Simular reagendamento com sucesso
    cy.intercept('PATCH', `${apiUrl}/entregas/${ENTREGA_FALHA_UUID}/reagendar`, { statusCode: 204 }).as('patchReagendar');
    
    // Atualizar pedido para EM PROCESSAMENTO após reagendar
    cy.intercept('GET', `${apiUrl}/minhas-vendas*`, [{
      id: PEDIDO_FALHA_UUID,
      status: 'EM PROCESSAMENTO',
      totalVenda: 150.00,
      usuarioUuid: 'user-cliente-uuid',
      itens: [{ id: 'item-1', livroUuid: 'livro-1', quantidade: 1, precoUnitario: 150.00 }],
      criadoEm: new Date().toISOString()
    }]).as('getPedidosClienteReagendado');

    cy.contains('Casa Nova').click();
    cy.wait('@patchReagendar');
    cy.wait('@getPedidosClienteReagendado');

    cy.contains('Em Processamento').should('be.visible');
    cy.contains('Não conseguimos entregar seu pedido').should('not.exist');

    // 3. ADMIN DESPACHA NOVAMENTE
    cy.loginProgramatico('admin');
    
    cy.intercept('GET', `${apiUrl}/admin/pedidos*`, [{
      id: PEDIDO_FALHA_UUID,
      status: 'EM PROCESSAMENTO',
      totalVenda: 150.00,
      usuarioUuid: 'user-cliente-uuid',
      itens: [{ id: 'item-1', livroUuid: 'livro-1', quantidade: 1, precoUnitario: 150.00 }],
      criadoEm: new Date().toISOString()
    }]).as('getPedidosAdminReagendado');

    cy.visit('/admin/pedidos');
    cy.wait('@getPedidosAdminReagendado');

    cy.get(`[id="btn-despachar-${PEDIDO_FALHA_UUID}"]`).should('be.visible');
  });
});
