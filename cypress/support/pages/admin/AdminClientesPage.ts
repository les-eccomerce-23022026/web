/**
 * Page Object para Admin Clientes
 * Centraliza todos os seletores e ações da gestão de clientes no painel administrativo
 */

export class AdminClientesPage {
  // Seletores principais
  static get container() {
    return cy.getDataCy('admin-clientes-container');
  }

  static get titulo() {
    return cy.getDataCy('admin-clientes-titulo');
  }

  // Filtros e Busca
  static get filtrosSection() {
    return cy.getDataCy('admin-clientes-filtros-section');
  }

  static get buscaInput() {
    return cy.getDataCy('admin-clientes-busca-input');
  }

  static get statusSelect() {
    return cy.getDataCy('admin-clientes-status-select');
  }

  static get dataCadastroInicioInput() {
    return cy.getDataCy('admin-clientes-data-cadastro-inicio');
  }

  static get dataCadastroFimInput() {
    return cy.getDataCy('admin-clientes-data-cadastro-fim');
  }

  static get filtrarButton() {
    return cy.getDataCy('admin-clientes-filtrar-button');
  }

  static get limparFiltrosButton() {
    return cy.getDataCy('admin-clientes-limpar-filtros-button');
  }

  // Tabela de Clientes
  static get tabela() {
    return cy.getDataCy('admin-clientes-tabela');
  }

  static get tabelaLinhas() {
    return cy.getDataCy('admin-clientes-tabela-linha');
  }

  static get tabelaVazia() {
    return cy.getDataCy('admin-clientes-tabela-vazia');
  }

  // Colunas da Tabela
  static get colunaId() {
    return cy.getDataCy('admin-clientes-coluna-id');
  }

  static get colunaNome() {
    return cy.getDataCy('admin-clientes-coluna-nome');
  }

  static get colunaEmail() {
    return cy.getDataCy('admin-clientes-coluna-email');
  }

  static get colunaCpf() {
    return cy.getDataCy('admin-clientes-coluna-cpf');
  }

  static get colunaTelefone() {
    return cy.getDataCy('admin-clientes-coluna-telefone');
  }

  static get colunaDataCadastro() {
    return cy.getDataCy('admin-clientes-coluna-data-cadastro');
  }

  static get colunaStatus() {
    return cy.getDataCy('admin-clientes-coluna-status');
  }

  static get colunaAcoes() {
    return cy.getDataCy('admin-clientes-coluna-acoes');
  }

  // Ordenação
  static get ordenarNomeButton() {
    return cy.getDataCy('admin-clientes-ordenar-nome');
  }

  static get ordenarEmailButton() {
    return cy.getDataCy('admin-clientes-ordenar-email');
  }

  static get ordenarDataCadastroButton() {
    return cy.getDataCy('admin-clientes-ordenar-data-cadastro');
  }

  // Ações por Cliente
  static get verDetalhesButton() {
    return cy.getDataCy('admin-clientes-ver-detalhes');
  }

  static get editarButton() {
    return cy.getDataCy('admin-clientes-editar');
  }

  static get inativarButton() {
    return cy.getDataCy('admin-clientes-inativar');
  }

  static get reativarButton() {
    return cy.getDataCy('admin-clientes-reativar');
  }

  static get verPedidosButton() {
    return cy.getDataCy('admin-clientes-ver-pedidos');
  }

  static get resetarSenhaButton() {
    return cy.getDataCy('admin-clientes-resetar-senha');
  }

  // Modal de Detalhes
  static get detalhesModal() {
    return cy.getDataCy('admin-clientes-detalhes-modal');
  }

  static get detalhesFecharButton() {
    return cy.getDataCy('admin-clientes-detalhes-fechar');
  }

  static get detalhesClienteId() {
    return cy.getDataCy('admin-clientes-detalhes-id');
  }

  static get detalhesNome() {
    return cy.getDataCy('admin-clientes-detalhes-nome');
  }

  static get detalhesEmail() {
    return cy.getDataCy('admin-clientes-detalhes-email');
  }

  static get detalhesCpf() {
    return cy.getDataCy('admin-clientes-detalhes-cpf');
  }

  static get detalhesTelefone() {
    return cy.getDataCy('admin-clientes-detalhes-telefone');
  }

  static get detalhesDataNascimento() {
    return cy.getDataCy('admin-clientes-detalhes-data-nascimento');
  }

  static get detalhesGenero() {
    return cy.getDataCy('admin-clientes-detalhes-genero');
  }

  static get detalhesEndereco() {
    return cy.getDataCy('admin-clientes-detalhes-endereco');
  }

