/**
 * Page Object para Catálogo de Livros
 * Centraliza todos os seletores e ações do catálogo
 */

export class CatalogoPage {
  // Seletores principais
  static get container() {
    return cy.getDataCy('catalogo-container');
  }

  static get titulo() {
    return cy.getDataCy('catalogo-titulo');
  }

  // Busca e Filtros
  static get buscaSection() {
    return cy.getDataCy('catalogo-busca-section');
  }

  static get buscaInput() {
    return cy.getDataCy('catalogo-busca-input');
  }

  static get buscaButton() {
    return cy.getDataCy('catalogo-busca-button');
  }

  static get filtrosSection() {
    return cy.getDataCy('catalogo-filtros-section');
  }

  static get categoriaSelect() {
    return cy.getDataCy('catalogo-categoria-select');
  }

  static get precoMinInput() {
    return cy.getDataCy('catalogo-preco-min');
  }

  static get precoMaxInput() {
    return cy.getDataCy('catalogo-preco-max');
  }

  static get autorSelect() {
    return cy.getDataCy('catalogo-autor-select');
  }

  static get editoraSelect() {
    return cy.getDataCy('catalogo-editora-select');
  }

  static get ordenarSelect() {
    return cy.getDataCy('catalogo-ordenar-select');
  }

  static get aplicarFiltrosButton() {
    return cy.getDataCy('catalogo-aplicar-filtros');
  }

  static get limparFiltrosButton() {
    return cy.getDataCy('catalogo-limpar-filtros');
  }

  // Grid de Livros
  static get livrosGrid() {
    return cy.getDataCy('catalogo-livros-grid');
  }

  static get livroCard() {
    return cy.getDataCy('catalogo-livro-card');
  }

  static get livrosCards() {
    return cy.getDataCy('catalogo-livro-card-multiple');
  }

  static get livrosVazio() {
    return cy.getDataCy('catalogo-livros-vazio');
  }

  static get livrosVazioMensagem() {
    return cy.getDataCy('catalogo-livros-vazio-mensagem');
  }

  // Card Individual
  static get livroImagem() {
    return cy.getDataCy('catalogo-livro-imagem');
  }

  static get livroTitulo() {
    return cy.getDataCy('catalogo-livro-titulo');
  }

  static get livroAutor() {
    return cy.getDataCy('catalogo-livro-autor');
  }

  static get livroPreco() {
    return cy.getDataCy('catalogo-livro-preco');
  }

  static get livroPrecoAntigo() {
    return cy.getDataCy('catalogo-livro-preco-antigo');
  }

  static get livroDesconto() {
    return cy.getDataCy('catalogo-livro-desconto');
  }

  static get livroRating() {
    return cy.getDataCy('catalogo-livro-rating');
  }

  static get livroAvaliacoes() {
    return cy.getDataCy('catalogo-livro-avaliacoes');
  }

  static get livroAdicionarCarrinhoButton() {
    return cy.getDataCy('catalogo-livro-adicionar-carrinho');
  }

  static get livroVerDetalhesButton() {
    return cy.getDataCy('catalogo-livro-ver-detalhes');
  }

  static get livroFavoritoButton() {
    return cy.getDataCy('catalogo-livro-favorito');
  }

  static get livroFavoritoAtivo() {
    return cy.getDataCy('catalogo-livro-favorito-ativo');
  }

  // Paginação
  static get paginacao() {
    return cy.getDataCy('catalogo-paginacao');
  }

  static get paginaAnteriorButton() {
    return cy.getDataCy('catalogo-pagina-anterior');
  }

  static get paginaProximaButton() {
    return cy.getDataCy('catalogo-pagina-proxima');
  }

  static get paginaAtual() {
    return cy.getDataCy('catalogo-pagina-atual');
  }

  static get totalPaginas() {
    return cy.getDataCy('catalogo-total-paginas');
  }

  static get totalResultados() {
    return cy.getDataCy('catalogo-total-resultados');
  }

  // Seções Especiais
  static get maisVendidosSection() {
    return cy.getDataCy('catalogo-mais-vendidos-section');
  }

  static get lancamentosSection() {
    return cy.getDataCy('catalogo-lancamentos-section');
  }

  static get promocoesSection() {
    return cy.getDataCy('catalogo-promocoes-section');
  }

  static get categoriasSection() {
    return cy.getDataCy('catalogo-categorias-section');
  }

  // Mensagens
  static get mensagemSucesso() {
    return cy.getDataCy('catalogo-mensagem-sucesso');
  }

  static get mensagemErro() {
    return cy.getDataCy('catalogo-mensagem-erro');
  }

  static get loading() {
    return cy.getDataCy('catalogo-loading');
  }

  // Métodos de Ação
  static visitar() {
    cy.visit('/catalogo');
    this.container.should('be.visible');
  }

