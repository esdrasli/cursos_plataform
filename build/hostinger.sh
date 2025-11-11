#!/bin/bash

# Script de build específico para Hostinger
# Gera o build na pasta public/

set -e

echo "🚀 Building para Hostinger..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/public"

# Criar diretório public se não existir
mkdir -p "$PUBLIC_DIR"

# Salvar .htaccess e favicon.ico temporariamente se existirem
HTACCESS_TEMP=""
FAVICON_TEMP=""
if [ -f "$PUBLIC_DIR/.htaccess" ]; then
  HTACCESS_TEMP=$(mktemp)
  cp "$PUBLIC_DIR/.htaccess" "$HTACCESS_TEMP"
fi
if [ -f "$PUBLIC_DIR/favicon.ico" ]; then
  FAVICON_TEMP=$(mktemp)
  cp "$PUBLIC_DIR/favicon.ico" "$FAVICON_TEMP"
fi

echo -e "${BLUE}📦 Limpando build anterior...${NC}"
rm -rf "$PUBLIC_DIR"/*

# Build do Frontend
echo -e "${BLUE}🎨 Building frontend...${NC}"
cd "$ROOT_DIR"

# Verificar se existe .env.production
if [ ! -f "$ROOT_DIR/.env.production" ]; then
  echo -e "${YELLOW}⚠️  .env.production não encontrado${NC}"
  echo -e "${YELLOW}💡 Criando .env.production.example como referência${NC}"
  echo -e "${YELLOW}📝 Configure VITE_API_URL no .env.production antes do build${NC}"
fi

# Build com modo produção
npm run build:prod

# Copiar build para pasta public
echo -e "${BLUE}📁 Copiando build para pasta public...${NC}"
cp -r dist/* "$PUBLIC_DIR/"

# Restaurar ou copiar .htaccess
if [ -n "$HTACCESS_TEMP" ] && [ -f "$HTACCESS_TEMP" ]; then
  echo -e "${BLUE}📄 Restaurando .htaccess...${NC}"
  cp "$HTACCESS_TEMP" "$PUBLIC_DIR/.htaccess"
  rm "$HTACCESS_TEMP"
elif [ -f "$ROOT_DIR/public/.htaccess" ]; then
  echo -e "${BLUE}📄 Copiando .htaccess...${NC}"
  cp "$ROOT_DIR/public/.htaccess" "$PUBLIC_DIR/.htaccess"
else
  echo -e "${YELLOW}⚠️  .htaccess não encontrado. Certifique-se de criá-lo.${NC}"
fi

# Restaurar ou copiar favicon.ico
if [ -n "$FAVICON_TEMP" ] && [ -f "$FAVICON_TEMP" ]; then
  echo -e "${BLUE}📄 Restaurando favicon.ico...${NC}"
  cp "$FAVICON_TEMP" "$PUBLIC_DIR/favicon.ico"
  rm "$FAVICON_TEMP"
elif [ -f "$ROOT_DIR/public/favicon.ico" ]; then
  echo -e "${BLUE}📄 Copiando favicon.ico...${NC}"
  cp "$ROOT_DIR/public/favicon.ico" "$PUBLIC_DIR/favicon.ico"
else
  echo -e "${YELLOW}⚠️  favicon.ico não encontrado${NC}"
  echo -e "${YELLOW}💡 Adicione um arquivo favicon.ico na pasta public/ para evitar erro 404${NC}"
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${YELLOW}📂 Arquivos prontos em: $PUBLIC_DIR${NC}"
echo -e "${YELLOW}📤 Faça upload do conteúdo da pasta public/ para a Hostinger${NC}"
