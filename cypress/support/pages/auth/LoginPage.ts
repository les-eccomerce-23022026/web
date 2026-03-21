export class LoginPage {
  static get emailInput() {
    return cy.getDataCy('login-email-input');
  }

  static get passwordInput() {
    return cy.getDataCy('login-password-input');
  }

  static get submitButton() {
    return cy.getDataCy('login-submit-button');
  }

  static get errorMessage() {
    return cy.getDataCy('login-error-message');
  }

  static get registerToggleButton() {
    return cy.getDataCy('register-toggle-button');
  }

  static fill(email: string, pass: string) {
    this.emailInput.clear().type(email);
    this.passwordInput.clear().type(pass);
  }

  static submit() {
    this.submitButton.click();
  }

  static toggleRegister() {
    this.registerToggleButton.click();
  }
}
