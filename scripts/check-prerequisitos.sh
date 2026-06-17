#!/bin/bash
# Script de verificação de pré-requisitos para o frontend

set -e

VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${AMARELO}=========================================="
echo "  VERIFICANDO PRÉ-REQUISITOS"
echo "  Frontend Next.js"
echo "=========================================="
echo -e "${NC}"
echo ""

# Verificar Node.js
echo "[1/4] Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${VERDE}✓ Node.js instalado: ${NODE_VERSION}${NC}"
    
    # Verificar versão mínima (Node.js 18+)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "${VERMELHO}✗ Node.js versão mínima requerida: 18.x${NC}"
        echo "  Versão atual: $NODE_VERSION"
        exit 1
    fi
else
    echo -e "${VERMELHO}✗ Node.js não encontrado${NC}"
    echo "  Instale Node.js 18 ou superior: https://nodejs.org/"
    exit 1
fi
echo ""

# Verificar npm
echo "[2/4] Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${VERDE}✓ npm instalado: ${NPM_VERSION}${NC}"
else
    echo -e "${VERMELHO}✗ npm não encontrado${NC}"
    echo "  npm geralmente é instalado junto com Node.js"
    exit 1
fi
echo ""

# Verificar se o diretório node_modules existe (opcional)
echo "[3/4] Verificando dependências..."
if [ -d "node_modules" ]; then
    echo -e "${VERDE}✓ node_modules existe (dependências instaladas)${NC}"
else
    echo -e "${AMARELO}⚠ node_modules não encontrado (dependências serão instaladas)${NC}"
fi
echo ""

# Verificar arquivo .env
echo "[4/4] Verificando configuração..."
if [ -f ".env" ]; then
    echo -e "${VERDE}✓ Arquivo .env existe${NC}"
else
    echo -e "${AMARELO}⚠ Arquivo .env não encontrado (será configurado)${NC}"
fi
echo ""

echo -e "${VERDE}=========================================="
echo "  PRÉ-REQUISITOS VERIFICADOS!"
echo "=========================================="
echo -e "${NC}"
