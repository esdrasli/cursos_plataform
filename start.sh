#!/bin/bash

echo "🚀 Iniciando Plataforma de Cursos com Docker..."
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker Desktop."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está instalado."
    exit 1
fi

# Verificar se há argumento
if [ "$1" = "dev" ]; then
    echo "📦 Modo: DESENVOLVIMENTO"
    echo "🔧 Hot-reload ativado"
    echo ""
    docker-compose -f docker-compose.dev.yml up --build
elif [ "$1" = "prod" ] || [ -z "$1" ]; then
    echo "📦 Modo: PRODUÇÃO"
    echo ""
    docker-compose up --build
else
    echo "Uso: ./start.sh [dev|prod]"
    echo ""
    echo "  dev  - Inicia em modo desenvolvimento (hot-reload)"
    echo "  prod - Inicia em modo produção (padrão)"
    exit 1
fi

