export class RegisterPage {
  // Step 1
  static get nomeInput() { return cy.getDataCy('register-nome-input'); }
  static get cpfInput() { return cy.getDataCy('register-cpf-input'); }
  static get emailInput() { return cy.getDataCy('register-email-input'); }
  static get nascimentoInput() { return cy.getDataCy('register-nascimento-input'); }
  static get senhaInput() { return cy.getDataCy('register-senha-input'); }
  static get senhaToggle() { return cy.getDataCy('register-password-toggle'); }
  static get confirmacaoSenhaInput() { return cy.getDataCy('register-confirmacao-senha-input'); }
  static get confirmacaoSenhaToggle() { return cy.getDataCy('register-confirm-password-toggle'); }
  static get nextStepButton() { return cy.getDataCy('register-next-step-button'); }

  // Step 2
  static get submitButton() { return cy.getDataCy('register-submit-button'); }

  static fillStep1(user: { nome: string; cpf: string; email: string; senha: string; dataNascimento?: string }) {
    this.nomeInput.clear().type(user.nome);
    this.cpfInput.clear().type(user.cpf);
    this.emailInput.clear().type(user.email);
    this.nascimentoInput.clear().type(user.dataNascimento || '1990-01-01');
    
    // DDD e Numero (seletores por label conforme vimos no teste)
    cy.get('label').contains('DDD').parent().find('input').clear().type('11');
    cy.get('label').contains('Número').parent().find('input').clear().type('999887766');

    this.senhaInput.clear().type(user.senha);
    this.senhaToggle.click();
    
    this.confirmacaoSenhaInput.clear().type(user.senha);
    this.confirmacaoSenhaToggle.click();
  }

  static fillAddress(address: { logradouro: string; numero: string; cep: string; bairro: string; cidade: string; estado: string }) {
    cy.get('input[placeholder="Nome da rua"]').clear().type(address.logradouro);
    cy.get('input[placeholder="123"]').clear().type(address.numero);
    cy.get('input[placeholder="00000-000"]').clear().type(address.cep);
    cy.get('label').contains('Bairro').parent().find('input').clear().type(address.bairro);
    cy.get('label').contains('Cidade').parent().find('input').clear().type(address.cidade);
    cy.get('input[placeholder="SP"]').clear().type(address.estado);
  }

  static goToNextStep() {
    this.nextStepButton.click();
  }

  static finish() {
    this.submitButton.click();
  }
}
