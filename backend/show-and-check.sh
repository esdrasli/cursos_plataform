#!/bin/bash
# Script que mostra as credenciais do .env e executa verificação

cd "$(dirname "$0")"

echo "📋 Verificando configuração do .env..."
echo "======================================"
echo ""

if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Mostrar apenas as variáveis DB_ (sem mostrar senha completa)
echo "🔐 Credenciais configuradas no .env:"
echo ""
grep -E "^DB_" .env | while IFS='=' read -r key value; do
    if [[ "$key" == *"PASSWORD"* ]]; then
        echo "   $key=***${value: -3}"  # Mostrar apenas últimos 3 caracteres
    else
        echo "   $key=$value"
    fi
done

echo ""
read -p "✅ Deseja executar a verificação com essas credenciais? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "🔍 Executando verificação..."
    echo ""
    npm run check-tables
else
    echo "❌ Verificação cancelada"
    exit 0
fi

