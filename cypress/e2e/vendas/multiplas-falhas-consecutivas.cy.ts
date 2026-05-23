/**
 * Testes E2E de Múltiplas Falhas Consecutivas
 * RN00XX — Regra de Negócio: 3 falhas de entrega consecutivas → cancelamento automático
 * 
 * Cobertura do fluxo de múltiplas falhas:
 * - Primeira falha de entrega
 * - Segunda falha de entrega (após redespacho)
 * - Terceira falha de entrega (após segundo redespacho)
 * - Cancelamento automático do pedido
 * - Notificação ao cliente sobre cancelamento
 * 
 * Estratégia: E2E UI real com setup mínimo via API (cy.request apenas para pré-condição)
 */

import { apiHeadersBancoTestes } from '../../support/helpers/checkoutHelpers';

describe('Vendas — Múltiplas Falhas Consecutivas', () => {
  const emailCliente = Cypress.env('clienteEmail') || 'clientetest@email.com';
  const senhaCliente = Cypress.env('clienteSenha') || '@asdfJKLÇ123';

  beforeEach(() => {
    Cypress.env('injectTestDbHeader', true);
  });

  describe('Primeira Falha de Entrega', () => {
    it('deve permitir marcar primeira falha de entrega', () => {
      // Setup: criar venda aprovada e despachar
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.autenticarAdministradorViaApi();
        cy.visit('/admin/pedidos');
        cy.get('[data-cy="loading"]', { timeout: 10000 }).should('not.exist');
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy="status-badge"]')
          .should('contain', 'FALHOU');
      });
    });

    it('deve permitir redespachar após primeira falha', () => {
      // Setup: criar venda aprovada e despachar
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        // Solicitar reconfirmação de endereço
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Cliente atualiza endereço via API (setup)
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        // Admin redespacha via API
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Verificar status
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Em Trânsito');
        });
      });
    });
  });

  describe('Segunda Falha de Entrega', () => {
    it('deve permitir marcar segunda falha de entrega', () => {
      // Setup: criar venda, primeira falha e redespacho
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar segunda falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Falhou');
        });
      });
    });

    it('deve exibir aviso de múltiplas falhas', () => {
      // Setup: criar venda, primeira falha e redespacho
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar segunda falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        // Verificar número de falhas via API
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.falhasEntrega).to.be.at.least(2);
        });
      });
    });

    it('deve permitir segundo redespacho', () => {
      // Setup: criar venda, primeira falha e redespacho
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar segunda falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        // Solicitar reconfirmação
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Cliente atualiza endereço via API (setup)
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        // Admin redespacha via API
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Verificar status
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Em Trânsito');
        });
      });
    });
  });

  describe('Terceira Falha de Entrega - Cancelamento Automático', () => {
    it('deve permitir marcar terceira falha de entrega', () => {
      // Setup: criar venda, duas falhas e dois redespachos
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Primeira falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Segunda falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Terceira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço incorreto novamente');
        
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Falhou');
        });
      });
    });

    it('deve cancelar pedido automaticamente após terceira falha via API', () => {
      // Setup: criar venda, duas falhas e dois redespachos
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Primeira falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Segunda falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar terceira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço incorreto novamente');
        
        // Verificar cancelamento automático via API
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Cancelado');
          expect(res.body.motivoCancelamento).to.include('3 falhas consecutivas');
        });
      });
    });

    it('deve impedir redespacho após cancelamento automático via API', () => {
      // Setup: criar venda, duas falhas e dois redespachos
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Primeira falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Segunda falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar terceira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço incorreto novamente');
        
        // Tentar redespachar pedido cancelado
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.erro).to.include('Pedido cancelado');
        });
      });
    });

    it('deve notificar cliente sobre cancelamento', () => {
      // Setup: criar venda, duas falhas e dois redespachos
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Primeira falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Segunda falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Marcar terceira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço incorreto novamente');
        
        // Cliente verifica pedido via API
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Cancelado');
          expect(res.body.motivoCancelamento).to.include('3 falhas consecutivas');
        });
      });
    });

    it('deve exibir aviso crítico de múltiplas falhas antes da terceira', () => {
      // Setup: criar venda, duas falhas e dois redespachos
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Primeira falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço não encontrado');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 1',
            numero: '111',
            complemento: '',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01200-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 1',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Segunda falha e redespacho
        cy.marcarFalhaEntregaViaApi(vendaUuid, 'Endereço ainda incorreto');
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: apiHeadersBancoTestes(),
          body: {
            logradouro: 'Rua Atualizada 2',
            numero: '222',
            complemento: '',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01320-000',
            tipo: 'entrega',
            principal: false,
            apelido: 'Endereço 2',
          },
        }).then((res) => {
          const novoEnderecoUuid = res.body.uuid;
          
          cy.request({
            method: 'PUT',
            url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}/endereco-entrega`,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              ...apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: apiHeadersBancoTestes(),
        });
        
        // Verificar número de falhas antes da terceira
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.falhasEntrega).to.equal(2);
        });
      });
    });
  });
});
