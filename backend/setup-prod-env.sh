#!/bin/bash
# Script para configurar variáveis de ambiente de produção
# Execute este script no servidor de produção

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Arquivo $ENV_FILE não encontrado!"
    echo "   Criando arquivo $ENV_FILE..."
    touch "$ENV_FILE"
fi

echo "🔧 Configurando variáveis de ambiente de produção..."
echo ""

# Verificar se DB_SCHEMA_PROD já existe
if grep -q "^DB_SCHEMA_PROD=" "$ENV_FILE"; then
    echo "⚠️  DB_SCHEMA_PROD já existe no arquivo"
    read -p "Deseja atualizar? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sed -i.bak 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' "$ENV_FILE"
        echo "✅ DB_SCHEMA_PROD atualizado para 'cursos'"
    else
        echo "❌ Configuração não alterada"
    fi
else
    # Adicionar DB_SCHEMA_PROD
    echo "" >> "$ENV_FILE"
    echo "# Schema do banco de dados (produção)" >> "$ENV_FILE"
    echo "DB_SCHEMA_PROD=cursos" >> "$ENV_FILE"
    echo "✅ DB_SCHEMA_PROD=cursos adicionado ao arquivo"
fi

echo ""
echo "📋 Configuração atual:"
grep -E "^DB_" "$ENV_FILE" | grep -v "PASSWORD" || echo "Nenhuma variável DB_ encontrada"

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Reinicie o backend: docker restart cursos_backend_prod"
echo "   2. Verifique os logs: docker logs cursos_backend_prod"
echo "   3. Teste o endpoint: curl http://api.ndx.sisaatech.com/api/courses/creator/my-courses"

