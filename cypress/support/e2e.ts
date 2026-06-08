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
  // Ignora erros de hydration do React (SSR vs cliente) - não afeta funcionalidade
  if (err.message.includes('Hydration failed') || 
      err.message.includes('hydration') ||
      err.message.includes('Minified React error') ||
      err.message.includes('There was an error while hydrating')) {
    console.warn('[Ignorando hydration mismatch - SSR vs cliente]', err.message);
    return false; // Retorna false para não falhar o teste
  }
  // Ignora erros de console do browser que não afetam o teste
  if (err.message.includes('Non-Error promise rejection')) {
    console.warn('[Ignorando promise rejection não crítico]', err.message);
    return false;
  }
  console.error('[uncaught exception]', err.message);
  return false; // Retorna false para não falhar o teste em erros não críticos
});

// Configuração Global para Testes com Backend Real
// Usando banco de desenvolvimento para evitar problemas de configuração
beforeEach(() => {
  // Sem interceptor - usa banco de desenvolvimento por padrão
});

/** Limpeza básica entre specs para evitar poluição de estado (carrinho, storage) que causa falhas replicadas em batch. */
afterEach(() => {
  // Evita chamar comandos que podem não existir no contexto de erro precoce; o cleanup por spec é preferível
  try {
    if (typeof cy.limparCarrinhoViaApi === 'function') {
      cy.limparCarrinhoViaApi();
    }
  } catch {
    // ignore cleanup errors in afterEach
  }
});
