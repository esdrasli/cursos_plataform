#!/bin/bash
# Script para reiniciar o servidor backend
# Funciona tanto para Docker local quanto produção

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔄 Reiniciando servidor backend..."
echo ""

# Verificar se está em ambiente Docker
if command -v docker &> /dev/null; then
    # Tentar reiniciar via Docker
    if docker ps --format '{{.Names}}' | grep -q "backend"; then
        BACKEND_CONTAINER=$(docker ps --format '{{.Names}}' | grep "backend" | head -1)
        echo -e "${BLUE}🐳 Reiniciando container Docker: $BACKEND_CONTAINER${NC}"
        docker restart "$BACKEND_CONTAINER"
        echo -e "${GREEN}✅ Container reiniciado!${NC}"
        echo ""
        echo "📊 Status do container:"
        docker ps --filter "name=$BACKEND_CONTAINER" --format "table {{.Names}}\t{{.Status}}"
        exit 0
    fi
fi

# Verificar se está usando PM2
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "backend"; then
        echo -e "${BLUE}🔄 Reiniciando via PM2...${NC}"
        pm2 restart backend
        echo -e "${GREEN}✅ Backend reiniciado via PM2!${NC}"
        echo ""
        echo "📊 Status:"
        pm2 status
        exit 0
    fi
fi

# Verificar se está usando systemd
if systemctl list-units --type=service | grep -q "backend"; then
    echo -e "${BLUE}🔄 Reiniciando via systemd...${NC}"
    sudo systemctl restart backend
    echo -e "${GREEN}✅ Backend reiniciado via systemd!${NC}"
    echo ""
    echo "📊 Status:"
    sudo systemctl status backend --no-pager
    exit 0
fi

# Se nenhum método funcionou, mostrar opções
echo -e "${YELLOW}⚠️  Não foi possível detectar o método de gerenciamento${NC}"
echo ""
echo "Opções manuais:"
echo "  1. Docker:    docker restart <container_name>"
echo "  2. PM2:        pm2 restart backend"
echo "  3. Systemd:    sudo systemctl restart backend"
echo "  4. Node.js:    Pare o processo (Ctrl+C) e inicie novamente"
echo ""
echo "Para produção na Hostinger:"
echo "  - Acesse CyberPanel → Node.js Apps → Reiniciar"
echo "  - Ou via SSH: pm2 restart backend"

