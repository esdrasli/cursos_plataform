# 💳 Configurar Stripe em Produção

## ⚠️ Erro Atual
```
Stripe não configurado
```

Este erro ocorre quando as variáveis de ambiente do Stripe não estão configuradas no servidor de produção.

## 🚀 Solução Rápida

### Opção 1: Script de Verificação (Recomendado)

Primeiro, verifique o que está faltando:

```bash
cd /opt/apps/cursos_plataform/backend
./scripts/verificar-stripe.sh
```

O script irá mostrar exatamente quais variáveis estão faltando.

### Opção 2: Correção Rápida

Se você já tem as chaves do Stripe, use o script de correção rápida:

```bash
cd /opt/apps/cursos_plataform/backend
./scripts/corrigir-stripe-rapido.sh
```

O script irá solicitar as chaves e configurar automaticamente.

### Opção 3: Configuração Manual Completa

Siga o passo a passo abaixo para configuração manual.

## 🔧 Passo a Passo para Configurar

### 1. Obter Chaves do Stripe

1. Acesse: https://dashboard.stripe.com
2. Faça login na sua conta
3. Vá em **Developers** → **API keys**
4. Na seção **Secret key**, copie a chave que começa com `sk_live_...` (para produção)
5. Na seção **Publishable key**, copie a chave que começa com `pk_live_...` (para o frontend)

⚠️ **IMPORTANTE**: Use chaves de **produção** (`sk_live_` e `pk_live_`) em produção, não chaves de teste!

### 2. Configurar no Servidor de Produção

Conecte-se ao servidor via SSH e edite o arquivo `.env`:

```bash
# Conectar ao servidor
ssh root@seu-servidor

# Navegar para o diretório do backend
cd /opt/apps/cursos_plataform/backend

# Editar o arquivo .env
nano .env
```

Adicione ou atualize as seguintes variáveis:

```env
# Gateway de Pagamento
PAYMENT_GATEWAY=stripe

# Chave Secreta do Stripe (obrigatória)
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI

# Chave de API (pode ser a mesma do Stripe ou outra)
PAYMENT_API_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI

# Webhook Secret (obrigatório para webhooks)
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# URL do Webhook (ajuste para seu domínio)
PAYMENT_WEBHOOK_URL=https://api.ndx.sisaatech.com/api/checkout/webhook
```

### 3. Configurar Webhook no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://api.ndx.sisaatech.com/api/checkout/webhook`
   - **Description**: "Webhook para notificações de pagamento de cursos"
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
4. Após criar, clique no webhook e copie o **Signing secret** (começa com `whsec_...`)
5. Adicione ao `.env` como `STRIPE_WEBHOOK_SECRET`

### 4. Reiniciar o Servidor

Após configurar as variáveis de ambiente:

```bash
# Reiniciar o PM2 para carregar as novas variáveis
pm2 restart cursos-api

# Verificar se está funcionando
pm2 logs cursos-api --lines 30
```

### 5. Verificar Configuração

Teste se o Stripe está configurado corretamente fazendo uma requisição de teste:

```bash
# Verificar se as variáveis estão carregadas (sem mostrar os valores)
pm2 env cursos-api | grep STRIPE
```

Ou teste via API:

```bash
curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"courseId": "ID_DO_CURSO"}'
```

Se retornar erro "Stripe não configurado", verifique:
- ✅ As variáveis estão no arquivo `.env`
- ✅ O arquivo `.env` está no diretório correto (`/opt/apps/cursos_plataform/backend/.env`)
- ✅ O PM2 foi reiniciado após adicionar as variáveis
- ✅ As chaves são de produção (`sk_live_...` e `pk_live_...`)

### 6. Configurar Frontend (Opcional)

Se o frontend também precisa da chave pública do Stripe:

1. No servidor do frontend, edite o arquivo `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_SUA_CHAVE_PUBLICA_AQUI
```

2. Reconstrua o frontend:
```bash
npm run build
```

## 🔍 Troubleshooting

### Erro: "Stripe não configurado"

**Causa**: Variáveis de ambiente não encontradas.

**Solução**:
1. Verifique se o arquivo `.env` existe no diretório do backend
2. Verifique se as variáveis estão escritas corretamente (sem espaços extras)
3. Reinicie o PM2: `pm2 restart cursos-api --update-env`

### Erro: "Invalid API Key"

**Causa**: Chave do Stripe inválida ou de teste em produção.

**Solução**:
1. Verifique se está usando chaves de produção (`sk_live_...`)
2. Verifique se a chave está completa (não cortada)
3. Gere uma nova chave no Stripe Dashboard se necessário

### Webhook não funciona

**Causa**: Webhook secret não configurado ou URL incorreta.

**Solução**:
1. Verifique se `STRIPE_WEBHOOK_SECRET` está no `.env`
2. Verifique se a URL do webhook no Stripe Dashboard está correta
3. Verifique se o servidor está acessível publicamente (não bloqueado por firewall)

## 📝 Checklist

- [ ] Chaves do Stripe obtidas do Dashboard
- [ ] Variáveis adicionadas ao `.env` do backend
- [ ] Webhook configurado no Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` adicionado ao `.env`
- [ ] PM2 reiniciado
- [ ] Teste de criação de checkout session funcionando
- [ ] Frontend configurado com chave pública (se necessário)

## 🔐 Segurança

⚠️ **NUNCA**:
- Commite o arquivo `.env` no repositório
- Compartilhe chaves secretas publicamente
- Use chaves de teste em produção
- Exponha a chave secreta no frontend

✅ **SEMPRE**:
- Use HTTPS em produção
- Mantenha as chaves secretas no servidor
- Revogue chaves comprometidas imediatamente
- Use variáveis de ambiente, não hardcode

