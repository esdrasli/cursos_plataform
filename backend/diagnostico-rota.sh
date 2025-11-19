#!/bin/bash
# Script de diagnóstico para verificar por que a rota não está funcionando
# Execute no servidor: bash diagnostico-rota.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Diagnóstico da Rota create-checkout-session${NC}"
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

echo -e "${GREEN}✅ Diretório: $BACKEND_DIR${NC}"
cd "$BACKEND_DIR"
echo ""

# 1. Verificar qual arquivo o PM2 está rodando
echo -e "${YELLOW}1. Verificando qual arquivo o PM2 está executando:${NC}"
PM2_APP=$(pm2 list | grep -E "cursos-api|backend" | awk '{print $2}' | head -1)

if [ -z "$PM2_APP" ]; then
    echo -e "${RED}❌ Processo PM2 não encontrado!${NC}"
    pm2 list
    exit 1
fi

echo -e "${GREEN}✅ Processo encontrado: $PM2_APP${NC}"
pm2 show "$PM2_APP" | grep -E "script|exec_mode|status|pid" || true
echo ""

# 2. Verificar se a rota está no arquivo JavaScript
echo -e "${YELLOW}2. Verificando routes/checkout.routes.js:${NC}"
if [ -f "routes/checkout.routes.js" ]; then
    if grep -q "create-checkout-session" routes/checkout.routes.js; then
        echo -e "${GREEN}✅ Rota encontrada em routes/checkout.routes.js${NC}"
        grep -n "create-checkout-session" routes/checkout.routes.js | head -3
    else
        echo -e "${RED}❌ Rota NÃO encontrada em routes/checkout.routes.js${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo routes/checkout.routes.js não existe!${NC}"
fi
echo ""

# 3. Verificar se a rota está no arquivo TypeScript
echo -e "${YELLOW}3. Verificando src/routes/checkout.routes.ts:${NC}"
if [ -f "src/routes/checkout.routes.ts" ]; then
    if grep -q "create-checkout-session" src/routes/checkout.routes.ts; then
        echo -e "${GREEN}✅ Rota encontrada em src/routes/checkout.routes.ts${NC}"
        grep -n "create-checkout-session" src/routes/checkout.routes.ts | head -3
    else
        echo -e "${RED}❌ Rota NÃO encontrada em src/routes/checkout.routes.ts${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo src/routes/checkout.routes.ts não existe${NC}"
fi
echo ""

# 4. Verificar se a rota está no arquivo compilado
echo -e "${YELLOW}4. Verificando dist/routes/checkout.routes.js (compilado):${NC}"
if [ -f "dist/routes/checkout.routes.js" ]; then
    if grep -q "create-checkout-session" dist/routes/checkout.routes.js; then
        echo -e "${GREEN}✅ Rota encontrada em dist/routes/checkout.routes.js${NC}"
        grep -n "create-checkout-session" dist/routes/checkout.routes.js | head -3
    else
        echo -e "${RED}❌ Rota NÃO encontrada em dist/routes/checkout.routes.js${NC}"
        echo -e "${YELLOW}⚠️  O build pode estar desatualizado!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo dist/routes/checkout.routes.js não existe${NC}"
fi
echo ""

# 5. Verificar como o servidor está importando as rotas
echo -e "${YELLOW}5. Verificando como o servidor importa as rotas:${NC}"
if [ -f "server.js" ]; then
    echo "📋 server.js:"
    grep -n "checkout" server.js | head -5
fi
if [ -f "dist/server.js" ]; then
    echo "📋 dist/server.js:"
    grep -n "checkout" dist/server.js | head -5
fi
if [ -f "src/server.ts" ]; then
    echo "📋 src/server.ts:"
    grep -n "checkout" src/server.ts | head -5
fi
echo ""

# 6. Verificar última modificação dos arquivos
echo -e "${YELLOW}6. Última modificação dos arquivos:${NC}"
ls -lh routes/checkout.routes.js 2>/dev/null | awk '{print $6, $7, $8, $9}' || echo "Arquivo não existe"
ls -lh src/routes/checkout.routes.ts 2>/dev/null | awk '{print $6, $7, $8, $9}' || echo "Arquivo não existe"
ls -lh dist/routes/checkout.routes.js 2>/dev/null | awk '{print $6, $7, $8, $9}' || echo "Arquivo não existe"
echo ""

# 7. Verificar logs do PM2
echo -e "${YELLOW}7. Últimas linhas do log do PM2:${NC}"
pm2 logs "$PM2_APP" --lines 20 --nostream | tail -10 || true
echo ""

# 8. Recomendações
echo -e "${BLUE}📋 Recomendações:${NC}"
echo ""
if [ -f "dist/routes/checkout.routes.js" ] && ! grep -q "create-checkout-session" dist/routes/checkout.routes.js 2>/dev/null; then
    echo "1. ⚠️  O arquivo compilado não tem a rota. Execute: npm run build"
fi
if [ -f "routes/checkout.routes.js" ] && grep -q "create-checkout-session" routes/checkout.routes.js; then
    PM2_SCRIPT=$(pm2 show "$PM2_APP" | grep "script" | awk '{print $4}' || echo "")
    if [[ "$PM2_SCRIPT" == *"dist/server.js"* ]]; then
        echo "2. ⚠️  PM2 está rodando dist/server.js mas a rota pode não estar compilada"
        echo "   Execute: npm run build && pm2 restart $PM2_APP"
    elif [[ "$PM2_SCRIPT" == *"server.js"* ]]; then
        echo "2. ✅ PM2 está rodando server.js (JavaScript direto)"
        echo "   Execute: pm2 restart $PM2_APP"
    fi
fi

