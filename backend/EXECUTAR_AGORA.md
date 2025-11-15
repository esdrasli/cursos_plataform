# ⚡ EXECUTAR AGORA - Configuração do Servidor

## 🎯 O que fazer

Adicionar `DB_SCHEMA_PROD=cursos` no arquivo `.env` do backend em produção e reiniciar.

## 🚀 Método Rápido (Escolha um)

### Método 1: Via File Manager da Hostinger (Mais Fácil)

1. **Acesse**: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
2. **Navegue** até a pasta do backend (geralmente `/home/ndx.sisaatech.com/backend` ou similar)
3. **Clique** no arquivo `.env` → **Editar**
4. **Adicione** no final do arquivo:
   ```
   DB_SCHEMA_PROD=cursos
   ```
5. **Salve** o arquivo
6. **Reinicie** o backend (via CyberPanel → Node.js Apps ou terminal)

### Método 2: Via SSH

```bash
# 1. Conectar
ssh usuario@195.35.16.131

# 2. Ir para o backend
cd /caminho/do/backend

# 3. Editar .env
nano .env
# Adicione: DB_SCHEMA_PROD=cursos
# Salve: Ctrl+O, Enter, Ctrl+X

# 4. Reiniciar
docker restart cursos_backend_prod
# ou
pm2 restart backend
```

### Método 3: Script Automático (se tiver SSH)

```bash
# No servidor, execute:
cd /caminho/do/backend
./configure-prod-server.sh
```

## ✅ Verificar se funcionou

Após reiniciar, teste:

```bash
curl http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Se retornar dados (não erro 500) = ✅ SUCESSO!**

## 📋 Conteúdo do .env (exemplo)

```env
# Database
DB_HOST=195.35.16.131
DB_PORT=5433
DB_USER=ndx_admin
DB_PASSWORD=Ndx@2025!
DB_NAME=ndx_sisaatech
DB_SCHEMA_PROD=cursos  ← ADICIONAR ESTA LINHA

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=seu_jwt_secret
```

## ⚠️ Importante

- **A linha deve ser exatamente**: `DB_SCHEMA_PROD=cursos`
- **Sem espaços** antes ou depois do `=`
- **Reinicie o backend** após adicionar
- **Verifique os logs** se ainda houver erro

