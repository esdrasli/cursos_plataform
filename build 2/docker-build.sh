#!/bin/bash

# Script para build de imagens Docker para produção
# Uso: ./build/docker-build.sh

set -e

echo "🐳 Building Docker images para produção..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Build do Backend
echo -e "${BLUE}⚙️  Building backend image...${NC}"
cd "$ROOT_DIR/backend"
docker build -f ../build/Dockerfile.backend.prod -t cursos-backend:latest .

# Build do Frontend
echo -e "${BLUE}🎨 Building frontend image...${NC}"
cd "$ROOT_DIR"
docker build -f build/Dockerfile.frontend.prod -t cursos-frontend:latest .

echo -e "${GREEN}✅ Docker images construídas com sucesso!${NC}"
echo -e "${YELLOW}📦 Imagens disponíveis:${NC}"
echo -e "   - cursos-backend:latest"
echo -e "   - cursos-frontend:latest"

