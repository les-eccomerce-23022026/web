/**
 * Page Object para Carrinho de Compras
 * Centraliza todos os seletores e ações do carrinho
 */

export class CarrinhoPage {
  // Seletores principais
  static get container() {
    return cy.getDataCy('carrinho-container');
  }

  static get titulo() {
    return cy.getDataCy('carrinho-titulo');
  }

  static get carrinhoVazio() {
    return cy.getDataCy('carrinho-vazio');
  }

  static get carrinhoVazioMensagem() {
    return cy.getDataCy('carrinho-vazio-mensagem');
  }

  static get voltarLojaButton() {
    return cy.getDataCy('carrinho-voltar-loja-button');
  }

  // Lista de Itens
  static get itensList() {
    return cy.getDataCy('carrinho-itens-list');
  }

  static get item() {
    return cy.getDataCy('carrinho-item');
  }

  static get itens() {
    return cy.getDataCy('carrinho-item-multiple');
  }

  // Item Individual
  static get itemNome() {
    return cy.getDataCy('carrinho-item-nome');
  }

  static get itemAutor() {
    return cy.getDataCy('carrinho-item-autor');
  }

  static get itemPrecoUnitario() {
    return cy.getDataCy('carrinho-item-preco-unitario');
  }

  static get itemQuantidadeInput() {
    return cy.getDataCy('carrinho-item-quantidade');
  }

  static get itemQuantidadeDecrease() {
    return cy.getDataCy('carrinho-item-quantidade-decrease');
  }

  static get itemQuantidadeIncrease() {
    return cy.getDataCy('carrinho-item-quantidade-increase');
  }

  static get itemPrecoTotal() {
    return cy.getDataCy('carrinho-item-preco-total');
  }

  static get itemRemoverButton() {
    return cy.getDataCy('carrinho-item-remover');
  }

  // Resumo do Carrinho
  static get resumoSection() {
    return cy.getDataCy('carrinho-resumo-section');
  }

  static get resumoSubtotal() {
    return cy.getDataCy('carrinho-resumo-subtotal');
  }

  static get resumoFrete() {
    return cy.getDataCy('carrinho-resumo-frete');
  }

  static get resumoDesconto() {
    return cy.getDataCy('carrinho-resumo-desconto');
  }

  static get resumoTotal() {
    return cy.getDataCy('carrinho-resumo-total');
  }

  // Cupom de Desconto
  static get cupomSection() {
    return cy.getDataCy('carrinho-cupom-section');
  }

  static get cupomInput() {
    return cy.getDataCy('carrinho-cupom-input');
  }

  static get cupomAplicarButton() {
    return cy.getDataCy('carrinho-cupom-aplicar');
  }

  static get cupomRemoverButton() {
    return cy.getDataCy('carrinho-cupom-remover');
  }

  static get cupomDesconto() {
    return cy.getDataCy('carrinho-cupom-desconto');
  }

  // Cálculo de Frete
  static get freteSection() {
    return cy.getDataCy('carrinho-frete-section');
  }

  static get cepInput() {
    return cy.getDataCy('carrinho-cep-input');
  }

  static get calcularFreteButton() {
    return cy.getDataCy('carrinho-calcular-frete-button');
  }

  static get freteOptions() {
    return cy.getDataCy('carrinho-frete-options');
  }

  static get fretePacRadio() {
    return cy.getDataCy('carrinho-frete-pac');
  }

  static get freteSedexRadio() {
    return cy.getDataCy('carrinho-frete-sedex');
  }

  static get freteValor() {
    return cy.getDataCy('carrinho-frete-valor');
  }

  static get fretePrazo() {
    return cy.getDataCy('carrinho-frete-prazo');
  }

  // Botões de Ação
  static get continuarComprandoButton() {
    return cy.getDataCy('carrinho-continuar-comprando');
  }

  static get finalizarCompraButton() {
    return cy.getDataCy('carrinho-finalizar-compra');
  }

  static get limparCarrinhoButton() {
    return cy.getDataCy('carrinho-limpar');
  }

  // Mensagens
  static get mensagemSucesso() {
    return cy.getDataCy('carrinho-mensagem-sucesso');
  }

