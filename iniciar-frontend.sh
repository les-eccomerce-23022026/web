#!/bin/bash

# Script para iniciar o frontend automaticamente (alinhado ao Cypress E2E)
# baseUrl em cypress.config.cjs = http://localhost:3000
# Uso: ./iniciar-frontend.sh   (ou bash iniciar-frontend.sh)
#
# NOTA: Para E2E use preferencialmente "npm run dev" direto (porta 3000).
#       Este script mata processo na porta e inicia o Next.js.

PORTA=3000
VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${AMARELO}==========================================${NC}"
echo -e "${AMARELO}INICIANDO FRONTEND (Next.js :$PORTA — compatível com Cypress)${NC}"
echo -e "${AMARELO}==========================================${NC}"
echo ""

# Verificar se a porta está ocupada
if lsof -Pi :$PORTA -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${AMARELO}Porta $PORTA está ocupada. Matando processo...${NC}"
    fuser -k $PORTA/tcp 2>/dev/null || true
    sleep 2
    echo -e "${VERDE}Processo morto com sucesso.${NC}"
    echo ""
fi

# Iniciar o frontend (npm run dev usa porta 3000 por padrão — ver package.json)
echo -e "${AMARELO}Iniciando frontend na porta $PORTA (compatível com baseUrl do Cypress)...${NC}"
npm run dev
