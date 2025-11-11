#!/bin/bash

# Script para deploy em produção
# Uso: ./build/deploy.sh

set -e

echo "🚀 Iniciando deploy em produção..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Verificar se arquivo .env existe
if [ ! -f "$ROOT_DIR/.env.production" ]; then
  echo -e "${RED}❌ Arquivo .env.production não encontrado!${NC}"
  echo -e "${YELLOW}💡 Crie um arquivo .env.production com as variáveis necessárias${NC}"
  exit 1
fi

# Carregar variáveis de ambiente
export $(cat "$ROOT_DIR/.env.production" | grep -v '^#' | xargs)

# Build das imagens Docker
echo -e "${BLUE}🐳 Building Docker images...${NC}"
"$ROOT_DIR/build/docker-build.sh"

# Parar containers existentes
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
cd "$ROOT_DIR"
docker-compose -f docker-compose.prod.yml down

# Iniciar containers
echo -e "${BLUE}▶️  Iniciando containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar status
echo -e "${BLUE}📊 Status dos containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${YELLOW}🌐 Aplicação disponível em: ${FRONTEND_URL:-http://localhost}${NC}"

