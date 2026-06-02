#!/usr/bin/env bash
# Executa suítes E2E principais de compra em sequência, com banner e log em arquivo.
# Uso (a partir de web/): bash scripts/run-e2e-compra-com-relatorio.sh
# Opcional: E2E_VERBOSE_LOGS=1 — repassa ao Cypress (ver cypress.config.cjs).
#
# NOTA: Garante Cypress v13 (limpa cache v12 que causa "bad option: --no-sandbox" no Ubuntu 24.04).
#       Sempre invoca via "npm run" para usar o binário local correto.
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

# Garante que o Cypress v13 correto está instalado (limpa v12 antigo que causa falha de inicialização)
log "Executando ensure-cypress.sh para evitar erro de binário v12..."
bash "$WEB_ROOT/scripts/ensure-cypress.sh" || log "WARN: ensure-cypress retornou não-zero (continuando assim mesmo)"

# Reforço: em ambiente desktop Ubuntu, o config agora evita --no-sandbox automaticamente.
# Se o Cypress ainda falhar com sandbox aqui, o script vai capturar o erro e o caller
# (agente/LLM) não precisará mais cair em "análise estática apenas".
log "Ambiente: $(uname -a | cut -d' ' -f3-4 || echo 'desconhecido')"

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
# Fases atualizadas para scripts existentes no package.json (test:e2e:*).
# As variações de banco de teste agora são controladas principalmente via cypress.config.cjs + env.
run_phase 1 "Fluxo de compra completo (happy path + cross-domain)" "test:e2e:fluxo-compra" || F1=$?
run_phase 2 "Fluxo checkout + frete + pagamento" "test:e2e:fluxo-checkout" || F2=$?
run_phase 3 "Vendas complexas / casos de falha (regressão)" "test:e2e:vendas:failed" || F3=$?

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
