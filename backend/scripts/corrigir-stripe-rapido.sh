#!/bin/bash

# Script rápido para configurar Stripe via variáveis de ambiente
# Uso: STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... ./corrigir-stripe-rapido.sh

set -e

echo "⚡ Configuração Rápida do Stripe"
echo ""

BACKEND_DIR="/opt/apps/cursos_plataform/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    BACKEND_DIR="/opt/storylinker/cursos_plataform/backend"
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Diretório do backend não encontrado!"
    exit 1
fi

cd "$BACKEND_DIR"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando..."
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
    else
        touch .env
    fi
fi

# Função para atualizar ou adicionar variável
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env 2>/dev/null; then
        # Atualizar existente
        sed -i "s|^${key}=.*|${key}=${value}|" .env
        echo "✅ ${key} atualizado"
    else
        # Adicionar novo
        echo "${key}=${value}" >> .env
        echo "✅ ${key} adicionado"
    fi
}

# Usar variáveis de ambiente ou solicitar
if [ -z "$STRIPE_SECRET_KEY" ]; then
    read -p "Chave Secreta do Stripe (sk_live_...): " STRIPE_SECRET_KEY
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    read -p "Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
fi

WEBHOOK_URL="${PAYMENT_WEBHOOK_URL:-https://api.ndx.sisaatech.com/api/checkout/webhook}"

# Atualizar .env
update_env "PAYMENT_GATEWAY" "stripe"
update_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
update_env "PAYMENT_API_KEY" "$STRIPE_SECRET_KEY"
update_env "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
update_env "PAYMENT_WEBHOOK_URL" "$WEBHOOK_URL"

echo ""
echo "✅ Configuração do Stripe concluída!"
echo ""
echo "🔄 Reiniciando PM2 para aplicar mudanças..."

# Reiniciar PM2
if command -v pm2 &> /dev/null; then
    PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)
    if [ -n "$PM2_APP" ]; then
        pm2 restart "$PM2_APP" --update-env
        echo "✅ PM2 reiniciado: $PM2_APP"
        sleep 2
        pm2 logs "$PM2_APP" --lines 10 --nostream
    else
        echo "⚠️  Processo PM2 não encontrado. Reinicie manualmente."
    fi
else
    echo "⚠️  PM2 não encontrado. Reinicie o servidor manualmente."
fi

echo ""
echo "✅ Pronto! O Stripe deve estar configurado agora."

