import './commands';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const installLogsCollector = require('cypress-terminal-report/src/installLogsCollector');

/** Reduz ruído de assets estáticos no cypress-terminal-report (mantém chamadas de API úteis). */
function manterLogTerminal(log: { type: string; message: string; severity: string }): boolean {
  const { type, message: m } = log;
  if (type !== 'cy:xhr' && type !== 'cy:fetch' && type !== 'cy:intercept') return true;
  if (/\.(js|mjs|cjs|css|map)(\?|"|'|$|\s)/i.test(m)) return false;
  if (/\.(woff2?|ttf|eot|otf|svg)(\?|"|'|$|\s)/i.test(m)) return false;
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(m)) return false;
  if (/\/@vite\/|\/node_modules\/|\/assets\/.*\.(js|css)/i.test(m)) return false;
  return true;
}

installLogsCollector({
  filterLog: manterLogTerminal,
});
// Documentação: Módulo não suporta ES6 import; investigar esModuleInterop em tsconfig.json ou Cypress config para possível correção.

/** Fase da suíte (definir nos scripts npm: `--env e2ePhase=F1-devdb` etc.). */
function e2ePhaseLabel(): string {
  const p = Cypress.env('e2ePhase') as string | undefined;
  if (p && String(p).trim() !== '') return String(p);
  return Cypress.env('injectTestDbHeader') === true ? 'testdb-header' : 'devdb';
}

let lastSpecRelative = '';

Cypress.on('test:before:run', (test: Mocha.Test) => {
  const rel = Cypress.spec?.relative ?? '';
  const phase = e2ePhaseLabel();
  const inj = String(Cypress.env('injectTestDbHeader'));
  if (rel && rel !== lastSpecRelative) {
    lastSpecRelative = rel;
    const line = '─'.repeat(76);
    console.log(`\n┌${line}┐`);
    console.log(`│ SPEC  ${rel}`);
    console.log(`│ FASE  ${phase}  |  injectTestDbHeader=${inj}`);
    console.log(`└${line}┘`);
  }
  console.log(`[E2E][${phase}] ▶ início | ${test.title}`);
});

Cypress.on('test:after:run', (test: Mocha.Test) => {
  const phase = e2ePhaseLabel();
  const st = test.state;
  const title = test.title;
  const ms = typeof test.duration === 'number' ? test.duration : 0;
  const icon = st === 'passed' ? '✓ PASS' : st === 'failed' ? '✗ FAIL' : String(st);
  console.log(`[E2E][${phase}] ${icon} | ${title} (${ms}ms)`);
});

Cypress.on('after:spec', (_spec, results) => {
  const phase = e2ePhaseLabel();
  const s = results?.stats;
  if (!s) return;
  const line = '═'.repeat(72);
  console.log(`\n${line}`);
  console.log(
    `[E2E][${phase}] RESUMO SPEC | pass: ${s.passes ?? 0} | fail: ${s.failures ?? 0} | pending: ${s.pending ?? 0} | duração: ${s.duration != null ? `${Math.round(s.duration / 1000)}s` : '—'}`,
  );
  console.log(`${line}\n`);
});

Cypress.on('uncaught:exception', (err) => {
  console.error('[uncaught exception]', err.message);
  return true;
});

// Configuração Global para Testes com Backend Real
// Mantém apenas o interceptor para injetar header x-use-test-db
// A responsabilidade de visualização de logs é delegada ao cypress-terminal-report
beforeEach(() => {
  const forcarBancoTestes = Cypress.env('injectTestDbHeader') === true;
  if (forcarBancoTestes) {
    cy.intercept('**', (req) => {
      const apiUrl = Cypress.env('apiUrl');
      if (apiUrl && req.url.includes(apiUrl)) {
        req.headers['x-use-test-db'] = 'true';
      }
    });
  }
});

/** Garante que a flag global de banco de testes persista entre reloads. */
Cypress.on('window:before:load', (win) => {
  if (Cypress.env('injectTestDbHeader') === true) {
    (win as Window & { __USE_TEST_DB__?: boolean }).__USE_TEST_DB__ = true;
  }
});
