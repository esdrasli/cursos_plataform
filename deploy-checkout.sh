#!/bin/bash
# Script para fazer deploy da rota de checkout

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Fazendo deploy da rota de checkout...${NC}"

SERVER="195.35.16.131"
USER="root"
FILE="backend/routes/checkout.routes.js"

# Verificar se o arquivo existe
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ Arquivo $FILE não encontrado!${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Enviando arquivo para o servidor...${NC}"
echo -e "${YELLOW}   (Senha: SisaaTTech1@)${NC}"

# Enviar arquivo
scp "$FILE" "$USER@$SERVER:/tmp/checkout.routes.js"

echo -e "${GREEN}✅ Arquivo enviado!${NC}"
echo -e "${YELLOW}🔧 Configurando no servidor...${NC}"

# Executar comandos no servidor
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

# Backup
if [ -f "routes/checkout.routes.js" ]; then
    cp routes/checkout.routes.js routes/checkout.routes.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado"
fi

# Copiar arquivo novo
cp /tmp/checkout.routes.js routes/checkout.routes.js
echo "✅ Arquivo atualizado"

# Reiniciar backend
echo "🔄 Reiniciando backend..."
if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null | grep -q backend; then
    pm2 restart backend
    echo "✅ Reiniciado via PM2"
elif command -v docker > /dev/null 2>&1 && docker ps 2>/dev/null | grep -q backend; then
    CONTAINER=$(docker ps --format '{{.Names}}' | grep backend | head -1)
    docker restart "$CONTAINER"
    echo "✅ Reiniciado via Docker: $CONTAINER"
elif systemctl list-units --type=service 2>/dev/null | grep -q backend; then
    systemctl restart backend
    echo "✅ Reiniciado via systemd"
else
    echo "⚠️  Não foi possível reiniciar automaticamente"
    echo "   Execute manualmente: pm2 restart backend"
fi

# Limpar
rm -f /tmp/checkout.routes.js
ENDSSH

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo -e "${YELLOW}🧪 Teste a rota:${NC}"
echo "curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer SEU_TOKEN' \\"
echo "  -d '{\"courseId\":\"test\"}'"

