#!/bin/bash
# Script para atualizar o backend no servidor
# Execute no servidor: bash update-server.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔄 Atualizando backend no servidor...${NC}"

# Diretório do backend
BACKEND_DIR="/opt/apps/cursos_plataform/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Diretório não encontrado: $BACKEND_DIR${NC}"
    echo "Procurando em outros locais..."
    BACKEND_DIR=$(find /opt /home /var/www -type d -name "backend" 2>/dev/null | grep -i cursos | head -1)
    if [ -z "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Diretório do backend não encontrado!${NC}"
        exit 1
    fi
    echo -e "${YELLOW}✅ Encontrado em: $BACKEND_DIR${NC}"
fi

cd "$BACKEND_DIR"
echo -e "${GREEN}✅ Diretório: $(pwd)${NC}"

# 1. Fazer pull
echo -e "${YELLOW}📥 Fazendo pull do repositório...${NC}"
git pull origin main

# 2. Verificar se a rota existe
echo -e "${YELLOW}🔍 Verificando se a rota está presente...${NC}"
if grep -q "create-checkout-session" routes/checkout.routes.js 2>/dev/null; then
    echo -e "${GREEN}✅ Rota encontrada em routes/checkout.routes.js${NC}"
elif grep -q "create-checkout-session" src/routes/checkout.routes.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Rota encontrada em src/routes/checkout.routes.ts${NC}"
else
    echo -e "${RED}❌ Rota não encontrada!${NC}"
fi

# 3. Instalar dependências (se necessário)
echo -e "${YELLOW}📦 Verificando dependências...${NC}"
npm install

# 4. Fazer build (se usar TypeScript)
if [ -f "tsconfig.json" ]; then
    echo -e "${YELLOW}🔨 Fazendo build TypeScript...${NC}"
    npm run build
    
    # Verificar se a rota está no arquivo compilado
    if [ -f "dist/routes/checkout.routes.js" ]; then
        if grep -q "create-checkout-session" dist/routes/checkout.routes.js; then
            echo -e "${GREEN}✅ Rota encontrada no arquivo compilado${NC}"
        else
            echo -e "${RED}⚠️  Rota não encontrada no arquivo compilado${NC}"
        fi
    fi
fi

# 5. Verificar PM2
echo -e "${YELLOW}📊 Verificando PM2...${NC}"
if command -v pm2 > /dev/null 2>&1; then
    PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)
    
    if [ -z "$PM2_APP" ]; then
        echo -e "${YELLOW}⚠️  Nenhum processo PM2 encontrado com nome 'cursos-api' ou 'backend'${NC}"
        pm2 list
    else
        echo -e "${GREEN}✅ Processo PM2 encontrado: $PM2_APP${NC}"
        
        # Mostrar qual arquivo está rodando
        echo -e "${YELLOW}📋 Arquivo em execução:${NC}"
        pm2 show "$PM2_APP" | grep -E "script|exec_mode|status" || true
        
        # Reiniciar
        echo -e "${YELLOW}🔄 Reiniciando PM2...${NC}"
        pm2 restart "$PM2_APP"
        
        # Aguardar um pouco
        sleep 2
        
        # Mostrar status
        echo -e "${GREEN}📊 Status do PM2:${NC}"
        pm2 status
        
        # Mostrar últimas linhas do log
        echo -e "${YELLOW}📋 Últimas linhas do log:${NC}"
        pm2 logs "$PM2_APP" --lines 10 --nostream || true
    fi
else
    echo -e "${RED}❌ PM2 não está instalado${NC}"
fi

echo ""
echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo ""
echo -e "${YELLOW}🧪 Teste a rota:${NC}"
echo "curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer SEU_TOKEN' \\"
echo "  -d '{\"courseId\":\"test\"}'"

