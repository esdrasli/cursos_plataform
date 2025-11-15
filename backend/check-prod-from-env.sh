#!/bin/bash
# Script para verificar tabelas usando credenciais do .env
# Este script lê as credenciais do .env e executa a verificação

cd "$(dirname "$0")"

echo "🔍 Verificando tabelas usando credenciais do .env"
echo "=================================================="
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Carregar variáveis do .env
export $(grep -v '^#' .env | grep -E '^DB_' | xargs)

echo "📊 Credenciais carregadas do .env:"
echo "   Host: ${DB_HOST:-não configurado}"
echo "   Port: ${DB_PORT:-5432}"
echo "   User: ${DB_USER:-não configurado}"
echo "   Database: ${DB_NAME:-não configurado}"
echo ""

# Executar verificação
npm run check-tables

