#!/bin/bash
# Script de configuração do ambiente (.env) para o frontend

set -e

VERDE='\033[0;32m'
AMARELO='\033[1;33m'
NC='\033[0m' # No Color

echo "Configurando arquivo .env..."

if [ -f ".env" ]; then
    echo -e "${AMARELO}⚠ Arquivo .env já existe, pulando configuração${NC}"
    exit 0
fi

if [ ! -f ".env.example" ]; then
    echo -e "${AMARELO}⚠ Arquivo .env.example não encontrado${NC}"
    exit 1
fi

# Copiar .env.example para .env
cp .env.example .env
echo -e "${VERDE}✓ Arquivo .env criado a partir de .env.example${NC}"

# Configurar valores padrão
echo "" >> .env
echo "# Valores configurados automaticamente pelo setup" >> .env
echo "BACKEND_URL=http://localhost:3002" >> .env
echo "NODE_ENV=development" >> .env

echo -e "${VERDE}✓ Variáveis de ambiente configuradas${NC}"
echo ""
