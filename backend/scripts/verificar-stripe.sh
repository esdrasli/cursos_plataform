#!/bin/bash

# Script para verificar e corrigir configuração do Stripe
# Uso: ./verificar-stripe.sh

set -e

echo "🔍 Verificando configuração do Stripe..."
echo ""

BACKEND_DIR="/opt/apps/cursos_plataform/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    BACKEND_DIR="/opt/storylinker/cursos_plataform/backend"
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Diretório do backend não encontrado!"
    echo "   Procurando em: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"
echo "✅ Diretório encontrado: $BACKEND_DIR"
echo ""

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "   Criando a partir do exemplo..."
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        echo "✅ Arquivo .env criado"
    else
        echo "❌ Erro: env.example.txt não encontrado"
        exit 1
    fi
fi

echo "📋 Verificando variáveis do Stripe no .env..."
echo ""

# Verificar variáveis
STRIPE_SECRET_KEY=$(grep "^STRIPE_SECRET_KEY=" .env 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
PAYMENT_API_KEY=$(grep "^PAYMENT_API_KEY=" .env 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
PAYMENT_GATEWAY=$(grep "^PAYMENT_GATEWAY=" .env 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")

# Verificar se as variáveis estão configuradas
MISSING_VARS=()

if [ -z "$STRIPE_SECRET_KEY" ] || [ "$STRIPE_SECRET_KEY" = "sua_access_token_mercadopago_aqui" ] || [ "$STRIPE_SECRET_KEY" = "sk_live_SUA_CHAVE_SECRETA_AQUI" ]; then
    MISSING_VARS+=("STRIPE_SECRET_KEY")
    echo "❌ STRIPE_SECRET_KEY não configurada ou está com valor padrão"
else
    echo "✅ STRIPE_SECRET_KEY configurada: ${STRIPE_SECRET_KEY:0:20}..."
fi

if [ -z "$PAYMENT_API_KEY" ] || [ "$PAYMENT_API_KEY" = "sua_access_token_mercadopago_aqui" ] || [ "$PAYMENT_API_KEY" = "sk_live_SUA_CHAVE_SECRETA_AQUI" ]; then
    MISSING_VARS+=("PAYMENT_API_KEY")
    echo "❌ PAYMENT_API_KEY não configurada ou está com valor padrão"
else
    echo "✅ PAYMENT_API_KEY configurada: ${PAYMENT_API_KEY:0:20}..."
fi

if [ -z "$PAYMENT_GATEWAY" ] || [ "$PAYMENT_GATEWAY" != "stripe" ]; then
    echo "⚠️  PAYMENT_GATEWAY não está definido como 'stripe' (atual: $PAYMENT_GATEWAY)"
    MISSING_VARS+=("PAYMENT_GATEWAY")
else
    echo "✅ PAYMENT_GATEWAY configurado: $PAYMENT_GATEWAY"
fi

echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ Todas as variáveis do Stripe estão configuradas!"
    echo ""
    echo "🔄 Verificando se o PM2 precisa ser reiniciado..."
    
    # Verificar se PM2 está rodando
    if command -v pm2 &> /dev/null; then
        PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)
        if [ -n "$PM2_APP" ]; then
            echo "📊 Processo PM2 encontrado: $PM2_APP"
            echo ""
            echo "⚠️  Para aplicar as mudanças, reinicie o PM2:"
            echo "   pm2 restart $PM2_APP --update-env"
        else
            echo "⚠️  Processo PM2 não encontrado"
        fi
    fi
    
    exit 0
fi

echo "❌ Variáveis faltando: ${MISSING_VARS[*]}"
echo ""
echo "🔧 Para configurar o Stripe, execute:"
echo "   cd $BACKEND_DIR"
echo "   ./scripts/configurar-stripe.sh"
echo ""
echo "Ou edite manualmente o arquivo .env e adicione:"
echo ""
echo "PAYMENT_GATEWAY=stripe"
echo "STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI"
echo "PAYMENT_API_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI"
echo "STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI"
echo "PAYMENT_WEBHOOK_URL=https://api.ndx.sisaatech.com/api/checkout/webhook"
echo ""
echo "📖 Para mais informações, veja: CONFIGURAR_STRIPE_PRODUCAO.md"
exit 1

