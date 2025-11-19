#!/bin/bash

# Script para configurar Stripe no servidor de produção
# Uso: ./configurar-stripe.sh

set -e

echo "💳 Configurando Stripe em Produção"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do backend"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do exemplo..."
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        echo "✅ Arquivo .env criado"
    else
        echo "❌ Erro: env.example.txt não encontrado"
        exit 1
    fi
fi

echo "📝 Adicionando/atualizando variáveis do Stripe no .env..."
echo ""

# Função para adicionar ou atualizar variável no .env
update_env_var() {
    local var_name=$1
    local var_value=$2
    
    if grep -q "^${var_name}=" .env; then
        # Atualizar variável existente
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" .env
        else
            # Linux
            sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" .env
        fi
        echo "✅ ${var_name} atualizado"
    else
        # Adicionar nova variável
        echo "${var_name}=${var_value}" >> .env
        echo "✅ ${var_name} adicionado"
    fi
}

# Solicitar informações do usuário
echo "Por favor, forneça as informações do Stripe:"
echo ""

read -p "Chave Secreta do Stripe (sk_live_...): " STRIPE_SECRET_KEY
read -p "Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "URL do Webhook [https://api.ndx.sisaatech.com/api/checkout/webhook]: " WEBHOOK_URL
WEBHOOK_URL=${WEBHOOK_URL:-https://api.ndx.sisaatech.com/api/checkout/webhook}

# Atualizar variáveis
update_env_var "PAYMENT_GATEWAY" "stripe"
update_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
update_env_var "PAYMENT_API_KEY" "$STRIPE_SECRET_KEY"
update_env_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
update_env_var "PAYMENT_WEBHOOK_URL" "$WEBHOOK_URL"

echo ""
echo "✅ Configuração do Stripe concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique se as chaves estão corretas no arquivo .env"
echo "2. Reinicie o servidor: pm2 restart cursos-api"
echo "3. Teste criando uma sessão de checkout"
echo ""
echo "⚠️  IMPORTANTE: Nunca commite o arquivo .env com chaves reais!"

