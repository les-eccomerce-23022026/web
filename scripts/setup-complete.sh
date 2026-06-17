#!/bin/bash
# Script principal de setup completo do frontend
# Orquestra todos os passos necessários para iniciar o ambiente

set -e

VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$FRONTEND_DIR"

echo -e "${AZUL}"
echo "=========================================="
echo "  SETUP COMPLETO DO FRONTEND"
echo "  React + Next.js (LES)"
echo "=========================================="
echo -e "${NC}"
echo ""

# Passo 1: Verificar pré-requisitos
echo -e "${AZUL}[1/4] Verificando pré-requisitos...${NC}"
if [ -f "scripts/check-prerequisitos.sh" ]; then
    bash scripts/check-prerequisitos.sh
else
    echo -e "${VERMELHO}✗ Script de pré-requisitos não encontrado${NC}"
    exit 1
fi
echo ""

# Passo 2: Configurar ambiente
echo -e "${AZUL}[2/4] Configurando ambiente (.env)...${NC}"
if [ ! -f ".env" ]; then
    bash scripts/setup-env.sh
else
    echo -e "${AMARELO}⚠ Arquivo .env já existe, pulando configuração${NC}"
fi
echo ""

# Passo 3: Instalar dependências
echo -e "${AZUL}[3/4] Instalando dependências npm...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências (isso pode levar alguns minutos)..."
    npm install
    echo -e "${VERDE}✓ Dependências instaladas${NC}"
else
    echo -e "${AMARELO}⚠ node_modules já existe, pulando instalação${NC}"
    echo "  Para reinstalar: rm -rf node_modules package-lock.json && npm install"
fi
echo ""

# Passo 4: Liberar porta se ocupada
echo -e "${AZUL}[4/5] Verificando porta 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${AMARELO}⚠ Porta 3000 está ocupada. Matando processo...${NC}"
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
    echo -e "${VERDE}✓ Porta 3000 liberada${NC}"
else
    echo -e "${VERDE}✓ Porta 3000 disponível${NC}"
fi
echo ""

# Passo 5: Validar configuração
echo -e "${AZUL}[5/5] Validando configuração...${NC}"
if [ -f ".env" ]; then
    echo -e "${VERDE}✓ Arquivo .env configurado${NC}"
    echo "  BACKEND_URL=$(grep BACKEND_URL .env | cut -d'=' -f2)"
else
    echo -e "${VERMELHO}✗ Arquivo .env não encontrado${NC}"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo -e "${VERDE}✓ Dependências instaladas${NC}"
else
    echo -e "${VERMELHO}✗ Dependências não instaladas${NC}"
    exit 1
fi
echo ""

# Resumo final
echo -e "${VERDE}"
echo "=========================================="
echo "  SETUP CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo -e "${NC}"
echo "Para iniciar o frontend:"
echo -e "  ${VERDE}npm run dev${NC}"
echo ""
echo "O frontend estará disponível em:"
echo -e "  ${VERDE}http://localhost:3000${NC}"
echo ""
echo "Documentação completa:"
echo -e "  ${VERDE}README.md${NC}"
echo ""
