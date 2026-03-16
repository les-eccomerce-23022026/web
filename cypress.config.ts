import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    allowCypressEnv: false, // Desativado por segurança para evitar leitura via window.Cypress
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
