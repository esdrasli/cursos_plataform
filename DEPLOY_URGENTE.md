# 🚨 DEPLOY URGENTE - Rota de Checkout

## ⚠️ Problema
A rota `/api/checkout/create-checkout-session` retorna **404** porque o arquivo não foi atualizado no servidor de produção.

## ✅ Solução: Upload do Arquivo

### Método 1: File Manager (RECOMENDADO - Mais Fácil)

1. **Acesse o File Manager:**
   - URL: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
   - Ou pelo painel da Hostinger/CyberPanel

2. **Navegue até o arquivo:**
   - Procure por: `/home/ndx.sisaatech.com/backend/routes/` (ou caminho similar)
   - Ou procure por: `backend/routes/checkout.routes.js`

3. **Faça upload do arquivo:**
   - No File Manager, clique em **"Upload"** ou **"Enviar arquivo"**
   - Selecione o arquivo do seu computador: `backend/routes/checkout.routes.js`
   - **Substitua** o arquivo antigo

4. **Reinicie o backend:**
   - **Via CyberPanel:** Node.js Apps → Encontre o backend → Clique em **"Restart"**
   - **Ou no terminal do File Manager:**
     ```bash
     pm2 restart backend
     ```

### Método 2: Editar Diretamente no Servidor

1. **Acesse o File Manager:**
   - https://195.35.16.131:8090/filemanager/ndx.sisaatech.com

2. **Navegue até:** `backend/routes/checkout.routes.js`

3. **Edite o arquivo** e adicione no topo (após os imports):
   ```javascript
   import Stripe from 'stripe';
   ```

4. **Adicione as rotas** antes do `export default router`:
   - Copie as rotas `POST /create-checkout-session` e `GET /session-status` do arquivo local

5. **Salve** e **reinicie** o backend

## 📋 Arquivo Local Atualizado

O arquivo `backend/routes/checkout.routes.js` no seu computador já contém:
- ✅ Import do Stripe (linha 9)
- ✅ Rota `POST /create-checkout-session` (linha 107-219)
- ✅ Rota `GET /session-status` (linha 221-255)

**Basta copiar o arquivo completo para o servidor!**

## 🧪 Após o Deploy, Teste:

```bash
curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"courseId":"test"}'
```

**Se retornar um erro diferente de 404** (como 400, 401, ou 500) = ✅ **Rota está funcionando!**

## ⚠️ Nota sobre CSP (Content Security Policy)

Os erros de fontes do Google Fonts são avisos do Stripe e não impedem o funcionamento. Se quiser corrigir, adicione ao CSP:
```
font-src 'self' https://js.stripe.com https://fonts.gstatic.com;
```

Mas isso é secundário - o problema principal é o 404 da rota.

