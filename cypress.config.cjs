const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { defineConfig } = require("cypress");
const installLogsPrinter = require('cypress-terminal-report/src/installLogsPrinter');

/** Mesmo SQL do script `backend/testar-cenarios-bdd-7-entrega.sh` (cenário 7 / RN0043). */
function retrocederDataEntregaBdd(vendaUuid) {
  try {
    const containers = execSync("docker ps --format '{{.Names}}'", { encoding: "utf8" });
    if (!containers.split("\n").some((n) => n.trim() === "ecm_postgres")) {
      return false;
    }
    const bancoDesenvolvimento = process.env.POSTGRES_DB ?? "ecm_livraria";
    execSync(
      `docker exec ecm_postgres psql -U ecm_user -d ${bancoDesenvolvimento} -q -c ` +
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

module.exports = defineConfig({
  video: false,
  e2e: {
    /** Next.js (telas); API via rewrite — ver `test:e2e:entrega-7-ui:*` e `next.config.mjs`. */
    baseUrl: "http://localhost:3001",
    allowCypressEnv: true, // Reativado para permitir acesso síncrono via Cypress.env() necessário para cy.session
    experimentalMemoryManagement: true, // Habilita gerenciamento de memória para evitar crashes em testes longos
    numTestsKeptInMemory: 0, // Não mantém testes em memória após execução para reduzir consumo de memória
    env: {
      /** Só injeta `x-use-test-db` no browser quando `true` (suítes que usam Postgres de teste). */
      injectTestDbHeader: false,
      /** URL da API - usa rewrite do Next.js (same-origin para cookies HttpOnly) */
      apiUrl: "http://localhost:3002/api",
      /**
       * Credenciais de administrador para testes.
       * OBRIGATÓRIO: Configure via cypress.env.json ou variáveis de ambiente.
       * Variáveis de ambiente: CYPRESS_admin_email=... CYPRESS_admin_senha=...
       */
      admin: {},
      /**
       * Credenciais de cliente para testes.
       * OBRIGATÓRIO: Configure via cypress.env.json ou variáveis de ambiente.
       * Variáveis de ambiente: CYPRESS_cliente_email=... CYPRESS_cliente_senha=...
       */
      cliente: {},
      /**
       * Credenciais de admin da Loja A para testes de multi-tenancy.
       * OBRIGATÓRIO: Configure via cypress.env.json ou variáveis de ambiente.
       */
      adminLojaA: {},
      /**
       * Credenciais de admin da Loja B para testes de multi-tenancy.
       * OBRIGATÓRIO: Configure via cypress.env.json ou variáveis de ambiente.
       */
      adminLojaB: {},
      /** UUID da loja padrão para evitar login admin em obterLojaPadraoUuid */
      lojaPadraoUuid: "82c0a24c-4cf4-4b12-823a-f1a8b9a086c3",
    },
    setupNodeEvents(on, config) {
      const verboseLogs = config.env?.E2E_VERBOSE_LOGS === true || config.env?.E2E_VERBOSE_LOGS === '1';
      installLogsPrinter(on, {
        printLogsToConsole: verboseLogs ? 'always' : 'onFail',
      });
      // Carregar apiUrl do cypress.env.json se não estiver definido
      if (!config.env.apiUrl) {
        config.env.apiUrl = 'http://localhost:3001/api';
      }
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        bddRetrocederDataEntrega({ vendaUuid }) {
          return retrocederDataEntregaBdd(vendaUuid);
        },
      });
      /**
       * Determina se --no-sandbox deve ser injetado.
       * 
       * PROBLEMA RESOLVIDO: Injetar --no-sandbox incondicionalmente em Chrome headless
       * causava "bad option: --no-sandbox" no Ubuntu 24.04 desktop (não-root, não Docker).
       * 
       * Cypress já tem lógica interna (needsSandbox) que só adiciona o flag quando necessário.
       * Replicamos lógica equivalente aqui para Chromium customizado.
       */
      function shouldUseNoSandbox() {
        if (process.platform !== 'linux') return false;

        // Root (comum em containers Docker sem user namespaces)
        const isRoot = typeof process.getuid === 'function' && process.getuid() === 0;
        if (isRoot) return true;

        // CI explícito
        if (
          process.env.CI === 'true' ||
          process.env.GITHUB_ACTIONS === 'true' ||
          process.env.GITLAB_CI === 'true' ||
          process.env.CIRCLECI === 'true' ||
          process.env.JENKINS_URL
        ) {
          return true;
        }

        // Detecção de Docker / container
        try {
          if (fs.existsSync('/.dockerenv')) return true;
          const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
          if (cgroup.includes('docker') || cgroup.includes('kubepods') || cgroup.includes('containerd')) {
            return true;
          }
        } catch {
          // ignora (ex: /proc não legível)
        }

        // Override manual para casos avançados (ex: WSL2 com limitações específicas)
        if (process.env.CYPRESS_NO_SANDBOX === '1' || process.env.CYPRESS_NO_SANDBOX === 'true') {
          return true;
        }

        return false;
      }

      on('before:browser:launch', (browser, launchOptions) => {
        // Suporta chrome, chromium e edge (Chromium-based)
        const isChromium = ['chrome', 'chromium', 'edge'].includes(browser.name);
        // Electron usa Chromium embutido mas não aceita as mesmas flags
        const isElectron = browser.name === 'electron';
        
        if (isChromium && browser.isHeadless && !isElectron) {
          launchOptions.args.push('--window-size=1920,1080');
          launchOptions.args.push('--force-device-scale-factor=1');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');

          // CRÍTICO: só adiciona --no-sandbox quando realmente necessário
          if (shouldUseNoSandbox()) {
            launchOptions.args.push('--no-sandbox');
          }
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
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
  },
});
