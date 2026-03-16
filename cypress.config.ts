import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
