#!/bin/bash

# Script de build para produção
# Uso: ./build/build.sh

set -e

echo "🚀 Iniciando build de produção..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"

# Criar diretório de build se não existir
mkdir -p "$BUILD_DIR"

echo -e "${BLUE}📦 Limpando builds anteriores...${NC}"
rm -rf "$BUILD_DIR/frontend" "$BUILD_DIR/backend"

# Build do Frontend
echo -e "${BLUE}🎨 Building frontend...${NC}"
cd "$ROOT_DIR"
npm run build

# Mover build do frontend para pasta build
echo -e "${BLUE}📁 Movendo build do frontend...${NC}"
mkdir -p "$BUILD_DIR/frontend"
cp -r dist/* "$BUILD_DIR/frontend/"

# Build do Backend
echo -e "${BLUE}⚙️  Building backend...${NC}"
cd "$ROOT_DIR/backend"
npm run build

# Mover build do backend para pasta build
echo -e "${BLUE}📁 Movendo build do backend...${NC}"
mkdir -p "$BUILD_DIR/backend"
cp -r dist/* "$BUILD_DIR/backend/"
cp package*.json "$BUILD_DIR/backend/"
cp tsconfig.json "$BUILD_DIR/backend/" 2>/dev/null || true

# Copiar arquivos necessários do backend
if [ -f "$ROOT_DIR/backend/docker-entrypoint.sh" ]; then
  cp "$ROOT_DIR/backend/docker-entrypoint.sh" "$BUILD_DIR/backend/"
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${YELLOW}📂 Builds disponíveis em: $BUILD_DIR${NC}"

