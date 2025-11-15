#!/bin/bash
# Script para verificar tabelas no banco de dados de produção
# Uso: ./check-tables-prod.sh
# Ou: DB_HOST=seu_host DB_PORT=5432 DB_USER=seu_user DB_PASSWORD=sua_senha DB_NAME=seu_banco npm run check-tables

echo "🔍 Verificando tabelas no banco de PRODUÇÃO"
echo "============================================"
echo ""

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "⚠️  Variáveis de ambiente não configuradas!"
    echo ""
    echo "Configure as variáveis de ambiente antes de executar:"
    echo "  export DB_HOST=seu_host"
    echo "  export DB_PORT=5432"
    echo "  export DB_USER=seu_usuario"
    echo "  export DB_PASSWORD=sua_senha"
    echo "  export DB_NAME=seu_banco"
    echo ""
    echo "Ou execute:"
    echo "  DB_HOST=host DB_USER=user DB_PASSWORD=pass DB_NAME=db npm run check-tables"
    echo ""
    exit 1
fi

echo "📊 Configuração do banco:"
echo "  Host: $DB_HOST"
echo "  Port: ${DB_PORT:-5432}"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Executar o script de verificação
npm run check-tables

