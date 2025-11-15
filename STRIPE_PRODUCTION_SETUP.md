# 🚀 Configuração do Stripe para Produção

## ✅ Configuração Realizada

As chaves de **produção** do Stripe foram configuradas no backend.

### Backend (.env)

```env
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
PAYMENT_API_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
```

⚠️ **NUNCA commite chaves secretas no repositório!**

### Frontend

**IMPORTANTE**: Você precisa configurar a chave pública de produção no frontend.

#### Opção 1: Variável de Ambiente (Recomendado)

Crie um arquivo `.env` na raiz do projeto frontend ou configure no Vite:

```env
VITE_STRIPE_PUBLIC_KEY=pk_live_SUA_CHAVE_PUBLICA_AQUI
```

#### Opção 2: Atualizar no Código

A chave pública está configurada em `src/pages/CheckoutStripePage.tsx` como fallback.

**⚠️ ATENÇÃO**: A chave pública deve corresponder à chave secreta:
- Se a secreta é `sk_live_...`, a pública deve ser `pk_live_...`
- Se a secreta é `sk_test_...`, a pública deve ser `pk_test_...`

## 🔑 Como Obter a Chave Pública de Produção

1. Acesse: https://dashboard.stripe.com
2. Faça login na sua conta
3. Vá em **Developers** → **API keys**
4. Na seção **Publishable key**, copie a chave que começa com `pk_live_`
5. Configure no frontend conforme opções acima

## ✅ Verificações

### 1. Verificar Chaves Correspondem

```bash
# Backend - deve mostrar sk_live_...
docker-compose -f docker-compose.dev.yml exec backend cat .env | grep STRIPE_SECRET_KEY

# Frontend - deve mostrar pk_live_... (mesma conta)
# Verificar no código ou .env do frontend
```

### 2. Testar em Produção

⚠️ **CUIDADO**: Com chaves de produção, você estará processando transações reais!

- Use cartões reais para testar
- Transações serão cobradas de verdade
- Verifique os logs do Stripe Dashboard

### 3. Configurar Webhook de Produção

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Adicione endpoint: `https://seu-dominio.com/api/checkout/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copie o **Signing secret** e adicione ao `.env` do backend:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🔄 Alternar entre Teste e Produção

### Para Teste (Desenvolvimento)
```env
# Backend
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_test_...
PAYMENT_API_KEY=sk_test_...

# Frontend
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Para Produção
```env
# Backend
PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_live_...
PAYMENT_API_KEY=sk_live_...

# Frontend
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

## 📝 Próximos Passos

1. ✅ Backend configurado com chave de produção
2. ⚠️ **PENDENTE**: Configurar chave pública no frontend
3. ⚠️ **PENDENTE**: Configurar webhook de produção
4. ⚠️ **PENDENTE**: Testar com transação real (cuidado!)

## ⚠️ Avisos Importantes

- **Nunca** exponha a chave secreta no frontend
- **Sempre** use HTTPS em produção
- **Configure** o webhook secret para segurança
- **Monitore** as transações no Stripe Dashboard
- **Teste** primeiro com valores pequenos