  static get detalhesDataCadastro() {
    return cy.getDataCy('admin-clientes-detalhes-data-cadastro');
  }

  static get detalhesStatus() {
    return cy.getDataCy('admin-clientes-detalhes-status');
  }

  static get detalhesUltimoLogin() {
    return cy.getDataCy('admin-clientes-detalhes-ultimo-login');
  }

  static get detalhesTotalPedidos() {
    return cy.getDataCy('admin-clientes-detalhes-total-pedidos');
  }

  static get detalhesValorTotalCompras() {
    return cy.getDataCy('admin-clientes-detalhes-valor-total-compras');
  }

  // Modal de Edição
  static get edicaoModal() {
    return cy.getDataCy('admin-clientes-edicao-modal');
  }

  static get edicaoNomeInput() {
    return cy.getDataCy('admin-clientes-edicao-nome');
  }

  static get edicaoEmailInput() {
    return cy.getDataCy('admin-clientes-edicao-email');
  }

  static get edicaoTelefoneInput() {
    return cy.getDataCy('admin-clientes-edicao-telefone');
  }

  static get edicaoDataNascimentoInput() {
    return cy.getDataCy('admin-clientes-edicao-data-nascimento');
  }

  static get edicaoGeneroSelect() {
    return cy.getDataCy('admin-clientes-edicao-genero');
  }

  static get edicaoSalvarButton() {
    return cy.getDataCy('admin-clientes-edicao-salvar');
  }

  static get edicaoCancelarButton() {
    return cy.getDataCy('admin-clientes-edicao-cancelar');
  }

  // Modal de Inativação
  static get inativacaoModal() {
    return cy.getDataCy('admin-clientes-inativacao-modal');
  }

  static get inativacaoMotivoTextarea() {
    return cy.getDataCy('admin-clientes-inativacao-motivo');
  }

  static get inativacaoConfirmarButton() {
    return cy.getDataCy('admin-clientes-inativacao-confirmar');
  }

  static get inativacaoCancelarButton() {
    return cy.getDataCy('admin-clientes-inativacao-cancelar');
  }

  // Modal de Reset de Senha
  static get resetSenhaModal() {
    return cy.getDataCy('admin-clientes-reset-senha-modal');
  }

  static get resetSenhaNovaSenhaInput() {
    return cy.getDataCy('admin-clientes-reset-senha-nova');
  }

  static get resetSenhaConfirmarSenhaInput() {
    return cy.getDataCy('admin-clientes-reset-senha-confirmar');
  }

  static get resetSenhaConfirmarButton() {
    return cy.getDataCy('admin-clientes-reset-senha-confirmar-button');
  }

  static get resetSenhaCancelarButton() {
    return cy.getDataCy('admin-clientes-reset-senha-cancelar');
  }

  // Status Badge
  static get statusBadge() {
    return cy.getDataCy('admin-clientes-status-badge');
  }

  static get statusAtivo() {
    return cy.getDataCy('admin-clientes-status-ativo');
  }

  static get statusInativo() {
    return cy.getDataCy('admin-clientes-status-inativo');
  }

  static get statusPendente() {
    return cy.getDataCy('admin-clientes-status-pendente');
  }

  static get statusBloqueado() {
    return cy.getDataCy('admin-clientes-status-bloqueado');
  }

  // Paginação
  static get paginacao() {
    return cy.getDataCy('admin-clientes-paginacao');
  }

  static get paginaAnteriorButton() {
    return cy.getDataCy('admin-clientes-pagina-anterior');
  }

  static get paginaProximaButton() {
    return cy.getDataCy('admin-clientes-pagina-proxima');
  }

  static get paginaAtual() {
    return cy.getDataCy('admin-clientes-pagina-atual');
  }

  static get totalRegistros() {
    return cy.getDataCy('admin-clientes-total-registros');
  }

  // Exportação
  static get exportarButton() {
    return cy.getDataCy('admin-clientes-exportar');
  }

  static get exportarExcelButton() {
    return cy.getDataCy('admin-clientes-exportar-excel');
  }

  static get exportarPdfButton() {
    return cy.getDataCy('admin-clientes-exportar-pdf');
  }

  // Mensagens
  static get mensagemSucesso() {
    return cy.getDataCy('admin-clientes-mensagem-sucesso');
  }

  static get mensagemErro() {
    return cy.getDataCy('admin-clientes-mensagem-erro');
  }

  static get loading() {
    return cy.getDataCy('admin-clientes-loading');
  }

