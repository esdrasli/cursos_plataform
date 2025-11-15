# 🚨 Remover Chaves Secretas do Histórico do Git

## ⚠️ AÇÃO URGENTE NECESSÁRIA

As chaves do Stripe foram commitadas no commit `fc29d80`. Você precisa:

1. **REVOGAR** as chaves no Stripe Dashboard
2. **REMOVER** do histórico do Git
3. **CRIAR** novas chaves

## 🔧 Passo a Passo

### 1. Revogar Chaves no Stripe

1. Acesse: https://dashboard.stripe.com/apikeys
2. Revogue estas chaves (já revogadas):
   - Secret: `sk_live_***REVOGADA***`
   - Public: `pk_live_***REVOGADA***`
3. Crie novas chaves

### 2. Remover do Histórico do Git

#### Opção A: Usar git-filter-repo (Recomendado)

```bash
# Instalar git-filter-repo
pip install git-filter-repo

# Remover chaves do histórico
git filter-repo --replace-text <(echo 'sk_live_***REVOGADA***==>sk_live_REVOGADA')
git filter-repo --replace-text <(echo 'pk_live_***REVOGADA***==>pk_live_REVOGADA')

# Force push (CUIDADO: isso reescreve o histórico)
git push origin --force --all
```

#### Opção B: Usar BFG Repo-Cleaner

```bash
# Criar arquivo com chaves a remover (já revogadas)
echo 'sk_live_***REVOGADA***' > secrets.txt
echo 'pk_live_***REVOGADA***' >> secrets.txt

# Usar BFG
bfg --replace-text secrets.txt

# Limpar
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

#### Opção C: Reverter Commit (Se ainda não foi pushado)

```bash
git revert fc29d80
git push
```

### 3. Atualizar com Novas Chaves

Após criar novas chaves no Stripe:

1. Atualize `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_live_NOVA_CHAVE
   PAYMENT_API_KEY=sk_live_NOVA_CHAVE
   ```

2. Atualize `.env` (raiz):
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_live_NOVA_CHAVE_PUBLICA
   ```

### 4. Verificar

```bash
# Verificar que não há mais chaves no código
git grep -i "sk_live_***REVOGADA***"
git grep -i "pk_live_***REVOGADA***"
```

## ⚠️ AVISOS

- **Force push** reescreve o histórico - avise sua equipe
- **Revogue** as chaves ANTES de fazer push
- **Monitore** transações no Stripe após revogar
- **Nunca** commite chaves novamente

