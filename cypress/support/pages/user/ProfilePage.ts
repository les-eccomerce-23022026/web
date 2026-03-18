export class ProfilePage {
  static get title() { return cy.get('h1'); }
  static get message() { return cy.get('[class*="message"]'); }
  static get errorMessage() { 
    return cy.get('[data-cy="senha-error-message"], [class*="messageError"], [class*="auth-message-error"]'); 
  }
  static get successMessage() { 
    return cy.get('[data-cy="senha-success-message"], [class*="messageSuccess"], [class*="auth-message-success"]'); 
  }

  // Abas
  static get tabPersonalData() { return cy.get('[data-cy="tab-perfil"]'); }
  static get tabAddresses() { return cy.get('[data-cy="tab-enderecos"]'); }
  static get tabCards() { return cy.get('[data-cy="tab-cartoes"]'); }
  static get tabSecurity() { return cy.get('[data-cy="tab-senha"]'); }
  static get tabDangerZone() { return cy.get('[data-cy="tab-perigo"]'); }

  // Campos Dados Pessoais
  static get nomeInput() { return cy.get('[data-cy="perfil-nome-input"]'); }
  static get generoSelect() { return cy.get('[data-cy="perfil-genero-select"]'); }
  static get nascimentoInput() { return cy.get('[data-cy="perfil-nascimento-input"]'); }
  static get emailInput() { return cy.get('[data-cy="perfil-email-input"]'); }
  static get cpfInput() { return cy.get('[data-cy="perfil-cpf-input"]'); }
  static get telTipoSelect() { return cy.get('[data-cy="perfil-tel-tipo-select"]'); }
  static get telInput() { return cy.get('[data-cy="perfil-tel-input"]'); }
  static get saveProfileButton() { return cy.get('[data-cy="perfil-save-button"]'); }

  // Modal Confirmação de Senha (para dados críticos)
  static get passwordConfirmInput() { return cy.get('[data-cy="perfil-modal-password-input"]'); }
  static get modalConfirmButton() { return cy.get('[data-cy="perfil-modal-confirm-button"]'); }
  static get modalCancelButton() { return cy.get('[data-cy="perfil-modal-cancel-button"]'); }

  // Endereços
  static get addAddressButton() { return cy.get('[data-cy="endereco-add-button"]'); }
  static get addressFormPanel() { return cy.get('[data-cy="endereco-form-panel"]'); }
  static get addressApelidoInput() { return cy.get('[data-cy="endereco-apelido-input"]'); }
  static get addressLogradouroInput() { return cy.get('[data-cy="endereco-logradouro-input"]'); }
  static get addressNumeroInput() { return cy.get('[data-cy="endereco-numero-input"]'); }
  static get addressBairroInput() { return cy.get('[data-cy="endereco-bairro-input"]'); }
  static get addressCepInput() { return cy.get('[data-cy="endereco-cep-input"]'); }
  static get addressCidadeInput() { return cy.get('[data-cy="endereco-cidade-input"]'); }
  static get addressEstadoInput() { return cy.get('[data-cy="endereco-estado-input"]'); }
  static get saveAddressButton() { return cy.get('[data-cy="endereco-submit-button"]'); }
  
  // Cartões
  static get addCardButton() { return cy.get('[data-cy="cartao-add-button"]'); }
  static get cardFormPanel() { return cy.get('[data-cy="cartao-form-panel"]'); }
  static get cardNumeroInput() { return cy.get('[data-cy="cartao-numero-input"]'); }
  static get cardNomeInput() { return cy.get('[data-cy="cartao-nome-input"]'); }
  static get cardBandeiraSelect() { return cy.get('[data-cy="cartao-bandeira-select"]'); }
  static get cardValidadeInput() { return cy.get('[data-cy="cartao-validade-input"]'); }
  static get cardCvvInput() { return cy.get('[data-cy="cartao-cvv-input"]'); }
  static get saveCardButton() { return cy.get('[data-cy="cartao-submit-button"]'); }
  static get preferredCardBadge() { return cy.get('[data-cy="cartao-preferencial-badge"]'); }

  // Senha
  static get currentPasswordInput() { return cy.get('[data-cy="senha-atual-input"]'); }
  static get newPasswordInput() { return cy.get('[data-cy="nova-senha-input"]'); }
  static get confirmNewPasswordInput() { return cy.get('[data-cy="confirmar-nova-senha-input"]'); }
  static get submitPasswordButton() { return cy.get('[data-cy="senha-submit-button"]'); }

  // Inativação (Zona de Perigo)
  static get deleteAccountButton() { return cy.get('[data-cy="inativar-conta-button"]'); }
  
  // Modal Genérico
  static get genericModalConfirmButton() { return cy.get('[data-cy="modal-confirm-button"]'); }
  static get genericModalCancelButton() { return cy.get('[data-cy="modal-cancel-button"]'); }

  static navigateToTab(tab: 'perfil' | 'enderecos' | 'cartoes' | 'senha' | 'perigo') {
    switch(tab) {
      case 'perfil': this.tabPersonalData.click(); break;
      case 'enderecos': this.tabAddresses.click(); break;
      case 'cartoes': this.tabCards.click(); break;
      case 'senha': this.tabSecurity.click(); break;
      case 'perigo': this.tabDangerZone.click(); break;
    }
  }

  static getEditButton(type: 'endereco' | 'cartao', index = 0) {
    return cy.get(`[data-cy^="${type}-edit-button-"]`).eq(index);
  }

  static getDeleteButton(type: 'endereco' | 'cartao', index = 0) {
    return cy.get(`[data-cy^="${type}-delete-button-"]`).eq(index);
  }

  static getPreferredButton(index = 0) {
    return cy.get(`[data-cy^="cartao-preferencial-button-"]`).eq(index);
  }

  static fillPersonalData(data: { nome?: string, email?: string, cpf?: string, tel?: string }) {
    if (data.nome) this.nomeInput.clear().type(data.nome);
    if (data.email) this.emailInput.clear().type(data.email);
    if (data.cpf) this.cpfInput.clear().type(data.cpf);
    if (data.tel) this.telInput.clear().type(data.tel);
  }

  static confirmWithPassword(password: string) {
    this.passwordConfirmInput.should('be.visible').type(password);
    this.modalConfirmButton.click();
  }

  static fillAddress(address: any) {
    if (address.apelido) this.addressApelidoInput.clear().type(address.apelido);
    if (address.logradouro) this.addressLogradouroInput.clear().type(address.logradouro);
    if (address.numero) this.addressNumeroInput.clear().type(address.numero);
    if (address.bairro) this.addressBairroInput.clear().type(address.bairro);
    if (address.cep) this.addressCepInput.clear().type(address.cep);
    if (address.cidade) this.addressCidadeInput.clear().type(address.cidade);
    if (address.estado) this.addressEstadoInput.clear().type(address.estado);
  }

  static fillCard(card: any) {
    if (card.numero) this.cardNumeroInput.clear().type(card.numero);
    if (card.nome) this.cardNomeInput.clear().type(card.nome);
    if (card.bandeira) this.cardBandeiraSelect.select(card.bandeira);
    if (card.validade) this.cardValidadeInput.clear().type(card.validade);
    if (card.cvv) this.cardCvvInput.clear().type(card.cvv);
  }

  static requestAccountDeletion() {
    this.navigateToTab('perigo');
    this.deleteAccountButton.should('be.visible').click();
    this.genericModalConfirmButton.should('be.visible').click();
  }
}
