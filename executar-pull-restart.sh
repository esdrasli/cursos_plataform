#!/bin/bash
# Script para enviar e executar pull-and-restart.sh no servidor

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="195.35.16.131"
USER="root"
SCRIPT="backend/pull-and-restart.sh"

echo -e "${BLUE}🚀 Enviando e executando script no servidor...${NC}"
echo ""

# Verificar se o script existe
if [ ! -f "$SCRIPT" ]; then
    echo -e "${RED}❌ Script $SCRIPT não encontrado!${NC}"
    exit 1
fi

# Enviar script para o servidor
echo -e "${YELLOW}📤 Enviando script para o servidor...${NC}"
scp "$SCRIPT" "$USER@$SERVER:/tmp/pull-and-restart.sh" || {
    echo -e "${RED}❌ Falha ao enviar script. Verifique a conexão SSH.${NC}"
    exit 1
}

echo -e "${GREEN}✅ Script enviado!${NC}"
echo ""

# Executar script no servidor
echo -e "${YELLOW}▶️  Executando script no servidor...${NC}"
echo -e "${YELLOW}   (Senha: SisaaTTech1@)${NC}"
echo ""

ssh "$USER@$SERVER" << 'ENDSSH'
chmod +x /tmp/pull-and-restart.sh
/tmp/pull-and-restart.sh
ENDSSH

echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"

