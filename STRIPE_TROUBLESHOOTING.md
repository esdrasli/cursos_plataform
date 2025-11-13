# 🔧 Troubleshooting - Stripe Checkout

## Erro: "Something went wrong"

Este erro pode ocorrer por vários motivos. Siga os passos abaixo:

### 1. Verificar Chaves do Stripe

**IMPORTANTE**: A chave pública (Publishable Key) e a chave secreta (Secret Key) devem ser do mesmo ambiente (test ou live) e da mesma conta.

#### Chave Pública (Frontend)
- Deve começar com `pk_test_` (teste) ou `pk_live_` (produção)
- Configurar no `.env` do frontend: `VITE_STRIPE_PUBLIC_KEY=pk_test_...`
- Ou atualizar em `CheckoutStripePage.tsx`

#### Chave Secreta (Backend)
- Deve começar com `sk_test_` (teste) ou `sk_live_` (produção)
- Configurar no `.env` do backend: `STRIPE_SECRET_KEY=sk_test_...`

### 2. Verificar Valor do Curso

O Stripe requer um valor mínimo:
- **BRL**: R$ 0,50 (50 centavos)
- Se o curso tiver valor menor, o checkout falhará

### 3. Verificar Console do Navegador

Abra o console do navegador (F12) e verifique:
- Erros de rede (Network tab)
- Erros de JavaScript (Console tab)
- Mensagens do Stripe

### 4. Verificar Logs do Backend

```bash
docker-compose -f docker-compose.dev.yml logs backend --tail 50 | grep -i "checkout\|stripe\|error"
```

### 5. Testar com Cartão de Teste

Use os cartões de teste do Stripe:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

CVV: qualquer 3 dígitos
Data: qualquer data futura

### 6. Verificar URL de Retorno

A URL de retorno deve ser:
- Acessível publicamente (não localhost em produção)
- HTTPS em produção
- Formato correto: `https://seu-dominio.com/checkout/return?session_id={CHECKOUT_SESSION_ID}`

### 7. Verificar Conta Stripe

- A conta Stripe deve estar ativa
- Verificar se há restrições na conta
- Verificar se o modo de teste está ativado (para chaves de teste)

### 8. Problemas Comuns

#### Erro: "Invalid API Key"
- Verificar se as chaves estão corretas
- Verificar se são do mesmo ambiente (test/live)

#### Erro: "Amount too small"
- Valor mínimo é R$ 0,50
- Verificar se o preço do curso está correto

#### Erro: "Invalid return_url"
- URL deve ser HTTPS em produção
- URL deve ser acessível publicamente

#### Erro: "Customer email required"
- Verificar se o usuário está autenticado
- Verificar se o email do usuário está válido

## Como Testar

1. **Verificar chaves**:
   ```bash
   # Backend
   docker-compose -f docker-compose.dev.yml exec backend cat .env | grep STRIPE
   
   # Frontend - verificar no código ou .env
   ```

2. **Testar endpoint diretamente**:
   ```bash
   curl -X POST http://localhost:3001/api/checkout/create-checkout-session \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"courseId": "ID_DO_CURSO"}'
   ```

3. **Verificar resposta**:
   - Deve retornar `{ "clientSecret": "cs_test_..." }`
   - Se retornar erro, verificar a mensagem

## Próximos Passos

Se o problema persistir:
1. Verificar logs completos do backend
2. Verificar console do navegador
3. Testar com um curso de valor mínimo (R$ 0,50)
4. Verificar se as chaves são da mesma conta Stripe

