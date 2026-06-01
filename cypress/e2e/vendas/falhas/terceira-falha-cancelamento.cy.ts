/**
 * Testes E2E — Terceira Falha e Cancelamento Automático
 * RN00XX — Regra de Negócio: 3 falhas de entrega consecutivas → cancelamento automático
 * 
 * Cobertura:
 * - Marcação da terceira falha consecutiva
 * - Cancelamento automático do pedido
 * - Notificação ao cliente sobre cancelamento
 * - Bloqueio de ações após cancelamento
 * - Histórico completo do processo
 * - Reembolso automático (se aplicável)
 * 
 * Estratégia: E2E UI real com setup mínimo via API
 */

import { AdminPedidosPage } from '../../../support/pages/admin/AdminPedidosPage';
import { 
  setupInicialFalhas,
  executarFluxoTerceiraFalha,
  verificarPedidoNaLista,
  verificarAvisoCancelamentoAutomatico,
  MOTIVOS_FALHA
} from '../../../support/helpers/falhasHelpers';

describe('Vendas — Terceira Falha e Cancelamento Automático', () => {
  beforeEach(() => {
    setupInicialFalhas();
  });

  describe('Marcação da Terceira Falha', () => {
    it('deve cancelar automaticamente após terceira falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo até terceira falha
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar cancelamento automático
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Cancelado');
          expect(res.body.falhasEntrega).to.equal(3);
          expect(res.body.motivoCancelamento).to.include('3 falhas consecutivas');
        });
      });
    });

    it('deve registrar contagem final de falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar contagem final
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.falhasEntrega).to.equal(3);
          expect(res.body.dataTerceiraFalha).to.not.be.null;
        });
      });
    });
  });

  describe('Cancelamento Automático', () => {
    it('deve exibir aviso de cancelamento automático na UI', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar aviso na UI
        verificarAvisoCancelamentoAutomatico(vendaUuid);
      });
    });

    it('deve bloquear todas as ações após cancelamento', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar ações bloqueadas
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .within(() => {
            // Todas as ações devem estar bloqueadas
            AdminPedidosPage.despacharButton.should('be.disabled');
            AdminPedidosPage.marcarFalhaButton.should('be.disabled');
            AdminPedidosPage.confirmarEntregaButton.should('be.disabled');
            
            // Apenas ver detalhes deve estar disponível
            AdminPedidosPage.verDetalhesButton.should('not.be.disabled');
          });
      });
    });

    it('deve registrar motivo automático de cancelamento', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar detalhes do cancelamento
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Abrir detalhes
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.verDetalhesButton)
          .click();
        
        // Verificar informações de cancelamento
        AdminPedidosPage.detalhesModal.should('be.visible');
        AdminPedidosPage.detalhesStatus.should('contain.text', 'Cancelado');
        
        cy.get('[data-cy="detalhes-motivo-cancelamento"]')
          .should('be.visible')
          .and('contain.text', 'Cancelado automaticamente')
          .and('contain.text', '3 falhas consecutivas');
      });
    });
  });

  describe('Notificações ao Cliente', () => {
    it('deve notificar cliente sobre cancelamento automático', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Cliente verifica notificações
        cy.autenticarClienteViaApi();
        cy.visit('/cliente/pedidos');
        
        // Verificar notificação de cancelamento
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('[data-cy="pedido-card"]')
          .find('[data-cy="notificacao-cancelamento"]')
          .should('be.visible')
          .and('contain.text', 'Pedido cancelado automaticamente');
      });
    });

    it('deve exibir informações de reembolso se aplicável', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Cliente verifica detalhes do pedido
        cy.autenticarClienteViaApi();
        cy.visit('/cliente/pedidos');
        
        // Abrir detalhes do pedido
        cy.contains(vendaUuid.split('-')[1].toUpperCase()).click();
        
        // Verificar informações de reembolso
        cy.get('[data-cy="info-reembolso"]')
          .should('be.visible')
          .and('contain.text', 'Reembolso em processamento');
      });
    });

    it('deve enviar email de notificação sobre cancelamento', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar se email foi enviado (via API de logs)
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/logs/emails`,
          headers: cy.apiHeadersBancoTestes(),
          qs: {
            vendaUuid,
            tipo: 'cancelamento_automatico',
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.emails).to.have.length.greaterThan(0);
          expect(res.body.emails[0]).to.have.property('assunto');
          expect(res.body.emails[0].assunto).to.include('cancelado');
        });
      });
    });
  });

  describe('Histórico e Auditoria', () => {
    it('deve registrar histórico completo das 3 falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar histórico completo
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
            cy.get('[data-cy="historico-falha-item"]').should('have.length', 3);
            
            // Verificar cada falha
            cy.get('[data-cy="historico-falha-item"]').eq(0)
              .should('contain.text', MOTIVOS_FALHA.PRIMEIRA);
            cy.get('[data-cy="historico-falha-item"]').eq(1)
              .should('contain.text', MOTIVOS_FALHA.SEGUNDA);
            cy.get('[data-cy="historico-falha-item"]').eq(2)
              .should('contain.text', MOTIVOS_FALHA.TERCEIRA);
          });
        
        // Verificar registro de cancelamento
        cy.get('[data-cy="historico-cancelamento"]')
          .should('be.visible')
          .and('contain.text', 'Cancelamento Automático')
          .and('contain.text', '3 falhas consecutivas');
      });
    });

    it('deve registrar timestamps de todas as falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar timestamps
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body).to.have.property('dataPrimeiraFalha');
          expect(res.body).to.have.property('dataSegundaFalha');
          expect(res.body).to.have.property('dataTerceiraFalha');
          expect(res.body).to.have.property('dataCancelamento');
          
          // Verificar ordem cronológica
          const data1 = new Date(res.body.dataPrimeiraFalha);
          const data2 = new Date(res.body.dataSegundaFalha);
          const data3 = new Date(res.body.dataTerceiraFalha);
          const dataCancel = new Date(res.body.dataCancelamento);
          
          expect(data1).to.be.before(data2);
          expect(data2).to.be.before(data3);
          expect(data3).to.be.before(dataCancel);
        });
      });
    });
  });

  describe('Verificações na UI', () => {
    it('deve exibir status cancelado com indicador visual', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar indicador visual
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.statusBadge)
          .should('contain.text', 'CANCELADO')
          .and('have.class', 'status-cancelado-automatico');
      });
    });

    it('deve exibir resumo estatístico de falhas', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar estatísticas
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Abrir detalhes
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.verDetalhesButton)
          .click();
        
        // Verificar resumo
        cy.get('[data-cy="resumo-falhas"]')
          .should('be.visible')
          .and('contain.text', '3 falhas registradas')
          .and('contain.text', 'Tempo total: ');
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('não deve permitir marcar quarta falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Tentar marcar quarta falha deve falhar
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/marcar-falha`,
          headers: cy.apiHeadersBancoTestes(),
          body: { motivo: 'Falha teste' },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.erro).to.include('Pedido já cancelado');
        });
      });
    });

    it('deve manter dados para auditoria futura', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Verificar se dados de auditoria estão preservados
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/auditoria/pedidos/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('historicoCompleto');
          expect(res.body.historicoCompleto).to.have.property('falhas');
          expect(res.body.historicoCompleto.falhas).to.have.length(3);
          expect(res.body.historicoCompleto).to.have.property('cancelamento');
          expect(res.body.historicoCompleto.cancelamento).to.have.property('automatico', true);
        });
      });
    });

    it('deve gerar relatório de falhas para análise', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        
        // Executar fluxo completo
        executarFluxoTerceiraFalha(vendaUuid, MOTIVOS_FALHA.TERCEIRA);
        
        // Gerar relatório
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/relatorios/falhas-entrega`,
          headers: cy.apiHeadersBancoTestes(),
          qs: {
            vendaUuid,
            formato: 'json',
          },
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('relatorio');
          expect(res.body.relatorio).to.have.property('totalFalhas', 3);
          expect(res.body.relatorio).to.have.property('resultado', 'Cancelado');
        });
      });
    });
  });
});