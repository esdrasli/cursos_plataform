#!/bin/bash
# Script para fazer pull e reiniciar a aplicação no servidor
# Execute no servidor: bash pull-and-restart.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔄 Fazendo pull e reiniciando aplicação...${NC}"
echo ""

# Encontrar diretório do backend
BACKEND_DIR="/opt/apps/cursos_plataform/backend"
if [ ! -d "$BACKEND_DIR" ]; then
    BACKEND_DIR="/opt/storylinker/cursos_plataform/backend"
fi
if [ ! -d "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /opt /home /var/www -type d -name "backend" 2>/dev/null | grep -i cursos | head -1)
fi

if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Diretório do backend não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório encontrado: $BACKEND_DIR${NC}"
cd "$BACKEND_DIR"
echo ""

# Verificar status antes do pull
echo -e "${YELLOW}📋 Status antes do pull:${NC}"
git status --short || echo "⚠️  Não é um repositório git ou git não está disponível"
echo ""

# Fazer pull
echo -e "${YELLOW}📥 Fazendo pull do repositório...${NC}"
git fetch origin main 2>/dev/null || echo "⚠️  Git fetch falhou (pode ser normal se não houver chave SSH)"
git pull origin main 2>/dev/null || {
    echo -e "${RED}❌ Git pull falhou!${NC}"
    echo "⚠️  Tentando continuar mesmo assim..."
}
echo ""

# Verificar se a rota está presente
echo -e "${YELLOW}🔍 Verificando se a rota create-checkout-session existe...${NC}"
if grep -q "create-checkout-session" routes/checkout.routes.js 2>/dev/null; then
    echo -e "${GREEN}✅ Rota encontrada em routes/checkout.routes.js${NC}"
elif grep -q "create-checkout-session" src/routes/checkout.routes.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Rota encontrada em src/routes/checkout.routes.ts${NC}"
else
    echo -e "${RED}❌ Rota NÃO encontrada!${NC}"
fi
echo ""

# Instalar dependências se necessário
echo -e "${YELLOW}📦 Verificando dependências...${NC}"
if [ -f "package.json" ]; then
    npm install --production=false
else
    echo "⚠️  package.json não encontrado"
fi
echo ""

# Fazer build se usar TypeScript
if [ -f "tsconfig.json" ]; then
    echo -e "${YELLOW}🔨 Fazendo build TypeScript...${NC}"
    npm run build
    
    # Verificar se a rota está no arquivo compilado
    if [ -f "dist/routes/checkout.routes.js" ]; then
        if grep -q "create-checkout-session" dist/routes/checkout.routes.js; then
            echo -e "${GREEN}✅ Rota encontrada no arquivo compilado${NC}"
        else
            echo -e "${RED}❌ Rota NÃO encontrada no arquivo compilado!${NC}"
        fi
    fi
    echo ""
fi

# Encontrar e reiniciar PM2
echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)

if [ -z "$PM2_APP" ]; then
    echo -e "${RED}❌ Processo PM2 não encontrado!${NC}"
    echo "📋 Processos PM2 disponíveis:"
    pm2 list
    exit 1
fi

echo -e "${GREEN}✅ Processo encontrado: $PM2_APP${NC}"

# Mostrar qual arquivo está rodando
echo "📋 Arquivo em execução:"
pm2 show "$PM2_APP" | grep -E "script|exec_mode" || true
echo ""

# Reiniciar
echo -e "${YELLOW}🔄 Reiniciando PM2...${NC}"
pm2 restart "$PM2_APP" --update-env

# Aguardar
sleep 3

# Verificar status
echo -e "${GREEN}📊 Status do PM2:${NC}"
pm2 status

# Mostrar logs
echo ""
echo -e "${YELLOW}📋 Últimas linhas do log:${NC}"
pm2 logs "$PM2_APP" --lines 15 --nostream || true

echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"
echo ""
echo -e "${BLUE}🧪 Teste a rota:${NC}"
echo "curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer SEU_TOKEN' \\"
echo "  -d '{\"courseId\":\"test\"}'"

