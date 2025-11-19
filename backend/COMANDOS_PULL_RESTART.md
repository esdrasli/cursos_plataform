# 🚀 Comandos para Pull e Restart no Servidor

## 📋 Script Automático

Criei o arquivo `backend/pull-and-restart.sh` que faz tudo automaticamente.

### Como usar:

```bash
# 1. Enviar script para o servidor
scp backend/pull-and-restart.sh root@195.35.16.131:/tmp/

# 2. No servidor, executar:
ssh root@195.35.16.131
chmod +x /tmp/pull-and-restart.sh
/tmp/pull-and-restart.sh
```

## 📋 Comandos Manuais (Copiar e Colar)

Execute estes comandos diretamente no servidor:

```bash
# 1. Navegar para o backend
cd /opt/apps/cursos_plataform/backend

# 2. Fazer pull
git pull origin main

# 3. Verificar se a rota está presente
grep -n "create-checkout-session" routes/checkout.routes.js

# 4. Instalar dependências (se necessário)
npm install

# 5. Fazer build (se usar TypeScript)
npm run build

# 6. Reiniciar PM2
pm2 restart cursos-api

# 7. Ver logs
pm2 logs cursos-api --lines 20
```

## 🔍 Verificações Rápidas

```bash
# Ver qual arquivo está rodando
pm2 show cursos-api | grep script

# Verificar se a rota está no arquivo
grep "create-checkout-session" routes/checkout.routes.js

# Verificar se está compilado (se usar TypeScript)
grep "create-checkout-session" dist/routes/checkout.routes.js

# Ver status
pm2 status
```

## ⚠️ Se o Git Pull Falhar

Se o `git pull` falhar por falta de chave SSH, você pode:

1. **Usar HTTPS temporariamente:**
   ```bash
   git remote set-url origin https://github.com/esdrasli/cursos_plataform.git
   git pull origin main
   ```

2. **Ou configurar chave SSH no servidor** (recomendado para produção)

## ✅ Após o Restart

Teste a rota:
```bash
curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"courseId":"test"}'
```

Se retornar um erro diferente de 404, a rota está funcionando! ✅

