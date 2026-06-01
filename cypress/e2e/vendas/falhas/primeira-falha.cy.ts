/**
 * Testes E2E — Primeira Falha de Entrega
 * RN00XX — Regra de Negócio: Fluxo de primeira falha de entrega
 * 
 * Cobertura:
 * - Marcação da primeira falha de entrega
 * - Verificação do status "Falhou" na UI
 * - Fluxo completo de redespacho após primeira falha
 * - Atualização de endereço pelo cliente
 * - Retorno ao status "Em Trânsito"
 * 
 * Estratégia: E2E UI real com setup mínimo via API
 */

import { AdminPedidosPage } from '../../../support/pages/admin/AdminPedidosPage';
import { 
  setupInicialFalhas,
  executarFluxoPrimeiraFalha,
  verificarPedidoNaLista,
  MOTIVOS_FALHA
} from '../../../support/helpers/falhasHelpers';

describe('Vendas — Primeira Falha de Entrega', () => {
  beforeEach(() => {
    setupInicialFalhas();
  });

  describe('Marcação da Primeira Falha', () => {
    it('deve permitir marcar primeira falha de entrega', () => {
      // Setup: criar venda aprovada e despachar
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar na UI
        cy.autenticarAdministradorViaApi();
        verificarPedidoNaLista(vendaUuid, 'FALHOU');
      });
    });

    it('deve exibir motivo da falha nos detalhes do pedido', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar detalhes
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Encontrar pedido e abrir detalhes
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.verDetalhesButton)
          .click();
        
        // Verificar motivo da falha
        AdminPedidosPage.detalhesModal.should('be.visible');
        AdminPedidosPage.detalhesStatus.should('contain.text', 'Falhou');
        
        // Verificar se há registro da falha
        cy.get('[data-cy="detalhes-historico-falhas"]')
          .should('be.visible')
          .and('contain.text', MOTIVOS_FALHA.PRIMEIRA);
      });
    });
  });

  describe('Fluxo de Redespacho', () => {
    it('deve permitir redespachar após primeira falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Executar fluxo completo de primeira falha e redespacho
        executarFluxoPrimeiraFalha(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar status final
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/vendas/${vendaUuid}`,
          headers: cy.apiHeadersBancoTestes(),
        }).then((res) => {
          expect(res.body.status).to.equal('Em Trânsito');
        });
      });
    });

    it('deve solicitar reconfirmação de endereço ao cliente', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar se há notificação para reconfirmar endereço
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find('[data-cy="acao-solicitar-reconfirmacao"]')
          .should('be.visible')
          .and('not.be.disabled');
      });
    });

    it('deve permitir atualizar endereço antes do redespacho', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Cliente atualiza endereço
        cy.autenticarClienteViaApi();
        cy.visit('/cliente/perfil/enderecos');
        
        // Verificar se pode adicionar novo endereço
        cy.get('[data-cy="btn-novo-endereco"]')
          .should('be.visible')
          .and('not.be.disabled');
      });
    });
  });

  describe('Verificações na UI', () => {
    it('deve exibir status correto após primeira falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar na lista de pedidos
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Verificar badge de status
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.statusBadge)
          .should('contain.text', 'FALHOU')
          .and('have.class', 'status-falha');
      });
    });

    it('deve exibir botões de ação corretos após primeira falha', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar ações disponíveis
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .within(() => {
            // Não deve permitir despachar novamente sem atualizar endereço
            AdminPedidosPage.despacharButton.should('be.disabled');
            
            // Deve permitir ver detalhes
            AdminPedidosPage.verDetalhesButton.should('not.be.disabled');
            
            // Não deve permitir cancelar ainda
            AdminPedidosPage.cancelarButton.should('not.be.disabled');
          });
      });
    });

    it('deve registrar histórico da falha corretamente', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Marcar primeira falha
        cy.marcarFalhaEntregaViaApi(vendaUuid, MOTIVOS_FALHA.PRIMEIRA);
        
        // Verificar histórico
        cy.autenticarAdministradorViaApi();
        AdminPedidosPage.visitar();
        
        // Abrir detalhes
        cy.contains(vendaUuid.split('-')[1].toUpperCase())
          .parents('tr')
          .find(AdminPedidosPage.verDetalhesButton)
          .click();
        
        // Verificar se há aba de histórico
        cy.get('[data-cy="aba-historico"]').click();
        cy.get('[data-cy="historico-item"]')
          .should('contain.text', 'Falha de Entrega')
          .and('contain.text', MOTIVOS_FALHA.PRIMEIRA);
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('não deve permitir marcar falha em pedido não despachado', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        // Não despachar
        
        // Tentar marcar falha deve falhar
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/marcar-falha`,
          headers: cy.apiHeadersBancoTestes(),
          body: { motivo: MOTIVOS_FALHA.PRIMEIRA },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('erro');
        });
      });
    });

    it('deve manter pedido cancelado por outras razões intacto', () => {
      cy.criarVendaAprovadaViaApi().then((dados) => {
        const vendaUuid = dados.vendaUuid;
        cy.despacharPedidoViaApi(vendaUuid);
        
        // Cancelar por outro motivo
        cy.cancelarPedidoViaApi(vendaUuid, 'Cancelado pelo cliente');
        
        // Tentar marcar falha deve falhar
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl') || 'http://localhost:5173/api'}/admin/pedidos/${vendaUuid}/marcar-falha`,
          headers: cy.apiHeadersBancoTestes(),
          body: { motivo: MOTIVOS_FALHA.PRIMEIRA },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('erro');
        });
      });
    });
  });
});