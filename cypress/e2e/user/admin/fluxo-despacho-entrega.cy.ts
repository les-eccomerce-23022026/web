/**
 * Testes E2E do Fluxo Admin - Despacho e Entrega
 * RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega
 * 
 * Cobertura do fluxo administrativo de pedidos:
 * - Listar todos os pedidos (painel admin)
 * - Despachar pedido EM PROCESSAMENTO → EM TRÂNSITO
 * - Confirmar entrega EM TRÂNSITO → ENTREGUE
 */

import { apiHeadersAdmin, apiHeadersCliente } from './utils';

describe('Fluxo Admin - Despacho e Entrega', () => {
  let vendaUuid: string;
  let tokenAdmin: string;
  let tokenCliente: string;

  beforeEach(() => {
    // Login como admin
    const emailAdmin = (Cypress.env('adminEmail') as string | undefined) ?? 'admin@les.com.br';
    const senhaAdmin = (Cypress.env('adminSenha') as string | undefined) ?? '@Admin123#';
    
    const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
    
    // Obter token admin
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...apiHeadersAdmin(),
      },
      body: {
        email: emailAdmin,
        senha: senhaAdmin,
      },
    }).then((res) => {
      tokenAdmin = res.body.token;
    });

    // Login como cliente e criar venda
    const emailCliente = (Cypress.env('clienteEmail') as string | undefined) ?? 'clientetest@email.com';
    const senhaCliente = (Cypress.env('clienteSenha') as string | undefined) ?? '@asdfJKLÇ123';

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...apiHeadersCliente(),
      },
      body: {
        email: emailCliente,
        senha: senhaCliente,
      },
    }).then((res) => {
      tokenCliente = res.body.token;
    });

    // Preparar carrinho e criar venda
    cy.request({
      method: 'GET',
      url: `${apiUrl}/livros`,
      headers: apiHeadersCliente(),
    }).then((res) => {
      const primeiroLivro = res.body[0];
      const livroUuid = primeiroLivro.uuid;

      // Adicionar ao carrinho
      cy.request({
        method: 'POST',
        url: `${apiUrl}/carrinho/itens`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...apiHeadersCliente(),
        },
        body: {
          livroUuid,
          quantidade: 1,
        },
      });

      // Criar venda
      cy.request({
        method: 'POST',
        url: `${apiUrl}/vendas`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
        body: {
          itens: [{ livroUuid, quantidade: 1, precoUnitario: 30 }],
          valorTotalItens: 30,
          valorFrete: 10,
          valorTotal: 40,
        },
      }).then((res) => {
        vendaUuid = res.body.id;

        // Aprovar pagamento
        cy.request({
          method: 'POST',
          url: `${apiUrl}/pagamentos/selecionar`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${tokenCliente}`,
            ...apiHeadersCliente(),
          },
          body: {
            vendaUuid,
            valor: 40,
            tipoPagamento: 'cartao_credito',
            cartao: {
              numero: '4111111111111111',
              nomeTitular: 'Cliente Teste',
              validade: '12/30',
              bandeira: 'Visa',
            },
          },
        }).then((selRes) => {
          const pagamentoUuid = selRes.body.id;
          
          cy.request({
            method: 'POST',
            url: `${apiUrl}/pagamentos/${pagamentoUuid}/processar`,
            headers: {
              'Authorization': `Bearer ${tokenCliente}`,
              ...apiHeadersCliente(),
            },
          });
        });
      });
    });
  });

  describe('Listagem de Pedidos', () => {
    it('deve exibir lista de todos os pedidos no painel admin', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      cy.request({
        method: 'GET',
        url: `${apiUrl}/admin/pedidos`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.greaterThan(0);
      });
    });

    it('deve filtrar pedidos por busca', () => {
      cy.visit('/admin/pedidos');
      
      // Agregar carregamento
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Verificar campo de busca
      cy.get('[data-cy="checkout-filtro-busca"]')
        .should('exist')
        .type(vendaUuid.split('-')[1]);
    });

    it('deve filtrar pedidos por status', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      cy.get('[data-cy="filtro-status-pedidos"]')
        .should('exist')
        .select('Em Processamento');
    });
  });

  describe('Despacho de Pedido (RF0038)', () => {
    it('deve despachar pedido EM PROCESSAMENTO para EM TRÂNSITO', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Verificar status inicial
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('APROVADA');
      });

      // Despachar via API
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.uuid).to.equal(vendaUuid);
        expect(res.body.status).to.equal('Em Trânsito');
      });

      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('EM TRÂNSITO');
      });
    });

    it('deve exibir botão de despachar na UI para pedidos aprovados', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar o pedido na tabela e verificar botão de despachar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .should('exist')
        .should('be.visible');
    });

    it('deve despachar pedido via UI', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar no botão de despachar
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-despachar-"]')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'despachado');
      
      // Verificar que status mudou
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Em Trânsito');
    });

    it('deve impedir despacho de pedido já em trânsito', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Primeiro despacho
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      });

      // Tentar despachar novamente
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.sucesso).to.equal(false);
      });
    });
  });

  describe('Confirmação de Entrega (RF0039)', () => {
    beforeEach(() => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Despachar pedido primeiro
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/despachar`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      });
    });

    it('deve confirmar entrega EM TRÂNSITO para ENTREGUE', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Confirmar entrega via API
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('Entregue');
      });

      // Verificar status atualizado
      cy.request({
        method: 'GET',
        url: `${apiUrl}/vendas/${vendaUuid}`,
        headers: {
          'Authorization': `Bearer ${tokenCliente}`,
          ...apiHeadersCliente(),
        },
      }).then((res) => {
        expect(res.body.status).to.equal('ENTREGUE');
      });
    });

    it('deve exibir botão de confirmar entrega na UI para pedidos em trânsito', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Encontrar o pedido na tabela e verificar botão de confirmar entrega
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .should('exist')
        .should('be.visible');
    });

    it('deve confirmar entrega via UI', () => {
      cy.visit('/admin/pedidos');
      
      cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
      
      // Clicar no botão de confirmar entrega
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy^="btn-confirmar-entrega-"]')
        .click();
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="feedback-banner"]')
        .should('exist')
        .should('contain', 'entregue');
      
      // Verificar que status mudou
      cy.contains(vendaUuid.split('-')[1].toUpperCase())
        .parents('tr')
        .find('[data-cy="status-badge"]')
        .should('contain', 'Entregue');
    });

    it('deve impedir confirmação de entrega de pedido não em trânsito', () => {
      const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5173/api';
      
      // Tentar confirmar entrega sem despachar
      cy.request({
        method: 'PUT',
        url: `${apiUrl}/admin/pedidos/${vendaUuid}/entrega`,
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          ...apiHeadersAdmin(),
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.sucesso).to.equal(false);
      });
    });
  });
});
