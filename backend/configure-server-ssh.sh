#!/bin/bash
# Script para configurar servidor via SSH
# Uso: ./configure-server-ssh.sh

SERVER="195.35.16.131"
USER="root"
PASSWORD="SisaaTTech1@"

echo "🔐 Conectando ao servidor $SERVER..."
echo ""

# Comando para executar no servidor
SSH_COMMANDS=$(cat <<'EOF'
# Encontrar diretório do backend
echo "🔍 Procurando diretório do backend..."
BACKEND_DIR=$(find /home -type d -name "backend" 2>/dev/null | head -1)
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /var/www -type d -name "backend" 2>/dev/null | head -1)
fi
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /opt -type d -name "backend" 2>/dev/null | head -1)
fi

if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Diretório do backend não encontrado"
    echo "📋 Diretórios disponíveis:"
    ls -la /home/ | head -10
    exit 1
fi

echo "✅ Backend encontrado em: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado em $BACKEND_DIR"
    echo "📋 Arquivos no diretório:"
    ls -la | head -10
    exit 1
fi

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup criado"

# Adicionar ou atualizar DB_SCHEMA_PROD
if grep -q "^DB_SCHEMA_PROD=" .env; then
    sed -i 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' .env
    echo "✅ DB_SCHEMA_PROD atualizado para 'cursos'"
else
    echo "" >> .env
    echo "# Schema do banco de dados (produção)" >> .env
    echo "DB_SCHEMA_PROD=cursos" >> .env
    echo "✅ DB_SCHEMA_PROD=cursos adicionado"
fi

echo ""
echo "📋 Configuração atual:"
grep "^DB_" .env | grep -v "PASSWORD" | head -10

echo ""
echo "🔄 Reiniciando backend..."

# Tentar reiniciar via PM2
if command -v pm2 &> /dev/null && pm2 list | grep -q "backend"; then
    pm2 restart backend
    echo "✅ Backend reiniciado via PM2"
    pm2 status
# Tentar reiniciar via Docker
elif command -v docker &> /dev/null && docker ps | grep -q "backend"; then
    BACKEND_CONTAINER=$(docker ps --format '{{.Names}}' | grep backend | head -1)
    docker restart "$BACKEND_CONTAINER"
    echo "✅ Backend reiniciado via Docker: $BACKEND_CONTAINER"
# Tentar reiniciar via systemd
elif systemctl list-units --type=service | grep -q "backend"; then
    systemctl restart backend
    echo "✅ Backend reiniciado via systemd"
else
    echo "⚠️  Não foi possível reiniciar automaticamente"
    echo "   Reinicie manualmente:"
    echo "   - PM2: pm2 restart backend"
    echo "   - Docker: docker restart <container>"
    echo "   - Systemd: systemctl restart backend"
fi

echo ""
echo "✅ Configuração concluída!"
EOF
)

# Tentar conectar e executar
if command -v sshpass &> /dev/null; then
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$SERVER "$SSH_COMMANDS"
else
    echo "⚠️  sshpass não está instalado"
    echo ""
    echo "Execute manualmente no servidor:"
    echo "  ssh root@195.35.16.131"
    echo ""
    echo "E depois execute os comandos do arquivo configure-server-ssh.sh"
    echo ""
    echo "Ou instale sshpass:"
    echo "  macOS: brew install hudochenkov/sshpass/sshpass"
    echo "  Linux: sudo apt-get install sshpass"
fi

