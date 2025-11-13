# 💳 Configuração de Gateway de Pagamento

Este documento explica como configurar o gateway de pagamento para a plataforma de cursos.

## 🎯 Gateways Suportados

- **Mercado Pago** (Recomendado para Brasil)
- **Stripe** (Em desenvolvimento)
- **PagSeguro** (Em desenvolvimento)

## 📋 Configuração do Mercado Pago

### 1. Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br
2. Crie uma conta de vendedor
3. Acesse o painel de desenvolvedores

### 2. Obter Credenciais

1. No painel do Mercado Pago, vá em **Suas integrações**
2. Crie uma nova aplicação
3. Copie as credenciais:
   - **Access Token** (Produção ou Teste)
   - **Public Key** (opcional, para frontend)

### 3. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` do backend:

```env
# Gateway de Pagamento
PAYMENT_GATEWAY=mercadopago
PAYMENT_API_KEY=seu_access_token_aqui
PAYMENT_API_SECRET=opcional
PAYMENT_WEBHOOK_URL=https://seu-dominio.com/api/checkout/webhook
```

### 4. Configurar Webhook

1. No painel do Mercado Pago, vá em **Webhooks**
2. Adicione a URL: `https://seu-dominio.com/api/checkout/webhook`
3. Selecione os eventos:
   - `payment`
   - `payment.updated`

### 5. Testar em Modo Sandbox

Para testes, use as credenciais de **Teste** do Mercado Pago:

- Cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
- PIX de teste: Use o QR Code gerado e simule o pagamento no painel

## 🔧 Como Funciona

### Fluxo de Pagamento

1. **Cliente inicia checkout** → Frontend envia dados do pagamento
2. **Backend processa** → Cria pagamento no gateway
3. **Gateway retorna** → QR Code (PIX), Link (Boleto) ou Aprovação (Cartão)
4. **Webhook recebe** → Notificação quando pagamento é confirmado
5. **Sistema atualiza** → Cria matrícula automaticamente

### Métodos de Pagamento

#### 💳 Cartão de Crédito
- Aprovação instantânea
- Suporte a parcelas
- Matrícula criada imediatamente

#### 📱 PIX
- Gera QR Code
- Cliente paga no app do banco
- Webhook confirma pagamento
- Matrícula criada automaticamente

#### 🧾 Boleto
- Gera boleto bancário
- Cliente paga até vencimento
- Webhook confirma pagamento
- Matrícula criada automaticamente

## 🧪 Testando

### Teste Local com ngrok

Para testar webhooks localmente:

1. Instale o ngrok: https://ngrok.com
2. Execute: `ngrok http 3001`
3. Use a URL do ngrok no `PAYMENT_WEBHOOK_URL`
4. Configure essa URL no painel do Mercado Pago

### Cartões de Teste

**Visa aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
```

**Visa recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
```

## 📝 Variáveis de Ambiente

```env
# Gateway (mercadopago, stripe, pagseguro)
PAYMENT_GATEWAY=mercadopago

# Credenciais do Mercado Pago
PAYMENT_API_KEY=APP_USR-xxxxx-xxxxx
PAYMENT_API_SECRET=opcional

# URL do webhook (deve ser acessível publicamente)
PAYMENT_WEBHOOK_URL=https://seu-dominio.com/api/checkout/webhook
```

## 🔒 Segurança

- ⚠️ **NUNCA** commite credenciais no Git
- ✅ Use variáveis de ambiente
- ✅ Use HTTPS em produção
- ✅ Valide webhooks (implementar assinatura)
- ✅ Use tokens seguros para cartões (SDK do Mercado Pago no frontend)

## 🚀 Próximos Passos

1. Implementar SDK do Mercado Pago no frontend para tokens seguros
2. Adicionar validação de assinatura nos webhooks
3. Implementar Stripe
4. Implementar PagSeguro
5. Adicionar suporte a mais métodos de pagamento

