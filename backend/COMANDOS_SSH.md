# 🔐 Comandos SSH para Configurar o Servidor

## Credenciais

- **Host**: `195.35.16.131`
- **User**: `root`
- **Password**: `SisaaTTech1@`

## 🚀 Executar Agora

### Opção 1: Copiar e Colar (Mais Rápido)

Conecte via SSH e execute estes comandos:

```bash
ssh root@195.35.16.131
# Digite a senha: SisaaTTech1@
```

Depois execute:

```bash
# Encontrar diretório do backend
BACKEND_DIR=$(find /home -type d -name "backend" 2>/dev/null | head -1)
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /var/www -type d -name "backend" 2>/dev/null | head -1)
fi
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /opt -type d -name "backend" 2>/dev/null | head -1)
fi

echo "Backend encontrado em: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Adicionar DB_SCHEMA_PROD
if grep -q "^DB_SCHEMA_PROD=" .env; then
    sed -i 's/^DB_SCHEMA_PROD=.*/DB_SCHEMA_PROD=cursos/' .env
    echo "✅ DB_SCHEMA_PROD atualizado"
else
    echo "" >> .env
    echo "DB_SCHEMA_PROD=cursos" >> .env
    echo "✅ DB_SCHEMA_PROD adicionado"
fi

# Verificar
echo "📋 Configuração:"
grep "^DB_" .env | grep -v PASSWORD

# Reiniciar
if command -v pm2 > /dev/null 2>&1 && pm2 list | grep -q backend; then
    pm2 restart backend
    echo "✅ Reiniciado via PM2"
elif command -v docker > /dev/null 2>&1 && docker ps | grep -q backend; then
    docker restart $(docker ps --format '{{.Names}}' | grep backend | head -1)
    echo "✅ Reiniciado via Docker"
elif systemctl list-units --type=service 2>/dev/null | grep -q backend; then
    systemctl restart backend
    echo "✅ Reiniciado via systemd"
else
    echo "⚠️  Reinicie manualmente"
fi
```

### Opção 2: Script Automático

Se tiver `expect` instalado:

```bash
cd backend
./configure-prod.expect
```

## ✅ Verificar

Após reiniciar, teste:

```bash
curl http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN"
```

