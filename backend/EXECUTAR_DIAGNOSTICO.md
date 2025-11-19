# 🔍 Como Executar o Diagnóstico

## 📋 Script Criado

O arquivo `backend/diagnostico-rota.sh` foi criado para diagnosticar por que a rota não está funcionando.

## 🚀 Como Usar

### Opção 1: Enviar e Executar no Servidor

```bash
# 1. Enviar o script para o servidor
scp backend/diagnostico-rota.sh root@195.35.16.131:/tmp/

# 2. No servidor, executar:
ssh root@195.35.16.131
chmod +x /tmp/diagnostico-rota.sh
/tmp/diagnostico-rota.sh
```

### Opção 2: Copiar e Colar no Servidor

1. Conecte ao servidor via SSH
2. Copie o conteúdo do arquivo `backend/diagnostico-rota.sh`
3. Cole no terminal do servidor
4. Execute: `bash diagnostico-rota.sh`

### Opção 3: Executar Diretamente

No servidor, execute:

```bash
cd /opt/apps/cursos_plataform/backend

# Verificar qual arquivo o PM2 está rodando
pm2 show cursos-api | grep script

# Verificar se a rota está no arquivo JavaScript
grep -n "create-checkout-session" routes/checkout.routes.js

# Verificar se a rota está no arquivo compilado
grep -n "create-checkout-session" dist/routes/checkout.routes.js

# Verificar logs
pm2 logs cursos-api --lines 30
```

## 🔍 O que o Script Verifica

1. ✅ Qual arquivo o PM2 está executando
2. ✅ Se a rota está em `routes/checkout.routes.js`
3. ✅ Se a rota está em `src/routes/checkout.routes.ts`
4. ✅ Se a rota está em `dist/routes/checkout.routes.js` (compilado)
5. ✅ Como o servidor importa as rotas
6. ✅ Última modificação dos arquivos
7. ✅ Logs do PM2

## ✅ Soluções Comuns

### Se PM2 está rodando `dist/server.js` mas a rota não está compilada:
```bash
npm run build
pm2 restart cursos-api
```

### Se PM2 está rodando `server.js` mas a rota não está no arquivo:
```bash
# Verificar se o arquivo foi atualizado
git log --oneline -1 routes/checkout.routes.js
# Se não, fazer pull ou sincronizar arquivos
pm2 restart cursos-api
```

### Se a rota está no arquivo mas não funciona:
```bash
# Forçar reinicialização completa
pm2 delete cursos-api
pm2 start server.js --name cursos-api
# ou
pm2 start dist/server.js --name cursos-api
```

