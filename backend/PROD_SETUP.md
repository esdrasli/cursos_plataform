# Configuração do Banco de Dados em Produção

## ✅ Status Atual

- **Tabelas criadas**: 10/10 ✅
- **ENUMs criados**: 8/8 ✅
- **Schema**: `cursos` (não `public`)
- **Banco**: `ndx_sisaatech` em `195.35.16.131:5433`

## 🔧 Configuração Necessária

### 1. Adicionar variável de ambiente no servidor de produção

No arquivo `.env` do backend em produção, adicione:

```env
DB_SCHEMA_PROD=cursos
```

Ou se preferir usar apenas uma variável:

```env
DB_SCHEMA=cursos
```

### 2. Variáveis de ambiente completas para produção

```env
# Database
DB_HOST=195.35.16.131
DB_PORT=5433
DB_USER=ndx_admin
DB_PASSWORD=Ndx@2025!
DB_NAME=ndx_sisaatech
DB_SCHEMA_PROD=cursos

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_aqui

# FTP (para upload de vídeos)
SFTP_HOST=195.35.16.131
SFTP_PORT=21
SFTP_USERNAME=admin_user
SFTP_PASSWORD=sua_senha_ftp
```

### 3. Reiniciar o backend

Após atualizar o `.env`, reinicie o serviço do backend:

```bash
# Se estiver usando Docker
docker restart cursos_backend_prod

# Se estiver usando PM2
pm2 restart backend

# Se estiver usando systemd
sudo systemctl restart backend
```

## 🧪 Testar Conexão

Após reiniciar, teste se a API está funcionando:

```bash
# Testar endpoint de cursos
curl -X GET http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📋 Verificação de Tabelas

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

## 🔍 Troubleshooting

### Erro: "relation does not exist"
- Verifique se `DB_SCHEMA_PROD=cursos` está no `.env`
- Verifique se o backend foi reiniciado após atualizar o `.env`

### Erro: "permission denied"
- As tabelas estão no schema `cursos`, não `public`
- Certifique-se de que o usuário `ndx_admin` tem acesso ao schema `cursos`

### Erro: "schema cursos does not exist"
- Execute: `CREATE SCHEMA IF NOT EXISTS cursos;` no banco
- Ou verifique se o schema foi criado corretamente

