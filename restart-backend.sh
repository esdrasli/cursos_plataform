#!/bin/bash
# Script para reiniciar o backend no servidor de produção

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="195.35.16.131"
USER="root"

echo -e "${BLUE}🔄 Reiniciando backend no servidor...${NC}"

# Conectar e reiniciar
ssh "$USER@$SERVER" << 'ENDSSH'
# Encontrar diretório do backend
BACKEND_DIR=$(find /home -type d -name "backend" 2>/dev/null | head -1)
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /var/www -type d -name "backend" 2>/dev/null | head -1)
fi
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /opt -type d -name "backend" 2>/dev/null | head -1)
fi

if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Diretório do backend não encontrado!"
    exit 1
fi

echo "✅ Backend encontrado em: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Reiniciar backend
echo "🔄 Reiniciando backend..."
if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null | grep -q backend; then
    pm2 restart backend
    echo "✅ Reiniciado via PM2"
    echo ""
    echo "📊 Status:"
    pm2 status | grep backend
    echo ""
    echo "📋 Últimas linhas do log:"
    pm2 logs backend --lines 10 --nostream
elif command -v docker > /dev/null 2>&1 && docker ps 2>/dev/null | grep -q backend; then
    CONTAINER=$(docker ps --format '{{.Names}}' | grep backend | head -1)
    docker restart "$CONTAINER"
    echo "✅ Reiniciado via Docker: $CONTAINER"
    echo ""
    echo "📋 Últimas linhas do log:"
    docker logs "$CONTAINER" --tail 10
elif systemctl list-units --type=service 2>/dev/null | grep -q backend; then
    systemctl restart backend
    echo "✅ Reiniciado via systemd"
    echo ""
    echo "📋 Status:"
    systemctl status backend --no-pager | head -10
else
    echo "⚠️  Não foi possível detectar o método de gerenciamento"
    echo "   Tente manualmente:"
    echo "   - pm2 restart backend"
    echo "   - docker restart <container>"
    echo "   - systemctl restart backend"
fi
ENDSSH

echo ""
echo -e "${GREEN}✅ Comando executado!${NC}"

