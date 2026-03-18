import { defineConfig } from "cypress";

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: "http://localhost:5173",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    env: {
      apiUrl: "http://localhost:3000/api",
      admin: {
        email: "admin@admin.com",
        senha: "@asdfJKLÇ123"
      },
      cliente: {
        email: "email.teste@gmail.com",
        senha: "@asdfJKLÇ123"
      }
    },
    setupNodeEvents(on, _config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--window-size=1920,1080');
          launchOptions.args.push('--force-device-scale-factor=1');
        }
        return launchOptions;
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
