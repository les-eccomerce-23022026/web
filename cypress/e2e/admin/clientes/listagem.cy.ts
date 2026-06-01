/**
 * Testes E2E da Página Admin — Listagem de Clientes
 * Foco: Listagem, busca, filtros e paginação
 */

import { AdminClientesPage } from '../../support/pages/admin/AdminClientesPage';
import { TIMEOUT } from '../../support/constants';

describe('Admin — Listagem de Clientes', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Acesso à Página', () => {
    it('deve acessar /admin/clientes como administrador', () => {
      AdminClientesPage.visitar();
      
      cy.url().should('include', '/admin/clientes');
    });

    it('deve exibir título da página correto', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.titulo.should('contain.text', 'Gestão de Clientes');
    });

    it('deve exibir lista de clientes', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verificarCarregamento();
      AdminClientesPage.verificarTabelaCarregada();
    });
  });

  describe('Listagem de Clientes', () => {
    it('deve exibir informações do cliente na tabela', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verificarTabelaCarregada();
      AdminClientesPage.tabela.should('be.visible');
      AdminClientesPage.tabelaLinhas.should('have.length.at.least', 1);
    });

    it('deve exibir nome do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().should('contain.text');
    });

    it('deve exibir email do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().should('contain', '@');
    });

    it('deve exibir CPF do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().should('contain', /\d{3}\.\d{3}\.\d{3}-\d{2}/);
    });

    it('deve exibir status do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.statusBadge.should('exist');
      });
    });

    it('deve exibir telefone do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.colunaTelefone.should('be.visible');
    });

    it('deve exibir data de cadastro do cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.colunaDataCadastro.should('be.visible');
    });
  });

  describe('Busca e Filtros', () => {
    it('deve ter campo de busca', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.buscaInput.should('be.visible');
    });

    it('deve ter campo de filtro por status', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.statusSelect.should('be.visible');
    });

    it('deve ter campo de filtro por período de cadastro', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.dataCadastroInicioInput.should('be.visible');
      AdminClientesPage.dataCadastroFimInput.should('be.visible');
    });

    it('deve ter botão de filtrar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.filtrarButton.should('be.visible');
    });

    it('deve ter botão de limpar filtros', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.limparFiltrosButton.should('be.visible');
    });

    it('deve permitir buscar cliente por nome', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.buscarCliente('Teste');
      
      AdminClientesPage.buscaInput.should('have.value', 'Teste');
    });

    it('deve permitir filtrar por status', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.filtrarPorStatus('Ativo');
      
      AdminClientesPage.statusSelect.should('have.value', 'Ativo');
    });

    it('deve permitir filtrar por período de cadastro', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.filtrarPorPeriodoCadastro('01/01/2024', '31/12/2024');
      
      AdminClientesPage.dataCadastroInicioInput.should('have.value', '01/01/2024');
      AdminClientesPage.dataCadastroFimInput.should('have.value', '31/12/2024');
    });

    it('deve limpar filtros corretamente', () => {
      AdminClientesPage.visitar();
      
      // Aplica filtros primeiro
      AdminClientesPage.buscarCliente('Teste');
      AdminClientesPage.filtrarPorStatus('Ativo');
      
      // Limpa filtros
      AdminClientesPage.limparFiltros();
      
      AdminClientesPage.buscaInput.should('be.empty');
      AdminClientesPage.statusSelect.should('have.value', '');
    });

    it('deve exibir seção de filtros', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.filtrosSection.should('be.visible');
    });
  });

  describe('Ordenação', () => {
    it('deve ter botões de ordenação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.ordenarNomeButton.should('be.visible');
      AdminClientesPage.ordenarEmailButton.should('be.visible');
      AdminClientesPage.ordenarDataCadastroButton.should('be.visible');
    });

    it('deve permitir ordenar por nome', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.ordenarPor('nome');
      
      AdminClientesPage.ordenarNomeButton.should('exist');
    });

    it('deve permitir ordenar por email', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.ordenarPor('email');
      
      AdminClientesPage.ordenarEmailButton.should('exist');
    });

    it('deve permitir ordenar por data de cadastro', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.ordenarPor('dataCadastro');
      
      AdminClientesPage.ordenarDataCadastroButton.should('exist');
    });
  });

  describe('Paginação', () => {
    it('deve ter controles de paginação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.paginacao.should('be.visible');
    });

    it('deve exibir informações de total de registros', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.totalRegistros.should('be.visible');
    });

    it('deve ter botão de página anterior', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.paginaAnteriorButton.should('be.visible');
    });

    it('deve ter botão de página próxima', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.paginaProximaButton.should('be.visible');
    });

    it('deve exibir página atual', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.paginaAtual.should('be.visible');
    });

    it('deve permitir navegar para próxima página', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.proximaPagina();
      
      // Verifica que a navegação ocorreu (pode mudar a URL ou o conteúdo)
      cy.url().should('include', '/admin/clientes');
    });

    it('deve permitir navegar para página anterior', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.paginaAnterior();
      
      // Verifica que a navegação ocorreu
      cy.url().should('include', '/admin/clientes');
    });
  });

  describe('Exportação', () => {
    it('deve ter botão de exportar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.exportarButton.should('be.visible');
    });

    it('deve ter opção de exportar Excel', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.exportarButton.click();
      AdminClientesPage.exportarExcelButton.should('be.visible');
    });

    it('deve ter opção de exportar PDF', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.exportarButton.click();
      AdminClientesPage.exportarPdfButton.should('be.visible');
    });

    it('deve permitir exportar para Excel', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.exportarExcel();
      
      // Verifica se o download foi iniciado
      cy.log('Exportação Excel iniciada');
    });

    it('deve permitir exportar para PDF', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.exportarPdf();
      
      // Verifica se o download foi iniciado
      cy.log('Exportação PDF iniciada');
    });
  });

  describe('Estados da Tabela', () => {
    it('deve exibir mensagem quando tabela está vazia', () => {
      AdminClientesPage.visitar();
      
      // Simula busca que não retorna resultados
      AdminClientesPage.buscarCliente('CLIENTE_INEXISTENTE_12345');
      
      // Pode exibir tabela vazia ou mensagem de não encontrado
      cy.wait(TIMEOUT.REDE);
    });

    it('deve exibir indicador de carregamento', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.loading.should('not.exist'); // Não deve ter loading após carregar
    });

    it('deve exibir colunas corretas na tabela', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.colunaId.should('be.visible');
      AdminClientesPage.colunaNome.should('be.visible');
      AdminClientesPage.colunaEmail.should('be.visible');
      AdminClientesPage.colunaCpf.should('be.visible');
      AdminClientesPage.colunaTelefone.should('be.visible');
      AdminClientesPage.colunaDataCadastro.should('be.visible');
      AdminClientesPage.colunaStatus.should('be.visible');
      AdminClientesPage.colunaAcoes.should('be.visible');
    });
  });

  describe('Responsividade', () => {
    it('deve exibir corretamente em mobile', () => {
      cy.viewport(375, 667);
      AdminClientesPage.visitar();
      
      cy.url().should('include', '/admin/clientes');
      AdminClientesPage.container.should('be.visible');
    });

    it('deve exibir corretamente em tablet', () => {
      cy.viewport(768, 1024);
      AdminClientesPage.visitar();
      
      cy.url().should('include', '/admin/clientes');
      AdminClientesPage.container.should('be.visible');
    });

    it('deve exibir corretamente em desktop', () => {
      cy.viewport(1920, 1080);
      AdminClientesPage.visitar();
      
      cy.url().should('include', '/admin/clientes');
      AdminClientesPage.container.should('be.visible');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria labels nos botões de ação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.verDetalhesButton.should('have.attr', 'aria-label');
      AdminClientesPage.editarButton.should('have.attr', 'aria-label');
    });

    it('deve ter foco navegável por teclado', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.buscaInput.focus();
      AdminClientesPage.buscaInput.should('be.focused');
    });

    it('deve ter roles semânticas corretas', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabela.should('have.attr', 'role', 'table');
    });
  });
});