# 🔍 Verificação do Deploy em Produção

## ✅ Status Local
- **Local**: Funcionando (200 OK)
- **URL Local**: `http://localhost:5173/api/checkout/create-checkout-session`

## ❌ Status Produção
- **Produção**: Erro 404
- **URL Produção**: `https://api.ndx.sisaatech.com/api/checkout/create-checkout-session`

## 🔍 Possíveis Causas

### 1. Deploy não foi executado ainda
- O commit foi feito, mas o GitHub Actions pode não ter executado
- Verifique: https://github.com/esdrasli/cursos_plataform/actions

### 2. Workflow do GitHub Actions
O workflow está configurado para:
- Diretório: `/opt/storylinker/cursos_plataform/backend`
- Comando PM2: `pm2 restart cursos-api`
- **IMPORTANTE**: O workflow faz `npm run build`, mas o backend usa `server.js` diretamente (não precisa de build)

### 3. Arquivo não foi atualizado no servidor
- O `git pull` pode não ter funcionado
- O arquivo `backend/routes/checkout.routes.js` pode não estar atualizado

### 4. PM2 não reiniciou corretamente
- O processo pode estar usando cache antigo
- Pode precisar de `pm2 delete cursos-api && pm2 start ...`

## ✅ Soluções

### Opção 1: Verificar GitHub Actions
1. Acesse: https://github.com/esdrasli/cursos_plataform/actions
2. Verifique se o último workflow foi executado com sucesso
3. Se falhou, veja os logs para identificar o problema

### Opção 2: Verificar se o arquivo está no servidor
Se tiver acesso SSH:
```bash
ssh usuario@195.35.16.131
cd /opt/storylinker/cursos_plataform/backend
git log --oneline -1
git show HEAD:backend/routes/checkout.routes.js | grep "create-checkout-session"
```

### Opção 3: Forçar novo deploy
Criar um commit que force o deploy:
```bash
git commit --allow-empty -m "chore: force deploy checkout route"
git push origin main
```

### Opção 4: Verificar PM2
Se tiver acesso SSH:
```bash
ssh usuario@195.35.16.131
cd /opt/storylinker/cursos_plataform/backend
pm2 list
pm2 logs cursos-api --lines 50
pm2 restart cursos-api
```

## 📋 Checklist

- [ ] GitHub Actions foi executado?
- [ ] Workflow completou com sucesso?
- [ ] Arquivo está atualizado no servidor?
- [ ] PM2 reiniciou corretamente?
- [ ] Logs do PM2 mostram algum erro?

