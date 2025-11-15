-- Script para corrigir permissões e configurar search_path
-- Execute como superusuário (postgres)

-- 1. Configurar search_path padrão para o usuário ndx_admin
-- Isso garante que todas as conexões usem automaticamente o schema 'cursos'
ALTER USER ndx_admin SET search_path TO cursos, public;

-- 2. Garantir permissões no schema
GRANT USAGE ON SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON SCHEMA cursos TO ndx_admin;

-- 3. Garantir permissões em todas as tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cursos TO ndx_admin;

-- 4. Garantir permissões em tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA cursos GRANT ALL ON TABLES TO ndx_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA cursos GRANT ALL ON SEQUENCES TO ndx_admin;

-- 5. Verificar configuração
SELECT 
    usename,
    useconfig
FROM pg_user 
WHERE usename = 'ndx_admin';

-- 6. Verificar permissões
SELECT 
    table_schema,
    table_name,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'SELECT') as can_select,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'INSERT') as can_insert,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'UPDATE') as can_update,
    has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'DELETE') as can_delete
FROM information_schema.tables 
WHERE table_schema = 'cursos'
ORDER BY table_name;

