#!/usr/bin/env bash
# Executa as 3 fases da suíte E2E de compra em sequência, com banner e log em arquivo.
# Uso (a partir de web/): bash scripts/run-e2e-compra-com-relatorio.sh
# Opcional: E2E_VERBOSE_LOGS=1 — repassa ao Cypress (ver cypress.config.ts).
set -u
WEB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$WEB_ROOT"
mkdir -p cypress/reports
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT="cypress/reports/e2e-compra-${STAMP}.log"
LATEST="cypress/reports/e2e-compra-latest.log"

banner() {
  echo "" | tee -a "$REPORT"
  printf '%s\n' "══════════════════════════════════════════════════════════════════════════════" | tee -a "$REPORT"
  printf '  %s\n' "$1" | tee -a "$REPORT"
  printf '%s\n' "══════════════════════════════════════════════════════════════════════════════" | tee -a "$REPORT"
  echo "" | tee -a "$REPORT"
}

ts() { date '+%Y-%m-%d %H:%M:%S'; }

log() {
  echo "[$(ts)] $*" | tee -a "$REPORT"
}

banner "RELATÓRIO E2E COMPRA — início $(ts)"
log "Diretório: $WEB_ROOT"
log "Arquivo deste relatório: $REPORT"
if [ -n "${E2E_VERBOSE_LOGS:-}" ]; then
  log "E2E_VERBOSE_LOGS=$E2E_VERBOSE_LOGS (logs de rede/console no terminal)"
fi

SUMMARY="cypress/reports/e2e-compra-${STAMP}-resumo.txt"
: >"$SUMMARY"
echo "RELATÓRIO E2E COMPRA — $(ts)" >>"$SUMMARY"
echo "Log completo: $REPORT" >>"$SUMMARY"
echo "" >>"$SUMMARY"

run_phase() {
  local num="$1"
  local title="$2"
  local npm_cmd="$3"
  banner "FASE ${num}/3 — ${title}"
  log "Comando: npm run ${npm_cmd}"
  set +e
  if [ -n "${E2E_VERBOSE_LOGS:-}" ]; then
    E2E_VERBOSE_LOGS=1 npm run "$npm_cmd" 2>&1 | tee -a "$REPORT"
  else
    npm run "$npm_cmd" 2>&1 | tee -a "$REPORT"
  fi
  local code=${PIPESTATUS[0]}
  set -e
  echo "fase${num}_exit=${code}" >>"$SUMMARY"
  {
    echo "Fase ${num} (${title}): $([ "$code" -eq 0 ] && echo PASSOU || echo FALHOU) exit=${code}"
  } >>"$SUMMARY"
  if [ "$code" -eq 0 ]; then
    log "FASE ${num} OK (exit 0)"
  else
    log "FASE ${num} FALHOU (exit ${code})"
  fi
  return "$code"
}

F1=0
F2=0
F3=0
run_phase 1 "Postgres dev (sem header test DB)" "cypress:run:e2e-compra-devdb" || F1=$?
run_phase 2 "Postgres teste (injectTestDbHeader)" "cypress:run:e2e-compra-testdb" || F2=$?
run_phase 3 "Checkout pagamento (injectTestDbHeader)" "cypress:run:e2e-checkout-pagamento" || F3=$?

banner "RESUMO FINAL"
{
  echo "--- $(ts) ---"
  echo "Fase 1 (devdb):  exit=${F1:-0}"
  echo "Fase 2 (testdb): exit=${F2:-0}"
  echo "Fase 3 (pagamento): exit=${F3:-0}"
  if [ "${F1:-0}" -eq 0 ] && [ "${F2:-0}" -eq 0 ] && [ "${F3:-0}" -eq 0 ]; then
    echo "RESULTADO GERAL: TODAS AS FASES PASSARAM"
  else
    echo "RESULTADO GERAL: ALGUMA FASE FALHOU (ver detalhes acima no mesmo .log)"
  fi
} | tee -a "$REPORT" "$SUMMARY"

{
  echo ""
  echo "--- Trechos úteis do log (falhas / AssertionError) ---"
  grep -E "AssertionError:|failing|Timed out|Expected to find|✗ FAIL|Specs:.+failed" "$REPORT" 2>/dev/null | tail -60 || echo "(nenhum padrão encontrado — ver log completo)"
} >>"$SUMMARY"

cp -f "$REPORT" "$LATEST" 2>/dev/null || true
log "Cópia rápida do log completo: $LATEST"
log "Resumo: $SUMMARY"

if [ "${F1:-0}" -ne 0 ] || [ "${F2:-0}" -ne 0 ] || [ "${F3:-0}" -ne 0 ]; then
  exit 1
fi
exit 0
