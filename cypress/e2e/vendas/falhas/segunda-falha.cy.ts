/**
 * Testes E2E — Segunda Falha Consecutiva de Entrega
 * RN00XX — Regra de Negócio: Fluxo de segunda falha de entrega
 * 
 * Cobertura:
 * - Marcação da segunda falha consecutiva
 * - Exibição de aviso de múltiplas falhas
 * - Fluxo de redespacho após segunda falha
 * - Verificação de contagem de falhas
 * - Notificações ao cliente sobre segunda falha
 * 
 * Estratégia: E2E UI real com setup mínimo via API
 */

import { AdminPedidosPage } from '../../../support/pages/admin/AdminPedidosPage';
import { 
  setupInicialFalhas,
  executarFluxoSegundaFalha,
  verificarPedidoNaLista,
  verificarAvisoMultiplasFalhas,
  MOTIVOS_FALHA
} from '../../../support/helpers/falhasHelpers';

describe('Vendas — Segunda Falha Consecutiva', () => {
  beforeEach(() => {
    setupInicialFalhas();
  });

  describe('Marcação da Segunda Falha', () => {
    it('deve permitir marcar segunda falha de entrega', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar primeira falha e redespacho
        cy.despacharPedidoViaApi(vendaUuid);
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Solicitar reconfirmação e atualizar endereço
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: cy.apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: cy.apiHeadersBancoTestes(),
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
              ...cy.apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        // Redespachar
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: cy.apiHeadersBancoTestes(),
        });
        
        // Marcar segunda falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar status
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Falhou');
        });
      });
    });

    it('deve registrar contagem de falhas corretamente', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar contagem de falhas
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body).to.have.property('falhasEntrega');
          expect(res.body.falhasEntrega).to.equal(2);
        });
      });
    });
  });

  describe('Avisos e Notificações', () => {
    it('deve exibir aviso de múltiplas falhas na UI', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar aviso na UI
        verificarAvisoMultiplasFalhas(vendaUuid);
      });
    });

    it('deve notificar cliente sobre segunda falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Cliente verifica notificações
        cy.autenticarClienteViaApi();
        cy.visit('/cliente/pedidos');
        
        // Verificar se há notificação sobre falha
        cy.get('[data-cy="notificacoes-falha-entrega"]')
          .should('be.visible')
          .and('contain.text', '2ª falha de entrega');
      });
    });

    it('deve exibir aviso sobre próximo cancelamento', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar aviso sobre próxima falha
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy="aviso-proximo-cancelamento"]')
          .should('be.visible')
          .and('contain.text', 'Próxima falha resultará em cancelamento');
      });
    });
  });

  describe('Fluxo de Redespacho Após Segunda Falha', () => {
    it('deve permitir redespachar após segunda falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha e redespacho
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar status final
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Em Trânsito');
          expect(res.body.falhasEntrega).to.equal(2);
        });
      });
    });

    it('deve exigir confirmação extra para redespacho após segunda falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar primeira falha e redespacho
        cy.despacharPedidoViaApi(vendaUuid);
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Solicitar reconfirmação e atualizar endereço
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/solicitar-reconfirmacao-endereco`,
          headers: cy.apiHeadersBancoTestes(),
        });
        
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/clientes/perfil/enderecos`,
          headers: cy.apiHeadersBancoTestes(),
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
              ...cy.apiHeadersBancoTestes(),
            },
            body: {
              enderecoUuid: novoEnderecoUuid,
            },
          });
        });
        
        // Redespachar primeira vez
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/redespachar`,
          headers: cy.apiHeadersBancoTestes(),
        });
        
        // Marcar segunda falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar se exige confirmação via UI
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.despacharButton)
          .click();
        
        // Deve exibir modal de confirmação
        AdminPedidosPage.despachoModal.should('be.visible');
        cy.get('[data-cy="aviso-ultima-tentativa"]')
          .should('be.visible')
          .and('contain.text', 'Esta é a última tentativa antes do cancelamento');
      });
    });
  });

  describe('Verificações na UI', () => {
    it('deve exibir status com indicador visual de múltiplas falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar indicador visual
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.statusBadge)
          .should('contain.text', 'FALHOU')
          .and('have.class', 'status-falha-multipla');
      });
    });

    it('deve exibir histórico completo das falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar histórico
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Abrir detalhes
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.verDetalhesButton)
          .click();
        
        // Verificar histórico de falhas
        cy.get('[data-cy="historico-falhas"]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-cy="historico-falha-item"]').should('have.length', 2);
            cy.get('[data-cy="historico-falha-item"]').eq(0)
              .should('contain.text', MOTIVOS_FALHA.PRIMEIRA);
            cy.get('[data-cy="historico-falha-item"]').eq(1)
              .should('contain.text', MOTIVOS_FALHA.SEGUNDA);
          });
      });
    });

    it('deve bloquear ações indevidas após segunda falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar ações bloqueadas
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .within(() => {
            // Não deve despachar sem atualizar endereço
            AdminPedidosPage.despacharButton.should('be.disabled');
            
            // Deve permitir ver detalhes
            AdminPedidosPage.verDetalhesButton.should('not.be.disabled');
            
            // Deve permitir cancelar manualmente se necessário
            AdminPedidosPage.cancelarButton.should('not.be.disabled');
          });
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('não deve permitir marcar segunda falha sem primeira', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Tentar marcar segunda falha diretamente deve falhar
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/marcar-falha`,
          headers: cy.apiHeadersBancoTestes(),
          body: { motivo: MOTIVOS_FALHA.SEGUNDA },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.erro).to.include('não há falhas anteriores registradas');
        });
      });
    });

    it('deve manter contagem correta após redespacho', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo de segunda falha e redespacho
        executarFluxoSegundaFalha(vendaUuid, MOTIVOS_FALHA.SEGUNDA);
        
        // Verificar que contagem persiste após redespacho
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.falhasEntrega).to.equal(2);
          expect(res.body.status).to.equal('Em Trânsito');
        });
      });
    });
  });
});