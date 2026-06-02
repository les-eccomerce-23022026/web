#!/usr/bin/env bash
# ensure-cypress.sh
# Garante execução confiável do Cypress v13 no projeto (web/).
# Resolve o erro "Cypress failed to start / bad option: --no-sandbox" causado por:
#   - Cache residual do Cypress v12.17.4 (Electron 21 incompatível com Ubuntu 24.04)
#   - Invocação fora do contexto npm local (npx/cypress global antigo)
#
# Uso:
#   bash scripts/ensure-cypress.sh
#   npm run cypress:reset
#
# Requisitos: npm install já executado (node_modules presente).
# Não requer sudo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=================================================="
echo "  Cypress Ensure v13 — LES E-Commerce (web/)"
echo "=================================================="
echo "Diretório: $WEB_ROOT"

cd "$WEB_ROOT"

if [[ ! -f "package.json" ]]; then
  echo "ERRO: package.json não encontrado. Execute a partir de web/ ou web/scripts/"
  exit 1
fi

if [[ ! -d "node_modules/.bin" ]]; then
  echo "ERRO: node_modules/.bin ausente."
  echo "      Execute primeiro: cd web && npm install"
  exit 1
fi

CYPRESS_BIN="$WEB_ROOT/node_modules/.bin/cypress"

# Detectar mismatch entre package.json (^13) e o que está instalado no node_modules (pode ser 12)
DECLARED_VERSION=$(node -e 'console.log(require("./package.json").devDependencies.cypress || "")')
INSTALLED_VERSION=$("$CYPRESS_BIN" --version 2>/dev/null | grep "Cypress package version" | awk '{print $4}' || echo "desconhecida")

echo ""
echo "Versão declarada no package.json: $DECLARED_VERSION"
echo "Versão atualmente instalada:     $INSTALLED_VERSION"

if [[ "$INSTALLED_VERSION" == 12* || "$INSTALLED_VERSION" == "desconhecida" ]]; then
  echo ""
  echo "[0/3] CORRIGINDO versão do pacote npm (instalado era v12, declarado ^13)..."
  echo "      Atualizando package-lock + node_modules/cypress para 13.x (pode demorar no primeiro run)..."
  npm install cypress@^13.17.0 --save-dev --prefer-offline --no-audit --no-fund 2>&1 | tail -6
  echo "      Pacote npm corrigido. Re-resolvendo bin local..."
  CYPRESS_BIN="$WEB_ROOT/node_modules/.bin/cypress"
fi

echo ""
echo "[1/3] Removendo caches obsoletos do binário (v11/v12 causam 'bad option' no Ubuntu 24.04)..."
rm -rf "$HOME/.cache/Cypress/11"* "$HOME/.cache/Cypress/12"* 2>/dev/null || true
echo "      Caches de binário antigos removidos."

echo ""
echo "[2/3] Garantindo binário Cypress v13 baixado (cypress install)..."
"$CYPRESS_BIN" install

echo ""
echo "[3/3] Verificando integridade (cypress verify)..."
"$CYPRESS_BIN" verify

echo ""
echo "[4/4] Verificando ambiente (Ubuntu 24.04 / sandbox)..."
IS_ROOT=0
if [ "$(id -u)" -eq 0 ]; then
  IS_ROOT=1
fi

IN_DOCKER=0
if [ -f /.dockerenv ] || grep -qiE 'docker|kubepods|containerd' /proc/1/cgroup 2>/dev/null; then
  IN_DOCKER=1
fi

if [ "$IS_ROOT" -eq 1 ] || [ "$IN_DOCKER" -eq 1 ] || [ -n "${CI:-}" ]; then
  echo "      Ambiente detectado: CI / Docker / root → --no-sandbox será aplicado automaticamente quando necessário."
else
  echo "      Ambiente detectado: desktop Ubuntu (não-root) → --no-sandbox NÃO será injetado (evita 'bad option')."
  echo "      Se você ainda vir o erro, rode: CYPRESS_NO_SANDBOX=1 npm run test:e2e:ci"
fi

echo ""
echo "✅ SUCESSO: Cypress v13 está pronto e verificado."
echo ""
echo "Comandos recomendados (sempre a partir de web/):"
echo "  npm run test:e2e                 # headless (usa Electron — funciona sem libs GTK no Ubuntu)"
echo "  npm run test:e2e:ci              # alias explícito para CI/Linux"
echo "  npm run test:e2e:ci:spec 'cypress/e2e/autenticacao/**/*.cy.ts'"
echo "  npm run cypress:verify"
echo "  npm run test:e2e:open            # modo interativo (recomenda Chrome instalado)"
echo ""
echo "Para fluxos específicos (exemplos existentes):"
echo "  npm run test:e2e:fluxo-compra:headed"
echo "  npm run test:e2e:autenticacao"
echo ""
echo "Se ainda houver problema com Chrome headed:"
echo "  - Use as variantes :electron (ex: npm run test:e2e:headed:electron)"
echo "  - Ou instale deps do sistema (requer sudo):"
echo "    sudo apt-get install -y libgtk-3-0 libgbm-dev libnss3 libxss1 libasound2 xvfb"
echo "    xvfb-run -a npm run test:e2e:fluxo-compra:headed"
echo ""
echo "=================================================="
