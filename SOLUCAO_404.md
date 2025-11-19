# 🔧 Solução para Erro 404 em Produção

## ✅ Status
- **GitHub Actions**: Deploy executado com sucesso (16 minutos atrás)
- **Código**: Correto e commitado
- **Produção**: Ainda retorna 404

## 🔍 Diagnóstico

O deploy foi executado, mas a rota ainda não funciona. Isso indica que:

1. **PM2 pode não ter reiniciado corretamente**
2. **Servidor pode estar usando cache antigo**
3. **Build pode não ter incluído a rota**

## ✅ Soluções

### Opção 1: Verificar Logs do PM2 (Recomendado)

Se tiver acesso SSH ao servidor:

```bash
ssh usuario@195.35.16.131
cd /opt/storylinker/cursos_plataform/backend

# Ver qual arquivo está rodando
pm2 show cursos-api

# Ver logs
pm2 logs cursos-api --lines 50

# Verificar se a rota está no arquivo compilado
grep "create-checkout-session" dist/routes/checkout.routes.js

# Se não estiver, fazer build manual
npm run build
pm2 restart cursos-api
```

### Opção 2: Forçar Reinicialização Completa

```bash
# No servidor
cd /opt/storylinker/cursos_plataform/backend

# Parar completamente
pm2 delete cursos-api

# Fazer pull e build
git pull origin main
npm install
npm run build

# Reiniciar
pm2 start dist/server.js --name cursos-api
# ou
pm2 start server.js --name cursos-api
```

### Opção 3: Verificar Qual Arquivo Está Sendo Usado

O PM2 pode estar configurado para rodar:
- `server.js` (JavaScript) - ✅ tem a rota
- `dist/server.js` (TypeScript compilado) - precisa verificar

```bash
pm2 show cursos-api | grep "script"
```

### Opção 4: Verificar se o Build Incluiu a Rota

```bash
cd /opt/storylinker/cursos_plataform/backend

# Verificar se o arquivo compilado existe
ls -la dist/routes/checkout.routes.js

# Verificar se tem a rota
grep -n "create-checkout-session" dist/routes/checkout.routes.js
```

## 🚀 Ação Imediata

Como o deploy foi executado há 16 minutos, o problema provavelmente é:

1. **PM2 não reiniciou** - Execute manualmente:
   ```bash
   pm2 restart cursos-api
   ```

2. **Build não foi executado** - Execute manualmente:
   ```bash
   cd /opt/storylinker/cursos_plataform/backend
   npm run build
   pm2 restart cursos-api
   ```

## 📋 Checklist

- [ ] Verificar logs do PM2
- [ ] Verificar qual arquivo está rodando
- [ ] Verificar se o build foi executado
- [ ] Verificar se a rota está no arquivo compilado
- [ ] Reiniciar PM2 manualmente

