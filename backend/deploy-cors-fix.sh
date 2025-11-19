#!/bin/bash

# Script para atualizar o servidor com as correções de CORS
# Execute este script no servidor via SSH

set -e

echo "🚀 Iniciando atualização do servidor..."

# Encontrar o diretório do backend
BACKEND_DIR="/opt/apps/cursos_plataform/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR="/opt/storylinker/cursos_plataform/backend"
fi
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR=$(find /opt /home /var/www -type d -name "backend" 2>/dev/null | grep -i cursos | head -1)
fi

if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
  echo "❌ Diretório do backend não encontrado!"
  exit 1
fi

echo "✅ Diretório encontrado: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Fazer backup do .env
if [ -f ".env" ]; then
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S) || true
  echo "✅ Backup do .env criado"
fi

# Atualizar código do repositório
echo "📥 Atualizando código do repositório..."
git fetch origin main
git reset --hard origin/main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production=false

# Fazer build TypeScript
if [ -f "tsconfig.json" ]; then
  echo "🔨 Fazendo build TypeScript..."
  npm run build
  
  # Verificar se o build foi bem-sucedido
  if [ ! -d "dist" ]; then
    echo "❌ Erro: diretório dist não foi criado!"
    exit 1
  fi
  echo "✅ Build concluído"
fi

# Encontrar o processo PM2
echo "📊 Verificando processos PM2..."
PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)

if [ -z "$PM2_APP" ]; then
  echo "⚠️  Processo PM2 não encontrado. Listando todos os processos:"
  pm2 list
  echo "❌ Não foi possível reiniciar o PM2 automaticamente"
  exit 1
fi

echo "✅ Processo PM2 encontrado: $PM2_APP"

# Reiniciar PM2
echo "🔄 Reiniciando PM2..."
pm2 restart "$PM2_APP" --update-env

# Aguardar um pouco para o processo iniciar
sleep 3

# Verificar status
echo "📊 Status do PM2:"
pm2 status

# Mostrar últimas linhas do log
echo "📋 Últimas linhas do log:"
pm2 logs "$PM2_APP" --lines 20 --nostream || true

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "🔍 Verifique os logs acima para confirmar que o servidor está rodando corretamente."

