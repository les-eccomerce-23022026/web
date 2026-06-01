/**
 * Page Object para Admin Pedidos
 * Centraliza todos os seletores e ações da gestão de pedidos no painel administrativo
 */

export class AdminPedidosPage {
  // Seletores principais
  static get container() {
    return cy.getDataCy('admin-pedidos-container');
  }

  static get titulo() {
    return cy.getDataCy('admin-pedidos-titulo');
  }

  // Filtros e Busca
  static get filtrosSection() {
    return cy.getDataCy('admin-pedidos-filtros-section');
  }

  static get buscaInput() {
    return cy.getDataCy('admin-pedidos-busca-input');
  }

  static get statusSelect() {
    return cy.getDataCy('admin-pedidos-status-select');
  }

  static get dataInicioInput() {
    return cy.getDataCy('admin-pedidos-data-inicio');
  }

  static get dataFimInput() {
    return cy.getDataCy('admin-pedidos-data-fim');
  }

  static get filtrarButton() {
    return cy.getDataCy('admin-pedidos-filtrar-button');
  }

  static get limparFiltrosButton() {
    return cy.getDataCy('admin-pedidos-limpar-filtros-button');
  }

  // Tabela de Pedidos
  static get tabela() {
    return cy.getDataCy('admin-pedidos-tabela');
  }

  static get tabelaLinhas() {
    return cy.getDataCy('admin-pedidos-tabela-linha');
  }

  static get tabelaVazia() {
    return cy.getDataCy('admin-pedidos-tabela-vazia');
  }

  // Colunas da Tabela
  static get colunaId() {
    return cy.getDataCy('admin-pedidos-coluna-id');
  }

  static get colunaCliente() {
    return cy.getDataCy('admin-pedidos-coluna-cliente');
  }

  static get colunaData() {
    return cy.getDataCy('admin-pedidos-coluna-data');
  }

  static get colunaValor() {
    return cy.getDataCy('admin-pedidos-coluna-valor');
  }

  static get colunaStatus() {
    return cy.getDataCy('admin-pedidos-coluna-status');
  }

  static get colunaAcoes() {
    return cy.getDataCy('admin-pedidos-coluna-acoes');
  }

  // Ações por Pedido
  static get verDetalhesButton() {
    return cy.getDataCy('admin-pedidos-ver-detalhes');
  }

  static get despacharButton() {
    return cy.getDataCy('admin-pedidos-despachar');
  }

  static get confirmarEntregaButton() {
    return cy.getDataCy('admin-pedidos-confirmar-entrega');
  }

  static get marcarFalhaButton() {
    return cy.getDataCy('admin-pedidos-marcar-falha');
  }

  static get cancelarButton() {
    return cy.getDataCy('admin-pedidos-cancelar');
  }

  // Modal de Detalhes
  static get detalhesModal() {
    return cy.getDataCy('admin-pedidos-detalhes-modal');
  }

  static get detalhesFecharButton() {
    return cy.getDataCy('admin-pedidos-detalhes-fechar');
  }

  static get detalhesPedidoId() {
    return cy.getDataCy('admin-pedidos-detalhes-id');
  }

  static get detalhesClienteNome() {
    return cy.getDataCy('admin-pedidos-detalhes-cliente-nome');
  }

  static get detalhesClienteEmail() {
    return cy.getDataCy('admin-pedidos-detalhes-cliente-email');
  }

  static get detalhesEndereco() {
    return cy.getDataCy('admin-pedidos-detalhes-endereco');
  }

  static get detalhesItens() {
    return cy.getDataCy('admin-pedidos-detalhes-itens');
  }

  static get detalhesValorTotal() {
    return cy.getDataCy('admin-pedidos-detalhes-valor-total');
  }

  static get detalhesStatus() {
    return cy.getDataCy('admin-pedidos-detalhes-status');
  }

  static get detalhesDataCriacao() {
    return cy.getDataCy('admin-pedidos-detalhes-data-criacao');
  }

  // Modal de Despacho
  static get despachoModal() {
    return cy.getDataCy('admin-pedidos-despacho-modal');
  }

  static get despachoCodigoRastreioInput() {
    return cy.getDataCy('admin-pedidos-despacho-codigo-rastreio');
  }

  static get despachoTransportadoraSelect() {
    return cy.getDataCy('admin-pedidos-despacho-transportadora');
  }

  static get despachoObservacoesTextarea() {
    return cy.getDataCy('admin-pedidos-despacho-observacoes');
  }

  static get despachoConfirmarButton() {
    return cy.getDataCy('admin-pedidos-despacho-confirmar');
  }

  static get despachoCancelarButton() {
    return cy.getDataCy('admin-pedidos-despacho-cancelar');
  }

  // Modal de Falha de Entrega
  static get falhaModal() {
    return cy.getDataCy('admin-pedidos-falha-modal');
  }

  static get falhaMotivoSelect() {
    return cy.getDataCy('admin-pedidos-falha-motivo');
  }

  static get falhaObservacoesTextarea() {
    return cy.getDataCy('admin-pedidos-falha-observacoes');
  }

