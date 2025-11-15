# 🔧 Correção: Permission Denied for Table Users

## Problema
O erro "permission denied for table users" ocorre porque o TypeORM não está usando o schema `cursos` corretamente.

## Solução

### 1. Verificar se o search_path está configurado

Execute no servidor:

```bash
ssh root@195.35.16.131
cd /opt/storylinker/cursos_plataform/backend

# Verificar se DB_SCHEMA_PROD está configurado
grep DB_SCHEMA_PROD .env

# Verificar se NODE_ENV está como production
grep NODE_ENV .env
```

### 2. Garantir que o search_path seja configurado

O código já foi atualizado para configurar o `search_path` após a conexão. Mas se ainda não funcionar, execute:

```sql
-- Conectar como postgres
psql -h localhost -p 5433 -U postgres -d ndx_sisaatech

-- Configurar search_path padrão para o usuário
ALTER USER ndx_admin SET search_path TO cursos, public;
```

### 3. Verificar permissões

```sql
-- Verificar permissões
SELECT 
    table_schema,
    table_name,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'SELECT') as can_select,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'INSERT') as can_insert
FROM information_schema.tables 
WHERE table_schema = 'cursos' 
AND table_name = 'users';
```

### 4. Se necessário, conceder permissões novamente

```sql
GRANT USAGE ON SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cursos TO ndx_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA cursos GRANT ALL ON TABLES TO ndx_admin;
```

### 5. Reiniciar o backend

```bash
pm2 restart all --update-env
pm2 logs cursos-api --lines 50
```

## Verificação

Após reiniciar, verifique os logs. Você deve ver:
```
✅ Conectado ao PostgreSQL
📊 Banco de dados: ndx_sisaatech
📂 Schema configurado: cursos
```

Se não aparecer "📂 Schema configurado", o problema pode ser que `NODE_ENV` não está como `production` ou `DB_SCHEMA_PROD` não está configurado.

