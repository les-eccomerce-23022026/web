/**
 * Page Object para Checkout
 * Centraliza todos os seletores e ações do fluxo de checkout
 */

export class CheckoutPage {
  // Seletores principais
  static get container() {
    return cy.getDataCy('checkout-container');
  }

  static get titulo() {
    return cy.getDataCy('checkout-titulo');
  }

  // Seção de Endereço
  static get enderecoSection() {
    return cy.getDataCy('checkout-endereco-section');
  }

  static get enderecoSelect() {
    return cy.getDataCy('checkout-endereco-select');
  }

  static get novoEnderecoButton() {
    return cy.getDataCy('checkout-novo-endereco-button');
  }

  static get cepInput() {
    return cy.getDataCy('checkout-cep-input');
  }

  static get calcularFreteButton() {
    return cy.getDataCy('checkout-calcular-frete-button');
  }

  // Seção de Frete
  static get freteSection() {
    return cy.getDataCy('checkout-frete-section');
  }

  static get freteOptions() {
    return cy.getDataCy('checkout-frete-options');
  }

  static get fretePacRadio() {
    return cy.getDataCy('checkout-frete-pac');
  }

  static get freteSedexRadio() {
    return cy.getDataCy('checkout-frete-sedex');
  }

  static get freteValor() {
    return cy.getDataCy('checkout-frete-valor');
  }

  static get fretePrazo() {
    return cy.getDataCy('checkout-frete-prazo');
  }

  // Seção de Pagamento
  static get pagamentoSection() {
    return cy.getDataCy('checkout-pagamento-section');
  }

  static get pagamentoCartaoRadio() {
    return cy.getDataCy('checkout-pagamento-cartao');
  }

  static get pagamentoPixRadio() {
    return cy.getDataCy('checkout-pagamento-pix');
  }

  static get pagamentoBoletoRadio() {
    return cy.getDataCy('checkout-pagamento-boleto');
  }

  // Cartão de Crédito
  static get cartaoSection() {
    return cy.getDataCy('checkout-cartao-section');
  }

  static get cartaoSelect() {
    return cy.getDataCy('checkout-cartao-select');
  }

  static get cartaoNumeroInput() {
    return cy.getDataCy('checkout-cartao-numero');
  }

  static get cartaoNomeInput() {
    return cy.getDataCy('checkout-cartao-nome');
  }

  static get cartaoValidadeInput() {
    return cy.getDataCy('checkout-cartao-validade');
  }

  static get cartaoCvvInput() {
    return cy.getDataCy('checkout-cartao-cvv');
  }

  static get cartaoSalvarCheckbox() {
    return cy.getDataCy('checkout-cartao-salvar');
  }

  // PIX
  static get pixSection() {
    return cy.getDataCy('checkout-pix-section');
  }

  static get pixQrCode() {
    return cy.getDataCy('checkout-pix-qrcode');
  }

  static get pixCodigo() {
    return cy.getDataCy('checkout-pix-codigo');
  }

  static get pixCopiarCodigoButton() {
    return cy.getDataCy('checkout-pix-copiar-codigo');
  }

  // Cupom
  static get cupomSection() {
    return cy.getDataCy('checkout-cupom-section');
  }

  static get cupomInput() {
    return cy.getDataCy('checkout-cupom-input');
  }

  static get cupomAplicarButton() {
    return cy.getDataCy('checkout-cupom-aplicar');
  }

  static get cupomDesconto() {
    return cy.getDataCy('checkout-cupom-desconto');
  }

  // Resumo do Pedido
  static get resumoSection() {
    return cy.getDataCy('checkout-resumo-section');
  }

  static get resumoSubtotal() {
    return cy.getDataCy('checkout-resumo-subtotal');
  }

  static get resumoFrete() {
    return cy.getDataCy('checkout-resumo-frete');
  }

  static get resumoDesconto() {
    return cy.getDataCy('checkout-resumo-desconto');
  }

  static get resumoTotal() {
    return cy.getDataCy('checkout-resumo-total');
  }

  // Botões de Ação
  static get voltarButton() {
    return cy.getDataCy('checkout-voltar-button');
  }

  static get finalizarButton() {
    return cy.getDataCy('checkout-finalizar-button');
  }

  static finalizarButtonEnabled() {
    return this.finalizarButton.should('not.be.disabled');
  }

  // Mensagens
  static get mensagemSucesso() {
    return cy.getDataCy('checkout-mensagem-sucesso');
  }

  static get mensagemErro() {
    return cy.getDataCy('checkout-mensagem-erro');
  }

  static get loading() {
    return cy.getDataCy('checkout-loading');
  }

  // Métodos de Ação
  static visitar() {
    cy.visit('/checkout');
    this.container.should('be.visible');
  }

  static selecionarEndereco(enderecoTexto: string) {
    this.enderecoSelect.select(enderecoTexto);
  }

  static preencherNovoEndereco(dadosEndereco: {
    cep: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  }) {
    this.novoEnderecoButton.click();
    this.cepInput.clear().type(dadosEndereco.cep);
    
    if (dadosEndereco.rua) {
      cy.getDataCy('checkout-endereco-rua').clear().type(dadosEndereco.rua);
    }
    if (dadosEndereco.numero) {
      cy.getDataCy('checkout-endereco-numero').clear().type(dadosEndereco.numero);
    }
    if (dadosEndereco.bairro) {
      cy.getDataCy('checkout-endereco-bairro').clear().type(dadosEndereco.bairro);
    }
    if (dadosEndereco.cidade) {
      cy.getDataCy('checkout-endereco-cidade').clear().type(dadosEndereco.cidade);
    }
    if (dadosEndereco.estado) {
      cy.getDataCy('checkout-endereco-estado').select(dadosEndereco.estado);
    }
  }

