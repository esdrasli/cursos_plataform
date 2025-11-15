-- Script para corrigir permissões no schema cursos
-- Execute este script no banco de dados como superusuário (postgres)

-- Conceder permissões no schema cursos
GRANT USAGE ON SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON SCHEMA cursos TO ndx_admin;

-- Conceder permissões em todas as tabelas do schema cursos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cursos TO ndx_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cursos TO ndx_admin;

-- Conceder permissões em tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA cursos GRANT ALL ON TABLES TO ndx_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA cursos GRANT ALL ON SEQUENCES TO ndx_admin;

-- Verificar permissões
SELECT 
    table_name,
    has_table_privilege('ndx_admin', 'cursos.' || table_name, 'SELECT') as can_select,
    has_table_privilege('ndx_admin', 'cursos.' || table_name, 'INSERT') as can_insert,
    has_table_privilege('ndx_admin', 'cursos.' || table_name, 'UPDATE') as can_update,
    has_table_privilege('ndx_admin', 'cursos.' || table_name, 'DELETE') as can_delete
FROM information_schema.tables 
WHERE table_schema = 'cursos'
ORDER BY table_name;

