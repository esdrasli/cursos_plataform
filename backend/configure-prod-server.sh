#!/bin/bash
# Script para configurar o servidor de produção
# Execute este script no servidor onde o backend está rodando

set -e

echo "🔧 Configurando servidor de produção..."
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script no diretório do backend${NC}"
    exit 1
fi

# Caminho do arquivo .env
ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Arquivo $ENV_FILE não encontrado${NC}"
    echo "   Criando arquivo $ENV_FILE..."
    touch "$ENV_FILE"
fi

echo "📝 Configurando variáveis de ambiente..."
echo ""

# Backup do .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup criado: ${ENV_FILE}.backup.*"
fi

# Adicionar/atualizar DB_SCHEMA_PROD
if grep -q "^DB_SCHEMA_PROD=" "$ENV_FILE" 2>/dev/null; then
    echo "   Atualizando DB_SCHEMA_PROD..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' "$ENV_FILE"
    else
        # Linux
        sed -i 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' "$ENV_FILE"
    fi
    echo -e "   ${GREEN}✅ DB_SCHEMA_PROD atualizado para 'cursos'${NC}"
else
    echo "   Adicionando DB_SCHEMA_PROD..."
    echo "" >> "$ENV_FILE"
    echo "# Schema do banco de dados (produção)" >> "$ENV_FILE"
    echo "DB_SCHEMA_PROD=cursos" >> "$ENV_FILE"
    echo -e "   ${GREEN}✅ DB_SCHEMA_PROD=cursos adicionado${NC}"
fi

echo ""
echo "📋 Configuração atual do banco de dados:"
echo "----------------------------------------"
grep -E "^DB_" "$ENV_FILE" | grep -v "PASSWORD" | sed 's/=.*/=***/' || echo "Nenhuma variável DB_ encontrada"

echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "🔄 Próximo passo: Reiniciar o backend"
echo ""
echo "Opções para reiniciar:"
echo "  1. Docker:    docker restart cursos_backend_prod"
echo "  2. PM2:        pm2 restart backend"
echo "  3. Systemd:    sudo systemctl restart backend"
echo "  4. Manual:     Reinicie o processo Node.js"
echo ""