  // Métodos de Ação
  static visitar() {
    cy.visit('/admin/clientes');
    this.container.should('be.visible');
  }

  static buscarCliente(termo: string) {
    this.buscaInput.clear().type(termo);
    this.filtrarButton.click();
  }

  static filtrarPorStatus(status: string) {
    this.statusSelect.select(status);
    this.filtrarButton.click();
  }

  static filtrarPorPeriodoCadastro(dataInicio: string, dataFim: string) {
    this.dataCadastroInicioInput.type(dataInicio);
    this.dataCadastroFimInput.type(dataFim);
    this.filtrarButton.click();
  }

  static limparFiltros() {
    this.limparFiltrosButton.click();
    this.buscaInput.should('be.empty');
    this.statusSelect.should('have.value', '');
  }

  static ordenarPor(coluna: 'nome' | 'email' | 'dataCadastro') {
    switch (coluna) {
      case 'nome':
        this.ordenarNomeButton.click();
        break;
      case 'email':
        this.ordenarEmailButton.click();
        break;
      case 'dataCadastro':
        this.ordenarDataCadastroButton.click();
        break;
    }
  }

  static verDetalhesCliente(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.verDetalhesButton.click();
    });
    this.detalhesModal.should('be.visible');
  }

  static fecharDetalhes() {
    this.detalhesFecharButton.click();
    this.detalhesModal.should('not.exist');
  }

  static editarCliente(indiceLinha: number = 0, dadosEdicao?: {
    nome?: string;
    email?: string;
    telefone?: string;
    dataNascimento?: string;
    genero?: string;
  }) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.editarButton.click();
    });
    this.edicaoModal.should('be.visible');

    if (dadosEdicao) {
      if (dadosEdicao.nome) {
        this.edicaoNomeInput.clear().type(dadosEdicao.nome);
      }
      if (dadosEdicao.email) {
        this.edicaoEmailInput.clear().type(dadosEdicao.email);
      }
      if (dadosEdicao.telefone) {
        this.edicaoTelefoneInput.clear().type(dadosEdicao.telefone);
      }
      if (dadosEdicao.dataNascimento) {
        this.edicaoDataNascimentoInput.type(dadosEdicao.dataNascimento);
      }
      if (dadosEdicao.genero) {
        this.edicaoGeneroSelect.select(dadosEdicao.genero);
      }
    }

    this.edicaoSalvarButton.click();
    this.edicaoModal.should('not.exist');
  }

  static inativarCliente(indiceLinha: number = 0, motivo?: string) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.inativarButton.click();
    });
    this.inativacaoModal.should('be.visible');

    if (motivo) {
      this.inativacaoMotivoTextarea.clear().type(motivo);
    }

    this.inativacaoConfirmarButton.click();
    this.inativacaoModal.should('not.exist');
  }

  static reativarCliente(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.reativarButton.click();
    });
    // Confirmação pode ser imediata ou ter modal
    this.mensagemSucesso.should('be.visible');
  }

  static resetarSenhaCliente(indiceLinha: number = 0, novaSenha?: string, confirmarSenha?: string) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.resetarSenhaButton.click();
    });
    this.resetSenhaModal.should('be.visible');

    if (novaSenha) {
      this.resetSenhaNovaSenhaInput.clear().type(novaSenha);
    }
    if (confirmarSenha) {
      this.resetSenhaConfirmarSenhaInput.clear().type(confirmarSenha);
    }

    this.resetSenhaConfirmarButton.click();
    this.resetSenhaModal.should('not.exist');
  }

  static verPedidosCliente(indiceLinha: number = 0) {
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.verPedidosButton.click();
    });
    // Redireciona para página de pedidos do cliente
    cy.url().should('include', '/admin/pedidos?cliente=');
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
    this.titulo.should('contain.text', 'Gestão de Clientes');
  }

  static verificarTabelaCarregada() {
    this.tabela.should('be.visible');
    this.tabelaLinhas.should('have.length.greaterThan', 0);
  }

  static verificarTabelaVazia() {
    this.tabelaVazia.should('be.visible');
    this.tabelaLinhas.should('not.exist');
  }

  static verificarClienteNaTabela(dadosCliente: {
    id?: string;
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    status?: string;
  }) {
    this.tabelaLinhas.should('contain.text', dadosCliente.id || '');
    this.tabelaLinhas.should('contain.text', dadosCliente.nome || '');
    this.tabelaLinhas.should('contain.text', dadosCliente.email || '');
    this.tabelaLinhas.should('contain.text', dadosCliente.cpf || '');
    this.tabelaLinhas.should('contain.text', dadosCliente.telefone || '');
    this.tabelaLinhas.should('contain.text', dadosCliente.status || '');
  }

  static verificarStatusDoCliente(indiceLinha: number, statusEsperado: string) {
    this.tabelaLinhas.eq(indiceLinha).find(this.statusBadge.selector)
      .should('contain.text', statusEsperado);
  }

  static verificarDetalhesCliente(dadosCliente: {
    id?: string;
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    dataNascimento?: string;
    genero?: string;
    endereco?: string;
    dataCadastro?: string;
    status?: string;
    ultimoLogin?: string;
    totalPedidos?: string;
    valorTotalCompras?: string;
  }) {
    if (dadosCliente.id) {
      this.detalhesClienteId.should('contain.text', dadosCliente.id);
    }
    if (dadosCliente.nome) {
      this.detalhesNome.should('contain.text', dadosCliente.nome);
    }
    if (dadosCliente.email) {
      this.detalhesEmail.should('contain.text', dadosCliente.email);
    }
    if (dadosCliente.cpf) {
      this.detalhesCpf.should('contain.text', dadosCliente.cpf);
    }
    if (dadosCliente.telefone) {
      this.detalhesTelefone.should('contain.text', dadosCliente.telefone);
    }
    if (dadosCliente.dataNascimento) {
      this.detalhesDataNascimento.should('contain.text', dadosCliente.dataNascimento);
    }
    if (dadosCliente.genero) {
      this.detalhesGenero.should('contain.text', dadosCliente.genero);
    }
    if (dadosCliente.endereco) {
      this.detalhesEndereco.should('contain.text', dadosCliente.endereco);
    }
    if (dadosCliente.dataCadastro) {
      this.detalhesDataCadastro.should('contain.text', dadosCliente.dataCadastro);
    }
    if (dadosCliente.status) {
      this.detalhesStatus.should('contain.text', dadosCliente.status);
    }
    if (dadosCliente.ultimoLogin) {
      this.detalhesUltimoLogin.should('contain.text', dadosCliente.ultimoLogin);
    }
    if (dadosCliente.totalPedidos) {
      this.detalhesTotalPedidos.should('contain.text', dadosCliente.totalPedidos);
    }
    if (dadosCliente.valorTotalCompras) {
      this.detalhesValorTotalCompras.should('contain.text', dadosCliente.valorTotalCompras);
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
          case 'editar':
            this.editarButton.should('be.visible');
            break;
          case 'inativar':
            this.inativarButton.should('be.visible');
            break;
          case 'reativar':
            this.reativarButton.should('be.visible');
            break;
          case 'pedidos':
            this.verPedidosButton.should('be.visible');
            break;
          case 'resetar-senha':
            this.resetarSenhaButton.should('be.visible');
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
          case 'editar':
            this.editarButton.should('not.exist');
            break;
          case 'inativar':
            this.inativarButton.should('not.exist');
            break;
          case 'reativar':
            this.reativarButton.should('not.exist');
            break;
          case 'pedidos':
            this.verPedidosButton.should('not.exist');
            break;
          case 'resetar-senha':
            this.resetarSenhaButton.should('not.exist');
            break;
        }
      });
    });
  }

  // Métodos de Debug
  static logEstadoClientes() {
    cy.log('=== ESTADO DOS CLIENTES ===');
    this.container.should('exist');
    
    this.tabelaLinhas.should('exist').then($linhas => {
      cy.log(`Total de clientes na tabela: ${$linhas.length}`);
    });

    this.tabelaLinhas.each(($linha, index) => {
      cy.wrap($linha).find(this.statusBadge.selector).then($status => {
        cy.log(`Cliente ${index + 1}: Status = ${$status.text()}`);
      });
    });
  }

  static contarClientesPorStatus(status: string): number {
    let count = 0;
    this.statusBadge.each($badge => {
      if ($badge.text().includes(status)) {
        count++;
      }
    });
    return count;
  }

  static obterDadosClienteTabela(indiceLinha: number): any {
    const dados: any = {};
    
    this.tabelaLinhas.eq(indiceLinha).within(() => {
      this.colunaNome.should('exist').then($nome => {
        dados.nome = $nome.text();
      });
      this.colunaEmail.should('exist').then($email => {
        dados.email = $email.text();
      });
      this.colunaCpf.should('exist').then($cpf => {
        dados.cpf = $cpf.text();
      });
      this.colunaStatus.should('exist').then($status => {
        dados.status = $status.text();
      });
    });
    
    return dados;
  }
}