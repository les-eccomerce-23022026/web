export class RegisterPage {
  // Step 1
  static get nomeInput() { return cy.getDataCy('register-nome-input'); }
  static get cpfInput() { return cy.getDataCy('register-cpf-input'); }
  static get emailInput() { return cy.getDataCy('register-email-input'); }
  static get nascimentoInput() { return cy.getDataCy('register-nascimento-input'); }
  static get senhaInput() { return cy.getDataCy('register-senha-input'); }
  static get senhaToggle() { return cy.get('.toggleButton').eq(0); }
  static get confirmacaoSenhaInput() { return cy.getDataCy('register-confirmar-senha-input'); }
  static get confirmacaoSenhaToggle() { return cy.get('.toggleButton').eq(1); }
  static get telefoneInput() { return cy.getDataCy('register-telefone-input'); }
  static get step2NextButton() { return cy.contains('Finalizar Cadastro'); }
  static get nextStepButton() { return cy.getDataCy('register-step1-next-button'); }

  // Step 2
  static get submitButton() { return cy.getDataCy('register-submit-button'); }

  static fillStep1(user: { nome: string; cpf: string; email: string; dataNascimento?: string }) {
    this.nomeInput.clear().type(user.nome);
    this.cpfInput.clear().type(user.cpf);
    this.emailInput.clear().type(user.email);
    this.nascimentoInput.clear().type(user.dataNascimento || '1990-01-01');
    
    // Gênero (selecionar opção padrão)
    cy.getDataCy('register-genero-select').select('Masculino');
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
