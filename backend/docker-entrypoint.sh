#!/bin/sh
set -e

echo "🚀 Iniciando backend..."

# Build do TypeScript
echo "📦 Compilando TypeScript..."
npm run build

# Verificar se o banco já tem dados
echo "🔍 Verificando banco de dados..."
if [ "$SKIP_SEED" != "true" ]; then
  echo "🌱 Executando seed..."
  npm run seed || echo "⚠️ Seed falhou ou dados já existem (isso é OK, continuando...) "
else
  echo "⏭️ Seed pulado (SKIP_SEED=true)"
fi

# Iniciar servidor
echo "✅ Iniciando servidor..."
exec npm start

