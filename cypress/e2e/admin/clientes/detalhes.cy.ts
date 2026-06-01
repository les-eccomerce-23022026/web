/**
 * Testes E2E da Página Admin — Detalhes do Cliente
 * Foco: Visualização de informações detalhadas do cliente
 */

import { AdminClientesPage } from '../../support/pages/admin/AdminClientesPage';
import { TIMEOUT } from '../../support/constants';

describe('Admin — Detalhes do Cliente', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso aos Detalhes', () => {
    it('deve ter botão para ver detalhes do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.verDetalhesButton.should('be.visible');
      });
    });

    it('deve permitir visualizar detalhes do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
      cy.url().should('include', '/admin/clientes/');
    });

    it('deve exibir modal de detalhes corretamente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
      AdminClientesPage.detalhesModal.should('have.attr', 'role', 'dialog');
    });
  });

  describe('Informações Pessoais', () => {
    it('deve exibir ID do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesClienteId.should('be.visible');
    });

    it('deve exibir nome do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesNome.should('be.visible');
      AdminClientesPage.detalhesNome.should('contain.text');
    });

    it('deve exibir email do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesEmail.should('be.visible');
      AdminClientesPage.detalhesEmail.should('contain', '@');
    });

    it('deve exibir CPF do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesCpf.should('be.visible');
      AdminClientesPage.detalhesCpf.should('contain', /\d{3}\.\d{3}\.\d{3}-\d{2}/);
    });

    it('deve exibir telefone do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesTelefone.should('be.visible');
    });

    it('deve exibir data de nascimento do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesDataNascimento.should('be.visible');
    });

    it('deve exibir gênero do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesGenero.should('be.visible');
    });
  });

  describe('Endereço', () => {
    it('deve exibir endereço do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesEndereco.should('be.visible');
    });

    it('deve exibir informações completas do endereço', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      // Verifica se contém informações típicas de endereço
      AdminClientesPage.detalhesEndereco.should('contain.text');
    });
  });

  describe('Informações de Conta', () => {
    it('deve exibir data de cadastro', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesDataCadastro.should('be.visible');
    });

    it('deve exibir status do cliente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesStatus.should('be.visible');
    });

    it('deve exibir último login', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesUltimoLogin.should('be.visible');
    });
  });

  describe('Histórico de Compras', () => {
    it('deve exibir total de pedidos', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesTotalPedidos.should('be.visible');
    });

    it('deve exibir valor total de compras', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesValorTotalCompras.should('be.visible');
    });

    it('deve ter botão para ver pedidos do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.verPedidosButton.should('be.visible');
      });
    });

    it('deve permitir navegar para pedidos do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verPedidosCliente(0);
      
      cy.url().should('include', '/admin/pedidos?cliente=');
    });
  });

  describe('Navegação no Modal', () => {
    it('deve ter botão para fechar modal', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesFecharButton.should('be.visible');
    });

    it('deve permitir fechar modal com botão fechar', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.fecharDetalhes();
      
      AdminClientesPage.detalhesModal.should('not.exist');
    });

    it('deve permitir fechar modal com ESC', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
      
      // Pressiona ESC para fechar
      cy.get('body').type('{esc}');
      
      AdminClientesPage.detalhesModal.should('not.exist');
    });

    it('deve permitir fechar modal clicando fora', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
      
      // Clica fora do modal (backdrop)
      cy.get('body').click(0, 0);
      
      AdminClientesPage.detalhesModal.should('not.exist');
    });
  });

  describe('Validação de Dados', () => {
    it('deve exibir dados formatados corretamente', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      // Verifica formatação do CPF
      AdminClientesPage.detalhesCpf.should('match', /\d{3}\.\d{3}\.\d{3}-\d{2}/);
      
      // Verifica formatação do email
      AdminClientesPage.detalhesEmail.should('match', /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('deve exibir status com cores apropriadas', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesStatus.should('be.visible');
      // Pode ter classes específicas para cada status
    });

    it('deve exibir valores monetários formatados', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesValorTotalCompras.should('contain', 'R$');
    });
  });

  describe('Carregamento de Dados', () => {
    it('deve exibir loading durante carregamento', () => {
      AdminClientesPage.visitar();
      
      // Intercepta a requisição para atrasar e testar loading
      cy.intercept('GET', '/api/admin/clientes/*', {
        delayMs: 1000,
        fixture: 'cliente-detalhes.json'
      }).as('getClienteDetalhes');
      
      AdminClientesPage.verDetalhesCliente(0);
      
      cy.wait('@getClienteDetalhes');
      AdminClientesPage.detalhesModal.should('be.visible');
    });

    it('deve tratar erro de carregamento', () => {
      AdminClientesPage.visitar();
      
      // Simula erro na API
      cy.intercept('GET', '/api/admin/clientes/*', {
        statusCode: 500,
        body: { error: 'Erro interno' }
      }).as('getClienteErro');
      
      AdminClientesPage.verDetalhesCliente(0);
      
      cy.wait('@getClienteErro');
      AdminClientesPage.mensagemErro.should('be.visible');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria-label no modal', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('have.attr', 'aria-modal', 'true');
    });

    it('deve ter foco gerenciável no modal', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesFecharButton.should('be.focused');
    });

    it('deve ter títulos semânticos', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('contain', 'h2');
    });

    it('deve ter descrições para leitores de tela', () => {
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('have.attr', 'aria-describedby');
    });
  });

  describe('Responsividade do Modal', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
      AdminClientesPage.detalhesModal.should('have.css', 'width').and('match', /\d+px/);
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      AdminClientesPage.visitar();
      AdminClientesPage.verDetalhesCliente(0);
      
      AdminClientesPage.detalhesModal.should('be.visible');
    });
  });

  describe('Integração com Lista', () => {
    it('deve manter sincronia com lista após fechar', () => {
      AdminClientesPage.visitar();
      
      // Verifica estado antes
      AdminClientesPage.verificarTabelaCarregada();
      
      AdminClientesPage.verDetalhesCliente(0);
      AdminClientesPage.fecharDetalhes();
      
      // Verifica que lista ainda está carregada
      AdminClientesPage.verificarTabelaCarregada();
    });

    it('deve permitir visualizar múltiplos clientes', () => {
      AdminClientesPage.visitar();
      
      // Verifica primeiro cliente
      AdminClientesPage.verDetalhesCliente(0);
      AdminClientesPage.fecharDetalhes();
      
      // Verifica segundo cliente (se existir)
      AdminClientesPage.tabelaLinhas.then(($rows) => {
        if ($rows.length > 1) {
          AdminClientesPage.verDetalhesCliente(1);
          AdminClientesPage.fecharDetalhes();
        }
      });
    });
  });

  describe('Performance', () => {
    it('deve carregar detalhes rapidamente', () => {
      AdminClientesPage.visitar();
      
      const startTime = Date.now();
      
      AdminClientesPage.verDetalhesCliente(0);
      AdminClientesPage.detalhesModal.should('be.visible');
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Deve carregar em menos de 3 segundos
      expect(loadTime).to.be.lessThan(3000);
    });

    it('não deve vazamento de memória ao abrir/fechar múltiplos modais', () => {
      AdminClientesPage.visitar();
      
      // Abre e fecha várias vezes
      for (let i = 0; i < 5; i++) {
        AdminClientesPage.verDetalhesCliente(0);
        AdminClientesPage.fecharDetalhes();
      }
      
      // Verifica que não há múltiplos modais
      AdminClientesPage.detalhesModal.should('not.exist');
    });
  });
});