# ✅ Resumo - Configuração de Produção

## 🎯 O que foi feito

1. ✅ **Tabelas criadas**: Todas as 10 tabelas necessárias foram criadas no banco de produção
2. ✅ **Schema configurado**: Tabelas estão no schema `cursos` (não `public`)
3. ✅ **Código atualizado**: Backend configurado para usar schema `cursos` em produção

## 📋 O que você precisa fazer AGORA

### 1. Adicionar variável no .env do servidor de produção

No servidor onde o backend está rodando, edite o arquivo `.env` e adicione:

```env
DB_SCHEMA_PROD=cursos
```

**OU** execute o script automático (se tiver acesso SSH):

```bash
cd /caminho/do/backend
./setup-prod-env.sh
```

### 2. Reiniciar o backend

```bash
# Se usar Docker
docker restart cursos_backend_prod

# Se usar PM2
pm2 restart backend

# Se usar systemd
sudo systemctl restart backend
```

### 3. Verificar se funcionou

Teste o endpoint que estava dando erro 500:

```bash
curl -X GET http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🔍 Verificação Rápida

Para verificar se as tabelas estão acessíveis:

```bash
cd backend
DB_HOST_PROD=195.35.16.131 \
DB_PORT_PROD=5433 \
DB_USER_PROD=ndx_admin \
DB_PASSWORD_PROD='Ndx@2025!' \
DB_NAME_PROD=ndx_sisaatech \
npm run check-tables-prod
```

## 📊 Status Atual

- ✅ Banco de dados: `ndx_sisaatech` em `195.35.16.131:5433`
- ✅ Schema: `cursos`
- ✅ Tabelas: 10/10 criadas
- ✅ ENUMs: 8/8 criados
- ⏳ Backend: Aguardando configuração de `DB_SCHEMA_PROD=cursos`

## 🚨 Importante

**O erro 500 será resolvido APENAS após:**
1. Adicionar `DB_SCHEMA_PROD=cursos` no `.env` do servidor
2. Reiniciar o backend

Sem isso, o backend continuará procurando tabelas no schema `public` (que não existe).