  static buscarLivro(termo: string) {
    this.buscaInput.clear().type(termo);
    this.buscaButton.click();
  }

  static filtrarPorCategoria(categoria: string) {
    this.categoriaSelect.select(categoria);
    this.aplicarFiltrosButton.click();
  }

  static filtrarPorPreco(precoMin: string, precoMax: string) {
    this.precoMinInput.clear().type(precoMin);
    this.precoMaxInput.clear().type(precoMax);
    this.aplicarFiltrosButton.click();
  }

  static filtrarPorAutor(autor: string) {
    this.autorSelect.select(autor);
    this.aplicarFiltrosButton.click();
  }

  static filtrarPorEditora(editora: string) {
    this.editoraSelect.select(editora);
    this.aplicarFiltrosButton.click();
  }

  static ordenarPor(ordenacao: string) {
    this.ordenarSelect.select(ordenacao);
    this.aplicarFiltrosButton.click();
  }

  static limparFiltros() {
    this.limparFiltrosButton.click();
    this.buscaInput.should('be.empty');
    this.categoriaSelect.should('have.value', '');
    this.precoMinInput.should('be.empty');
    this.precoMaxInput.should('be.empty');
  }

  static adicionarAoCarrinho(indiceLivro: number = 0) {
    this.livrosCards.eq(indiceLivro).within(() => {
      this.livroAdicionarCarrinhoButton.click();
    });
  }

  static verDetalhesLivro(indiceLivro: number = 0) {
    this.livrosCards.eq(indiceLivro).within(() => {
      this.livroVerDetalhesButton.click();
    });
  }

  static adicionarAosFavoritos(indiceLivro: number = 0) {
    this.livrosCards.eq(indiceLivro).within(() => {
      this.livroFavoritoButton.click();
    });
  }

  static removerDosFavoritos(indiceLivro: number = 0) {
    this.livrosCards.eq(indiceLivro).within(() => {
      this.livroFavoritoAtivo.click();
    });
  }

  static proximaPagina() {
    this.paginaProximaButton.click();
  }

  static paginaAnterior() {
    this.paginaAnteriorButton.click();
  }

  // Métodos de Verificação
  static verificarCarregamento() {
    this.container.should('be.visible');
    this.titulo.should('contain.text', 'Catálogo de Livros');
  }

  static verificarLivrosCarregados() {
    this.livrosGrid.should('be.visible');
    this.livrosCards.should('have.length.greaterThan', 0);
  }

  static verificarCatalogoVazio() {
    this.livrosVazio.should('be.visible');
    this.livrosVazioMensagem.should('be.visible');
    this.livrosCards.should('not.exist');
  }

  static verificarLivroNoCatalogo(indiceLivro: number, dadosLivro: {
    titulo?: string;
    autor?: string;
    preco?: string;
    precoAntigo?: string;
    desconto?: string;
    rating?: string;
    avaliacoes?: string;
  }) {
    this.livrosCards.eq(indiceLivro).within(() => {
      if (dadosLivro.titulo) {
        this.livroTitulo.should('contain.text', dadosLivro.titulo);
      }
      if (dadosLivro.autor) {
        this.livroAutor.should('contain.text', dadosLivro.autor);
      }
      if (dadosLivro.preco) {
        this.livroPreco.should('contain.text', dadosLivro.preco);
      }
      if (dadosLivro.precoAntigo) {
        this.livroPrecoAntigo.should('contain.text', dadosLivro.precoAntigo);
      }
      if (dadosLivro.desconto) {
        this.livroDesconto.should('contain.text', dadosLivro.desconto);
      }
      if (dadosLivro.rating) {
        this.livroRating.should('contain.text', dadosLivro.rating);
      }
      if (dadosLivro.avaliacoes) {
        this.livroAvaliacoes.should('contain.text', dadosLivro.avaliacoes);
      }
    });
  }

  static verificarFavoritoAtivo(indiceLivro: number, ativo: boolean = true) {
    this.livrosCards.eq(indiceLivro).within(() => {
      if (ativo) {
        this.livroFavoritoAtivo.should('exist');
      } else {
        this.livroFavoritoButton.should('exist');
        this.livroFavoritoAtivo.should('not.exist');
      }
    });
  }

  static verificarPaginacao(paginaAtual: number, totalPaginas: number, totalResultados: number) {
    this.paginaAtual.should('contain.text', paginaAtual.toString());
    this.totalPaginas.should('contain.text', totalPaginas.toString());
    this.totalResultados.should('contain.text', totalResultados.toString());
  }

