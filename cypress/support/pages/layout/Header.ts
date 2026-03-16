export class Header {
  static get userProfileIcon() {
    return cy.getDataCy('header-user-profile');
  }

  static get logoutButton() {
    return cy.getDataCy('header-logout-button');
  }

  static get loginLink() {
    return cy.getDataCy('header-login-link');
  }

  static get adminLink() {
    return cy.getDataCy('header-admin-link');
  }

  static verifyLoggedIn(name: string) {
    this.userProfileIcon
      .should('be.visible')
      .and('have.attr', 'title', `Olá, ${name}`);
    this.logoutButton.should('be.visible');
  }

  static verifyLoggedOut() {
    this.loginLink.should('be.visible');
    this.userProfileIcon.should('not.exist');
  }

  static logout() {
    this.logoutButton.click();
  }
}
