import { defineConfig } from "cypress";

export default defineConfig({
  /**
   * Vídeo desligado por ora: com `true`, cada spec gera gravação e o encode via ffmpeg pesa CPU e tempo
   * de suíte. Reative quando precisar depurar em vídeo.
   */
  video: false,
  e2e: {
    baseUrl: "http://localhost:5173",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    env: {
      /** Só injeta `x-use-test-db` no browser quando `true` (suítes que usam Postgres de teste). */
      injectTestDbHeader: false,
      /** Mesma origem do Vite (proxy `/api` → backend) para cookie HttpOnly. */
      apiUrl: "http://localhost:5173/api",
      admin: {
        email: process.env.CYPRESS_ADMIN_EMAIL || "",
        senha: process.env.CYPRESS_ADMIN_SENHA || ""
      },
      /** Alinhado ao seed `005_seed_usuarios_teste.sql` (banco de testes). */
      cliente: {
        email: process.env.CYPRESS_CLIENTE_EMAIL || "",
        senha: process.env.CYPRESS_CLIENTE_SENHA || "",
      },
      testBootstrapKey: process.env.TEST_BOOTSTRAP_KEY || '',
    },
    setupNodeEvents(on, _config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
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
    scrollBehavior: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
