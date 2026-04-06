import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "cypress";

/** Cópia plana dos PNGs deste spec para a pasta da entrega (slides). */
const FLUXO_VENDA_IMGS_ENTREGA = path.resolve(
  process.cwd(),
  "..",
  "entregas",
  "modulos-criacao-slide",
  "entrega-06042026",
  "imgs-fluxo-venda",
);

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: "http://localhost:5173",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    env: {
      /** Só injeta `x-use-test-db` no browser quando `true` (suítes que usam Postgres de teste). */
      injectTestDbHeader: false,
      /** Mesma origem do Vite (proxy `/api` → backend) para cookie HttpOnly. */
      apiUrl: "http://localhost:5173/api",
      admin: {
        email: "admin@livraria.com.br",
        senha: "Admin@123"
      },
      /** Alinhado ao seed `005_seed_usuarios_teste.sql` (banco de testes). */
      cliente: {
        email: "clientetest@email.com",
        senha: "@asdfJKLÇ123",
      },
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
      on("after:screenshot", (details) => {
        const normalized = details.path.replace(/\\/g, "/");
        if (!normalized.includes("fluxo-venda-screenshots")) {
          return;
        }
        fs.mkdirSync(FLUXO_VENDA_IMGS_ENTREGA, { recursive: true });
        const dest = path.join(FLUXO_VENDA_IMGS_ENTREGA, path.basename(details.path));
        fs.copyFileSync(details.path, dest);
        return null;
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    scrollBehavior: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
});