  static calcularFrete() {
    this.calcularFreteButton.click();
    this.freteSection.should('be.visible');
  }

  static selecionarFrete(tipo: 'pac' | 'sedex') {
    if (tipo === 'pac') {
      this.fretePacRadio.check();
    } else {
      this.freteSedexRadio.check();
    }
  }

  static selecionarPagamento(tipo: 'cartao' | 'pix' | 'boleto') {
    switch (tipo) {
      case 'cartao':
        this.pagamentoCartaoRadio.check();
        break;
      case 'pix':
        this.pagamentoPixRadio.check();
        break;
      case 'boleto':
        this.pagamentoBoletoRadio.check();
        break;
    }
  }

  static preencherCartao(dadosCartao: {
    numero: string;
    nome: string;
    validade: string;
    cvv: string;
    salvar?: boolean;
  }) {
    this.cartaoNumeroInput.clear().type(dadosCartao.numero);
    this.cartaoNomeInput.clear().type(dadosCartao.nome);
    this.cartaoValidadeInput.clear().type(dadosCartao.validade);
    this.cartaoCvvInput.clear().type(dadosCartao.cvv);
    
    if (dadosCartao.salvar) {
      this.cartaoSalvarCheckbox.check();
    }
  }

  static selecionarCartaoSalvo(nomeCartao: string) {
    this.cartaoSelect.select(nomeCartao);
  }

  static aplicarCupom(codigoCupom: string) {
    this.cupomInput.clear().type(codigoCupom);
    this.cupomAplicarButton.click();
  }

  static finalizarCompra() {
    this.finalizarButtonEnabled();
    this.finalizarButton.click();
  }

  // Métodos de Verificação
  static verificarCarregamento() {
    this.container.should('be.visible');
    this.titulo.should('contain.text', 'Finalizar Compra');
  }

  static verificarEnderecosCarregados() {
    this.enderecoSection.should('be.visible');
    this.enderecoSelect.should('not.be.empty');
  }

  static verificarFreteCalculado() {
    this.freteSection.should('be.visible');
    this.freteOptions.should('be.visible');
    this.freteValor.should('contain.text', 'R$');
  }

  static verificarPagamentoSelecionado(tipo: 'cartao' | 'pix' | 'boleto') {
    switch (tipo) {
      case 'cartao':
        this.pagamentoCartaoRadio.should('be.checked');
        this.cartaoSection.should('be.visible');
        break;
      case 'pix':
        this.pagamentoPixRadio.should('be.checked');
        this.pixSection.should('be.visible');
        break;
      case 'boleto':
        this.pagamentoBoletoRadio.should('be.checked');
        break;
    }
  }

  static verificarResumoPedido() {
    this.resumoSection.should('be.visible');
    this.resumoSubtotal.should('be.visible');
    this.resumoFrete.should('be.visible');
    this.resumoTotal.should('be.visible');
  }

  static verificarCupomAplicado() {
    this.cupomDesconto.should('be.visible');
    this.cupomDesconto.should('contain.text', 'R$');
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

  // Métodos de Fluxo Completo
  static preencherCheckoutCompleto(dados: {
    endereco?: string;
    dadosNovoEndereco?: any;
    frete?: 'pac' | 'sedex';
    pagamento: 'cartao' | 'pix' | 'boleto';
    dadosCartao?: any;
    cupom?: string;
  }) {
    // Endereço
    if (dados.endereco) {
      this.selecionarEndereco(dados.endereco);
    } else if (dados.dadosNovoEndereco) {
      this.preencherNovoEndereco(dados.dadosNovoEndereco);
    }

    // Calcular frete
    this.calcularFrete();
    
    // Selecionar frete
    if (dados.frete) {
      this.selecionarFrete(dados.frete);
    }

    // Pagamento
    this.selecionarPagamento(dados.pagamento);
    
    if (dados.pagamento === 'cartao') {
      if (dados.dadosCartao) {
        this.preencherCartao(dados.dadosCartao);
      }
    }

    // Cupom
    if (dados.cupom) {
      this.aplicarCupom(dados.cupom);
    }

    // Finalizar
    this.finalizarCompra();
  }

  // Métodos de Debug
  static logEstadoCheckout() {
    cy.log('=== ESTADO DO CHECKOUT ===');
    this.container.should('exist');
    
    // Verificar se sections existem
    this.enderecoSection.should('exist').then(el => {
      cy.log(`Endereço section: ${el.length > 0 ? 'OK' : 'NOK'}`);
    });
    
    this.freteSection.should('exist').then(el => {
      cy.log(`Frete section: ${el.length > 0 ? 'OK' : 'NOK'}`);
    });
    
    this.pagamentoSection.should('exist').then(el => {
      cy.log(`Pagamento section: ${el.length > 0 ? 'OK' : 'NOK'}`);
    });
    
    this.resumoSection.should('exist').then(el => {
      cy.log(`Resumo section: ${el.length > 0 ? 'OK' : 'NOK'}`);
    });
  }
}