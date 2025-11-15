#!/bin/bash
# ============================================
# COPIAR E COLAR ESTE SCRIPT NO SERVIDOR
# ============================================
# Execute: ssh root@195.35.16.131
# Depois cole todo este conteúdo

echo "🔧 Configurando backend em produção..."

# Encontrar diretório do backend
BACKEND_DIR=$(find /home /var/www /opt -type d -name "backend" 2>/dev/null | head -1)

if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Diretório do backend não encontrado"
    echo "📋 Procurando em /opt..."
    ls -la /opt/ | head -10
    exit 1
fi

echo "✅ Backend encontrado em: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Verificar .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado"
    ls -la | head -10
    exit 1
fi

# Backup
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
cp .env "$BACKUP_FILE"
echo "✅ Backup criado: $BACKUP_FILE"

# Configurar DB_SCHEMA_PROD
if grep -q "^DB_SCHEMA_PROD=" .env; then
    sed -i 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' .env
    echo "✅ DB_SCHEMA_PROD atualizado para 'cursos'"
else
    echo "" >> .env
    echo "DB_SCHEMA_PROD=cursos" >> .env
    echo "✅ DB_SCHEMA_PROD=cursos adicionado"
fi

echo ""
echo "📋 Configuração atual:"
grep "^DB_SCHEMA_PROD" .env
grep "^DB_HOST\|^DB_NAME\|^DB_USER" .env | head -3

echo ""
echo "🔄 Reiniciando backend..."

# Tentar PM2
if command -v pm2 > /dev/null 2>&1 && pm2 list 2>/dev/null | grep -q backend; then
    pm2 restart backend
    echo "✅ Backend reiniciado via PM2"
    pm2 status | grep backend
# Tentar Docker
elif command -v docker > /dev/null 2>&1 && docker ps 2>/dev/null | grep -q backend; then
    CONTAINER=$(docker ps --format '{{.Names}}' | grep backend | head -1)
    docker restart "$CONTAINER"
    echo "✅ Backend reiniciado via Docker: $CONTAINER"
# Tentar systemd
elif systemctl list-units --type=service 2>/dev/null | grep -q backend; then
    systemctl restart backend
    echo "✅ Backend reiniciado via systemd"
    systemctl status backend --no-pager | head -5
else
    echo "⚠️  Não foi possível reiniciar automaticamente"
    echo "   Reinicie manualmente:"
    echo "   - PM2: pm2 restart backend"
    echo "   - Docker: docker restart <container>"
    echo "   - Systemd: systemctl restart backend"
fi

echo ""
echo "✅ Configuração concluída!"

