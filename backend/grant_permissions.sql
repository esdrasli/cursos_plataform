-- Script para conceder permissões ao usuário ndx_admin
-- Execute este script no DBeaver como administrador ou com usuário que tenha permissões

-- Conceder permissões no schema public
GRANT USAGE ON SCHEMA public TO ndx_admin;
GRANT CREATE ON SCHEMA public TO ndx_admin;

-- Conceder permissões em todas as tabelas existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ndx_admin;

-- Conceder permissões em todas as sequências (para IDs auto-incrementais)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ndx_admin;

-- Conceder permissões em todas as funções
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ndx_admin;

-- Garantir que permissões futuras também sejam aplicadas automaticamente
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ndx_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ndx_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ndx_admin;

-- Verificar permissões concedidas
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'ndx_admin'
AND table_schema = 'public'
ORDER BY table_name, privilege_type;