  static get falhaConfirmarButton() {
    return cy.getDataCy('admin-pedidos-falha-confirmar');
  }

  static get falhaCancelarButton() {
    return cy.getDataCy('admin-pedidos-falha-cancelar');
  }

  // Status Badge
  static get statusBadge() {
    return cy.getDataCy('admin-pedidos-status-badge');
  }

  static get statusPendente() {
    return cy.getDataCy('admin-pedidos-status-pendente');
  }

  static get statusAguardandoPagamento() {
    return cy.getDataCy('admin-pedidos-status-aguardando-pagamento');
  }

  static get statusPago() {
    return cy.getDataCy('admin-pedidos-status-pago');
  }

  static get statusDespachado() {
    return cy.getDataCy('admin-pedidos-status-despachado');
  }

  static get statusEntregue() {
    return cy.getDataCy('admin-pedidos-status-entregue');
  }

  static get statusFalhaEntrega() {
    return cy.getDataCy('admin-pedidos-status-falha-entrega');
  }

  static get statusCancelado() {
    return cy.getDataCy('admin-pedidos-status-cancelado');
  }

  // Paginação
  static get paginacao() {
    return cy.getDataCy('admin-pedidos-paginacao');
  }

  static get paginaAnteriorButton() {
    return cy.getDataCy('admin-pedidos-pagina-anterior');
  }

  static get paginaProximaButton() {
    return cy.getDataCy('admin-pedidos-pagina-proxima');
  }

  static get paginaAtual() {
    return cy.getDataCy('admin-pedidos-pagina-atual');
  }

  static get totalRegistros() {
    return cy.getDataCy('admin-pedidos-total-registros');
  }

  // Exportação
  static get exportarButton() {
    return cy.getDataCy('admin-pedidos-exportar');
  }

  static get exportarExcelButton() {
    return cy.getDataCy('admin-pedidos-exportar-excel');
  }

  static get exportarPdfButton() {
    return cy.getDataCy('admin-pedidos-exportar-pdf');
  }

  // Mensagens
  static get mensagemSucesso() {
    return cy.getDataCy('admin-pedidos-mensagem-sucesso');
  }

  static get mensagemErro() {
    return cy.getDataCy('admin-pedidos-mensagem-erro');
  }

  static get loading() {
    return cy.getDataCy('admin-pedidos-loading');
  }

  // Métodos de Ação
  static visitar() {
    cy.visit('/admin/pedidos');
    this.container.should('be.visible');
  }

  static buscarPedido(termo: string) {
    this.buscaInput.clear().type(termo);
    this.filtrarButton.click();
  }

  static filtrarPorStatus(status: string) {
    this.statusSelect.select(status);
    this.filtrarButton.click();
  }

  static filtrarPorPeriodo(dataInicio: string, dataFim: string) {
    this.dataInicioInput.type(dataInicio);
    this.dataFimInput.type(dataFim);
    this.filtrarButton.click();
  }

  static limparFiltros() {
    this.limparFiltrosButton.click();
    this.buscaInput.should('be.empty');
    this.statusSelect.should('have.value', '');
  }

