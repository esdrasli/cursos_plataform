# 🚀 Deploy da Rota de Checkout - Guia Rápido

## ⚠️ Problema
A rota `/api/checkout/create-checkout-session` foi adicionada localmente, mas o servidor de produção ainda não tem essa atualização.

## ✅ Solução: 3 Métodos

### Método 1: Via SSH (Mais Rápido)

```bash
# 1. Enviar arquivo para o servidor
scp backend/routes/checkout.routes.js root@195.35.16.131:/tmp/checkout.routes.js

# 2. Conectar ao servidor
ssh root@195.35.16.131
# Senha: SisaaTTech1@

# 3. No servidor, encontrar o diretório do backend
BACKEND_DIR=$(find /home -type d -name "backend" 2>/dev/null | head -1)
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /var/www -type d -name "backend" 2>/dev/null | head -1)
fi
if [ -z "$BACKEND_DIR" ]; then
    BACKEND_DIR=$(find /opt -type d -name "backend" 2>/dev/null | head -1)
fi

echo "Backend encontrado em: $BACKEND_DIR"
cd "$BACKEND_DIR"

# 4. Fazer backup
cp routes/checkout.routes.js routes/checkout.routes.js.backup.$(date +%Y%m%d_%H%M%S)

# 5. Copiar arquivo novo
cp /tmp/checkout.routes.js routes/checkout.routes.js

# 6. Reiniciar backend
pm2 restart backend
# ou
docker restart $(docker ps --format '{{.Names}}' | grep backend | head -1)

# 7. Verificar logs
pm2 logs backend --lines 20
```

### Método 2: Via File Manager (Mais Fácil)

1. **Acesse**: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
2. **Navegue** até: `/home/ndx.sisaatech.com/backend/routes/` (ou caminho similar)
3. **Faça upload** do arquivo `backend/routes/checkout.routes.js` do seu computador
4. **Substitua** o arquivo antigo
5. **Reinicie** o backend:
   - Via CyberPanel → Node.js Apps → Reiniciar
   - Ou no terminal do File Manager: `pm2 restart backend`

### Método 3: Editar Diretamente no Servidor

1. **Acesse** o File Manager: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
2. **Navegue** até `backend/routes/checkout.routes.js`
3. **Edite** o arquivo e adicione as rotas faltantes:

```javascript
// Adicionar no topo (após os imports)
import Stripe from 'stripe';

// Adicionar antes do export default router (após a rota /course/:courseId)
// Criar Checkout Session do Stripe (embedded)
router.post('/create-checkout-session', authenticate, async (req, res) => {
  // ... (copiar todo o código da rota do arquivo local)
});

// Verificar status da sessão de checkout
router.get('/session-status', authenticate, async (req, res) => {
  // ... (copiar todo o código da rota do arquivo local)
});
```

4. **Salve** o arquivo
5. **Reinicie** o backend

## 🧪 Verificar se Funcionou

Após reiniciar, teste:

```bash
curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"courseId":"test"}'
```

**Se retornar um erro diferente de 404** (como 400, 401, ou 500) = ✅ **Rota está funcionando!**

## 📋 Arquivo Completo

O arquivo `backend/routes/checkout.routes.js` local já está atualizado com:
- ✅ Import do Stripe
- ✅ Rota `POST /create-checkout-session`
- ✅ Rota `GET /session-status`
- ✅ Comentários ESLint

Basta copiar o arquivo completo para o servidor.

