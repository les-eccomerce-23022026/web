import { defineConfig } from "cypress";

export default defineConfig({
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
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
