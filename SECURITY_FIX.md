# 🔒 Correção de Segurança - Chaves Secretas

## ⚠️ Problema Detectado

O GitHub detectou chaves secretas do Stripe no repositório. Isso é um **risco de segurança crítico**.

## ✅ Correções Aplicadas

1. ✅ Removida chave pública hardcoded de `CheckoutStripePage.tsx`
2. ✅ Removidas chaves secretas dos arquivos de documentação
3. ✅ Atualizado `.gitignore` para garantir que `.env` não seja commitado
4. ✅ Criados arquivos `.env.example` como template

## 🔧 Ações Necessárias

### 1. Revogar Chaves Expostas

**IMPORTANTE**: Se as chaves foram commitadas, você DEVE revogá-las no Stripe:

1. Acesse: https://dashboard.stripe.com/apikeys
2. Revogue TODAS as chaves que foram expostas no repositório
3. Crie novas chaves no Stripe Dashboard
4. ⚠️ **IMPORTANTE**: Verifique o histórico do Git para identificar todas as chaves expostas
5. Atualize o arquivo `.env` com as novas chaves

### 2. Remover Chaves do Histórico do Git (Se Necessário)

Se as chaves foram commitadas em commits anteriores, você precisa removê-las do histórico:

```bash
# Opção 1: Usar git-filter-repo (recomendado)
git filter-repo --invert-paths --path STRIPE_PRODUCTION_SETUP.md --path backend/STRIPE_SETUP.md

# Opção 2: Usar BFG Repo-Cleaner
bfg --replace-text passwords.txt

# Opção 3: Reverter commits específicos (se ainda não foram pushados)
git revert <commit-hash>
```

### 3. Configurar Novas Chaves

Após revogar as chaves antigas:

1. **Backend** (`backend/.env`):
   ```env
   STRIPE_SECRET_KEY=sk_live_NOVA_CHAVE_AQUI
   PAYMENT_API_KEY=sk_live_NOVA_CHAVE_AQUI
   ```

2. **Frontend** (`.env` na raiz):
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_live_NOVA_CHAVE_PUBLICA_AQUI
   ```

### 4. Verificar Arquivos Seguros

```bash
# Verificar se .env está no .gitignore
git check-ignore backend/.env .env

# Verificar se há chaves em arquivos rastreados
git grep -i "sk_live_\|pk_live_" -- ':!*.md' ':!*.example'
```

## 📋 Checklist de Segurança

- [ ] Revogar chaves expostas no Stripe Dashboard
- [ ] Criar novas chaves no Stripe
- [ ] Atualizar `.env` com novas chaves
- [ ] Verificar que `.env` está no `.gitignore`
- [ ] Remover chaves do histórico do Git (se necessário)
- [ ] Fazer push das correções
- [ ] Monitorar transações no Stripe Dashboard

## 🚨 Avisos Importantes

1. **NUNCA** commite arquivos `.env` com chaves reais
2. **SEMPRE** use `.env.example` como template
3. **REVOGUE** imediatamente chaves expostas
4. **MONITORE** transações suspeitas no Stripe
5. **USE** chaves de teste em desenvolvimento

## 📚 Recursos

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