  static verDetalhesPedido(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.verDetalhesButton.click();
    });
    this.detalhesModal.should('be.visible');
  }

  static fecharDetalhes() {
    this.detalhesFecharButton.click();
    this.detalhesModal.should('not.exist');
  }

  static despacharPedido(indiceLinha: number = 0, dadosDespacho?: {
    codigoRastreio?: string;
    transportadora?: string;
    observacoes?: string;
  }) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.despacharButton.click();
    });
    this.despachoModal.should('be.visible');

    if (dadosDespacho) {
      if (dadosDespacho.codigoRastreio) {
        this.despachoCodigoRastreioInput.clear().type(dadosDespacho.codigoRastreio);
      }
      if (dadosDespacho.transportadora) {
        this.despachoTransportadoraSelect.select(dadosDespacho.transportadora);
      }
      if (dadosDespacho.observacoes) {
        this.despachoObservacoesTextarea.clear().type(dadosDespacho.observacoes);
      }
    }

    this.despachoConfirmarButton.click();
    this.despachoModal.should('not.exist');
  }

  static confirmarEntregaPedido(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.confirmarEntregaButton.click();
    });
    // Confirmação pode ser imediata ou ter modal
    this.mensagemSucesso.should('be.visible');
  }

  static marcarFalhaEntrega(indiceLinha: number = 0, dadosFalha?: {
    motivo?: string;
    observacoes?: string;
  }) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.marcarFalhaButton.click();
    });
    this.falhaModal.should('be.visible');

    if (dadosFalha) {
      if (dadosFalha.motivo) {
        this.falhaMotivoSelect.select(dadosFalha.motivo);
      }
      if (dadosFalha.observacoes) {
        this.falhaObservacoesTextarea.clear().type(dadosFalha.observacoes);
      }
    }

    this.falhaConfirmarButton.click();
    this.falhaModal.should('not.exist');
  }

  static cancelarPedido(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.cancelarButton.click();
    });
    // Confirmação pode ser imediata ou ter modal
    this.mensagemSucesso.should('be.visible');
  }

  static exportarExcel() {
    this.exportarButton.click();
    this.exportarExcelButton.click();
  }

  static exportarPdf() {
    this.exportarButton.click();
    this.exportarPdfButton.click();
  }

  // Métodos de Navegação
  static proximaPagina() {
    this.paginaProximaButton.click();
  }

  static paginaAnterior() {
    this.paginaAnteriorButton.click();
  }

  // Métodos de Verificação
  static verificarCarregamento() {
    this.container.should('be.visible');
    this.titulo.should('contain.text', 'Gestão de Pedidos');
  }

  static verificarTabelaCarregada() {
    this.tabela.should('be.visible');
    this.tabelaLinhas.should('have.length.greaterThan', 0);
  }

  static verificarTabelaVazia() {
    this.tabelaVazia.should('be.visible');
    this.tabelaLinhas.should('not.exist');
  }

  static verificarPedidoNaTabela(dadosPedido: {
    id?: string;
    cliente?: string;
    status?: string;
    valor?: string;
  }) {
    this.tabelaLinhas.should('contain.text', dadosPedido.id || '');
    this.tabelaLinhas.should('contain.text', dadosPedido.cliente || '');
    this.tabelaLinhas.should('contain.text', dadosPedido.status || '');
    this.tabelaLinhas.should('contain.text', dadosPedido.valor || '');
  }

  static verificarStatusDoPedido(indiceLinha: number, statusEsperado: string) {
    this.tabelaLinhas.eq(indiceLinha).find(this.statusBadge.selector)
      .should('contain.text', statusEsperado);
  }

  static verificarDetalhesPedido(dadosPedido: {
    id?: string;
    clienteNome?: string;
    clienteEmail?: string;
    endereco?: string;
    valorTotal?: string;
    status?: string;
  }) {
    if (dadosPedido.id) {
      this.detalhesPedidoId.should('contain.text', dadosPedido.id);
    }
    if (dadosPedido.clienteNome) {
      this.detalhesClienteNome.should('contain.text', dadosPedido.clienteNome);
    }
    if (dadosPedido.clienteEmail) {
      this.detalhesClienteEmail.should('contain.text', dadosPedido.clienteEmail);
    }
    if (dadosPedido.endereco) {
      this.detalhesEndereco.should('contain.text', dadosPedido.endereco);
    }
    if (dadosPedido.valorTotal) {
      this.detalhesValorTotal.should('contain.text', dadosPedido.valorTotal);
    }
    if (dadosPedido.status) {
      this.detalhesStatus.should('contain.text', dadosPedido.status);
    }
  }

  static verificarMensagemSucesso(mensagem?: string) {
    this.mensagemSucesso.should('be.visible');
    if (mensagem) {
      this.mensagemSucesso.should('contain.text', mensagem);
    }
  }

  static verificarMensagemErro(mensagem?: string) {
    this.mensagemErro.should('be.visible');
    if (mensagem) {
      this.mensagemErro.should('contain.text', mensagem);
    }
  }

  static verificarAcoesDisponiveis(indiceLinha: number, acoes: string[]) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      acoes.forEach(acao => {
        switch (acao) {
          case 'detalhes':
            this.verDetalhesButton.should('be.visible');
            break;
          case 'despachar':
            this.despacharButton.should('be.visible');
            break;
          case 'confirmar-entrega':
            this.confirmarEntregaButton.should('be.visible');
            break;
          case 'marcar-falha':
            this.marcarFalhaButton.should('be.visible');
            break;
          case 'cancelar':
            this.cancelarButton.should('be.visible');
            break;
        }
      });
    });
  }

  static verificarAcoesIndisponiveis(indiceLinha: number, acoes: string[]) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      acoes.forEach(acao => {
        switch (acao) {
          case 'detalhes':
            this.verDetalhesButton.should('not.exist');
            break;
          case 'despachar':
            this.despacharButton.should('not.exist');
            break;
          case 'confirmar-entrega':
            this.confirmarEntregaButton.should('not.exist');
            break;
          case 'marcar-falha':
            this.marcarFalhaButton.should('not.exist');
            break;
          case 'cancelar':
            this.cancelarButton.should('not.exist');
            break;
        }
      });
    });
  }

  // Métodos de Debug
  static logEstadoPedidos() {
    cy.log('=== ESTADO DOS PEDIDOS ===');
    this.container.should('exist');
    
    this.tabelaLinhas.should('exist').then($linhas => {
      cy.log(`Total de pedidos na tabela: ${$linhas.length}`);
    });

    this.tabelaLinhas.each(($linha, index) => {
      cy.wrap($linha).find(this.statusBadge.selector).then($status => {
        cy.log(`Pedido ${index + 1}: Status = ${$status.text()}`);
      });
    });
  }

  static contarPedidosPorStatus(status: string): number {
    let count = 0;
    this.statusBadge.each($badge => {
      if ($badge.text().includes(status)) {
        count++;
      }
    });
    return count;
  }
}