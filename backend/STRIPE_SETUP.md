# 💳 Configuração do Stripe

## ✅ Configuração Realizada

A integração com Stripe foi configurada com sucesso!

### Variáveis de Ambiente Configuradas

O arquivo `.env` do backend foi atualizado com:

```env
PAYMENT_GATEWAY=stripe
PAYMENT_API_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
STRIPE_SECRET_KEY=sk_live_SUA_CHAVE_SECRETA_AQUI
PAYMENT_WEBHOOK_URL=http://localhost:3001/api/checkout/webhook
STRIPE_WEBHOOK_SECRET=
```

## 🔧 Configurar Webhook do Stripe

### 1. Acessar Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com
2. Faça login com sua conta

### 2. Criar Webhook Endpoint

1. No dashboard, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/checkout/webhook`
   - **Description**: "Webhook para notificações de pagamento de cursos"
   - **Events to send**: Selecione:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`

### 3. Obter Webhook Secret

1. Após criar o webhook, clique nele
2. Na seção **Signing secret**, copie o secret
3. Adicione ao `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 4. Para Desenvolvimento Local (Stripe CLI)

Se quiser testar localmente:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Fazer login
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3001/api/checkout/webhook
```

O Stripe CLI fornecerá um webhook secret temporário que você pode usar no `.env` durante o desenvolvimento.

## 💳 Métodos de Pagamento Suportados

### Cartão de Crédito
- ✅ Suportado via Payment Intent
- O frontend precisa usar Stripe Elements para processar o cartão de forma segura
- Retorna `client_secret` para confirmação no frontend

### PIX
- ✅ Suportado
- Gera QR Code para pagamento
- Status fica como `pending` até confirmação

### Boleto
- ⚠️ Stripe não suporta boleto diretamente no Brasil
- Usa Payment Link como alternativa

## 🔄 Fluxo de Pagamento

1. **Cliente inicia checkout** → Frontend envia dados
2. **Backend cria Payment Intent** → Retorna `client_secret`
3. **Frontend confirma pagamento** → Usa Stripe.js para processar
4. **Stripe processa** → Aprova ou rejeita
5. **Webhook notifica** → Backend atualiza status e cria matrícula

## 📝 Próximos Passos

1. **Frontend**: Integrar Stripe.js e Stripe Elements
2. **Webhook Secret**: Configurar no dashboard do Stripe
3. **Testes**: Usar cartões de teste do Stripe
4. **Produção**: Atualizar `PAYMENT_WEBHOOK_URL` com URL de produção

## 🧪 Cartões de Teste

Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

CVV: qualquer 3 dígitos
Data: qualquer data futura

## ⚠️ Importante

- A secret key fornecida é de **PRODUÇÃO** (sk_live_...)
- Em desenvolvimento, considere usar chaves de teste (sk_test_...)
- Nunca exponha a secret key no frontend
- Use sempre HTTPS em produção para webhooks

