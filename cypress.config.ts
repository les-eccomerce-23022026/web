import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "cypress";
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

/** Mesmo SQL do script `backend/testar-cenarios-bdd-7-entrega.sh` (cenário 7 / RN0043). */
function retrocederDataEntregaBdd(vendaUuid: string): boolean {
  try {
    const containers = execSync("docker ps --format '{{.Names}}'", { encoding: "utf8" });
    if (!containers.split("\n").some((n) => n.trim() === "ecm_postgres")) {
      return false;
    }
    execSync(
      `docker exec ecm_postgres psql -U ecm_user -d ecm_livraria -q -c ` +
        `"UPDATE livraria_comercial.vendas SET ven_data_hora_entrega = NOW() - INTERVAL '8 days' ` +
        `WHERE ven_uuid = '${vendaUuid}';"`,
      { stdio: "pipe" },
    );
    return true;
  } catch {
    return false;
  }
}

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
  video: false,
  e2e: {
    /** Next.js (telas); API via rewrite — ver `test:e2e:entrega-7-ui:*` e `next.config.mjs`. */
    baseUrl: "http://localhost:3001",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    env: {
      /** Só injeta `x-use-test-db` no browser quando `true` (suítes que usam Postgres de teste). */
      injectTestDbHeader: true,
      /** Mesma origem do Next.js (rewrites `/api` → backend) para cookie HttpOnly. */
      apiUrl: "http://localhost:3001/api",
      admin: {
        email: "admintest@email.com",
        senha: "@asdfJKLÇ123",
      },
      /** Alinhado ao seed `005_seed_usuarios_teste.sql` (banco de testes). */
      cliente: {
        email: "clientetest@email.com",
        senha: "@asdfJKLÇ123",
      },
    },
    setupNodeEvents(on, config) {
      const verboseLogs = config.env?.E2E_VERBOSE_LOGS === true || config.env?.E2E_VERBOSE_LOGS === '1';
      installLogsPrinter(on, {
        printLogsToConsole: verboseLogs ? 'always' : 'onFail',
      });
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        bddRetrocederDataEntrega({ vendaUuid }: { vendaUuid: string }) {
          return retrocederDataEntregaBdd(vendaUuid);
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