  static get mensagemErro() {
    return cy.getDataCy('carrinho-mensagem-erro');
  }

  static get mensagemLoading() {
    return cy.getDataCy('carrinho-loading');
  }

  // Métodos de Ação
  static visitar() {
    cy.visit('/carrinho');
    this.container.should('be.visible');
  }

  static adicionarItemAoCarrinho(livroUuid: string, quantidade: number = 1) {
    cy.adicionarAoCarrinhoViaApi(livroUuid, quantidade);
    this.visitar();
  }

  static removerItem(indiceItem: number = 0) {
    this.itens.eq(indiceItem).within(() => {
      this.itemRemoverButton.click();
    });
  }

  static atualizarQuantidade(indiceItem: number, novaQuantidade: number) {
    this.itens.eq(indiceItem).within(() => {
      const quantidadeInput = this.itemQuantidadeInput;
      
      quantidadeInput.invoke('val').then(currentValue => {
        const currentQuantidade = parseInt(currentValue as string);
        
        if (novaQuantidade > currentQuantidade) {
          // Aumentar quantidade
          const diferenca = novaQuantidade - currentQuantidade;
          for (let i = 0; i < diferenca; i++) {
            this.itemQuantidadeIncrease.click();
          }
        } else if (novaQuantidade < currentQuantidade) {
          // Diminuir quantidade
          const diferenca = currentQuantidade - novaQuantidade;
          for (let i = 0; i < diferenca; i++) {
            this.itemQuantidadeDecrease.click();
          }
        }
      }
    });
  }

  static aumentarQuantidade(indiceItem: number) {
    this.itens.eq(indiceItem).within(() => {
      this.itemQuantidadeIncrease.click();
    });
  }

  static diminuirQuantidade(indiceItem: number) {
    this.itens.eq(indiceItem).within(() => {
      this.itemQuantidadeDecrease.click();
    });
  }

  static calcularFrete(cep: string) {
    this.cepInput.clear().type(cep);
    this.calcularFreteButton.click();
    this.freteOptions.should('be.visible');
  }

  static selecionarFrete(tipo: 'pac' | 'sedex') {
    if (tipo === 'pac') {
      this.fretePacRadio.check();
    } else {
      this.freteSedexRadio.check();
    }
  }

  static aplicarCupom(codigoCupom: string) {
    this.cupomInput.clear().type(codigoCupom);
    this.cupomAplicarButton.click();
  }

  static removerCupom() {
    this.cupomRemoverButton.click();
  }

  static finalizarCompra() {
    this.finalizarCompraButton.click();
  }

  static limparCarrinho() {
    this.limparCarrinhoButton.click();
  }

  static continuarComprando() {
    this.continuarComprandoButton.click();
  }

  // Métodos de Verificação
  static verificarCarregamento() {
    this.container.should('be.visible');
    this.titulo.should('contain.text', 'Carrinho de Compras');
  }

  static verificarCarrinhoVazio() {
    this.carrinhoVazio.should('be.visible');
    this.carrinhoVazioMensagem.should('be.visible');
    this.itens.should('not.exist');
  }

  static verificarCarrinhoComItens() {
    this.itens.should('have.length.greaterThan', 0);
    this.resumoSection.should('be.visible');
  }

  static verificarItemNoCarrinho(indiceItem: number, dadosItem: {
    nome?: string;
    autor?: string;
    precoUnitario?: string;
    quantidade?: number;
    precoTotal?: string;
  }) {
    this.itens.eq(indiceItem).within(() => {
      if (dadosItem.nome) {
        this.itemNome.should('contain.text', dadosItem.nome);
      }
      if (dadosItem.autor) {
        this.itemAutor.should('contain.text', dadosItem.autor);
      }
      if (dadosItem.precoUnitario) {
        this.itemPrecoUnitario.should('contain.text', dadosItem.precoUnitario);
      }
      if (dadosItem.quantidade) {
        this.itemQuantidadeInput.should('have.value', dadosItem.quantidade.toString());
      }
      if (dadosItem.precoTotal) {
        this.itemPrecoTotal.should('contain.text', dadosItem.precoTotal);
      }
    });
  }

  static verificarQuantidadeItem(indiceItem: number, quantidadeEsperada: number) {
    this.itens.eq(indiceItem).within(() => {
      this.itemQuantidadeInput.should('have.value', quantidadeEsperada.toString());
    });
  }

  static verificarResumoCarrinho(dadosResumo: {
    subtotal?: string;
    frete?: string;
    desconto?: string;
    total?: string;
  }) {
    if (dadosResumo.subtotal) {
      this.resumoSubtotal.should('contain.text', dadosResumo.subtotal);
    }
    if (dadosResumo.frete) {
      this.resumoFrete.should('contain.text', dadosResumo.frete);
    }
    if (dadosResumo.desconto) {
      this.resumoDesconto.should('contain.text', dadosResumo.desconto);
    }
    if (dadosResumo.total) {
      this.resumoTotal.should('contain.text', dadosResumo.total);
    }
  }

  static verificarFreteCalculado() {
    this.freteOptions.should('be.visible');
    this.freteValor.should('contain.text', 'R$');
    this.fretePrazo.should('contain.text', 'dias úteis');
  }

  static verificarCupomAplicado() {
    this.cupomDesconto.should('be.visible');
    this.cupomDesconto.should('contain.text', 'R$');
  }

  static verificarCupomNaoAplicado() {
    this.cupomDesconto.should('not.exist');
    this.cupomInput.should('be.empty');
  }

  static verificarBotaoFinalizarHabilitado() {
    this.finalizarCompraButton.should('not.be.disabled');
  }

  static verificarBotaoFinalizarDesabilitado() {
    this.finalizarCompraButton.should('be.disabled');
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
  static obterQuantidadeItens(): number {
    let quantidadeTotal = 0;
    this.itemQuantidadeInput.each($input => {
      quantidadeTotal += parseInt($input.val() as string) || 0;
    });
    return quantidadeTotal;
  }

  static obterValorTotal(): number {
    let valorTotal = 0;
    this.itemPrecoTotal.each($preco => {
      const valorTexto = $preco.text().replace('R$', '').replace('.', '').replace(',', '.').trim();
      valorTotal += parseFloat(valorTexto) || 0;
    });
    return valorTotal;
  }

  static contarItensNoCarrinho(): Cypress.Chainable<number> {
    return this.itens.its('length');
  }

  // Métodos de Fluxo Completo
  static adicionarLivroEVerificar(livroUuid: string, dadosEsperados: any) {
    this.adicionarItemAoCarrinho(livroUuid);
    this.verificarCarrinhoComItens();
    this.verificarItemNoCarrinho(0, dadosEsperados);
  }

  static preencherCepECalcularFrete(cep: string) {
    this.calcularFrete(cep);
    this.verificarFreteCalculado();
    this.selecionarFrete('pac'); // ou 'sedex'
  }

  static aplicarCupomEVerificar(codigoCupom: string, valorDescontoEsperado: string) {
    this.aplicarCupom(codigoCupom);
    this.verificarCupomAplicado();
    this.cupomDesconto.should('contain.text', valorDescontoEsperado);
  }

  // Métodos de Debug
  static logEstadoCarrinho() {
    cy.log('=== ESTADO DO CARRINHO ===');
    this.container.should('exist');
    
    this.itens.should('exist').then($itens => {
      cy.log(`Total de itens no carrinho: ${$itens.length}`);
    });

    this.itens.each(($item, index) => {
      cy.wrap($item).find(this.itemNome.selector).then($nome => {
        cy.log(`Item ${index + 1}: ${$nome.text()}`);
      });
      
      cy.wrap($item).find(this.itemQuantidadeInput.selector).then($quantidade => {
        cy.log(`  Quantidade: ${$quantidade.val()}`);
      });
      
      cy.wrap($item).find(this.itemPrecoTotal.selector).then($preco => {
        cy.log(`  Preço total: ${$preco.text()}`);
      });
    });

    this.resumoTotal.should('exist').then($total => {
      cy.log(`Total do carrinho: ${$total.text()}`);
    });
  }

  static aguardarAtualizacaoCarrinho() {
    this.mensagemLoading.should('not.exist');
    this.resumoTotal.should('be.visible');
  }
}