  static verificarFiltrosAplicados(filtros: {
    busca?: string;
    categoria?: string;
    precoMin?: string;
    precoMax?: string;
    autor?: string;
    editora?: string;
    ordenacao?: string;
  }) {
    if (filtros.busca) {
      this.buscaInput.should('have.value', filtros.busca);
    }
    if (filtros.categoria) {
      this.categoriaSelect.should('have.value', filtros.categoria);
    }
    if (filtros.precoMin) {
      this.precoMinInput.should('have.value', filtros.precoMin);
    }
    if (filtros.precoMax) {
      this.precoMaxInput.should('have.value', filtros.precoMax);
    }
    if (filtros.autor) {
      this.autorSelect.should('have.value', filtros.autor);
    }
    if (filtros.editora) {
      this.editoraSelect.should('have.value', filtros.editora);
    }
    if (filtros.ordenacao) {
      this.ordenarSelect.should('have.value', filtros.ordenacao);
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

  // Métodos de Cálculo
  static contarLivrosNoCatalogo(): Cypress.Chainable<number> {
    return this.livrosCards.its('length');
  }

  static contarLivrosComDesconto(): number {
    let count = 0;
    this.livroDesconto.each($desconto => {
      if ($desconto.length > 0) {
        count++;
      }
    });
    return count;
  }

  static obterPrecosDosLivros(): Cypress.Chainable<number[]> {
    const precos: number[] = [];
    
    return this.livroPreco.each($preco => {
      const precoTexto = $preco.text().replace('R$', '').replace('.', '').replace(',', '.').trim();
      const preco = parseFloat(precoTexto);
      if (!isNaN(preco)) {
        precos.push(preco);
      }
    }).then(() => {
      return cy.wrap(precos);
    });
  }

  static obterDadosLivro(indiceLivro: number): Cypress.Chainable<any> {
    const dados: any = {};
    
    return this.livrosCards.eq(indiceLivro).within(() => {
      this.livroTitulo.should('exist').then($titulo => {
        dados.titulo = $titulo.text();
      });
      this.livroAutor.should('exist').then($autor => {
        dados.autor = $autor.text();
      });
      this.livroPreco.should('exist').then($preco => {
        dados.preco = $preco.text();
      });
      this.livroRating.should('exist').then($rating => {
        dados.rating = $rating.text();
      });
      
      return cy.wrap(dados);
    });
  }

  // Métodos de Fluxo Completo
  static buscarEVerificar(termo: string, resultadosEsperados: number) {
    this.buscarLivro(termo);
    this.verificarLivrosCarregados();
    this.contarLivrosNoCatalogo().should('be.gte', resultadosEsperados);
  }

  static filtrarEVerificar(filtros: any, resultadosEsperados: number) {
    this.filtrarPorCategoria(filtros.categoria);
    this.verificarFiltrosAplicados(filtros);
    this.verificarLivrosCarregados();
    this.contarLivrosNoCatalogo().should('be.gte', resultadosEsperados);
  }

  static adicionarAoCarrinhoEVerificar(indiceLivro: number = 0) {
    this.adicionarAoCarrinho(indiceLivro);
    this.verificarMensagemSucesso('Livro adicionado ao carrinho');
  }

  // Métodos de Debug
  static logEstadoCatalogo() {
    cy.log('=== ESTADO DO CATÁLOGO ===');
    this.container.should('exist');
    
    this.livrosCards.should('exist').then($livros => {
      cy.log(`Total de livros no catálogo: ${$livros.length}`);
    });

    this.livrosCards.each(($livro, index) => {
      cy.wrap($livro).find('[data-cy="catalogo-livro-titulo"]').then($titulo => {
        cy.log(`Livro ${index + 1}: ${$titulo.text()}`);
      });
      
      cy.wrap($livro).find('[data-cy="catalogo-livro-preco"]').then($preco => {
        cy.log(`  Preço: ${$preco.text()}`);
      });
    });

    this.totalResultados.should('exist').then($total => {
      cy.log(`Total de resultados: ${$total.text()}`);
    });
  }

  static aguardarCarregamentoCatalogo() {
    this.loading.should('not.exist');
    this.livrosGrid.should('be.visible');
  }

  // Métodos de Validação de Ordenação
  static verificarOrdenacaoPorPreco(ordem: 'asc' | 'desc') {
    this.obterPrecosDosLivros().then(precos => {
      const precosOrdenados = [...precos].sort((a, b) => ordem === 'asc' ? a - b : b - a);
      expect(precos).to.deep.equal(precosOrdenados);
    });
  }

  static verificarOrdenacaoPorTitulo(ordem: 'asc' | 'desc') {
    const titulos: string[] = [];
    this.livroTitulo.each($titulo => {
      titulos.push($titulo.text());
    }).then(() => {
      const titulosOrdenados = [...titulos].sort((a, b) => {
        const comparacao = a.localeCompare(b, 'pt-BR');
        return ordem === 'asc' ? comparacao : -comparacao;
      });
      
      expect(titulos).to.deep.equal(titulosOrdenados);
    });
  }
}