# Verificar Tabelas no Banco de Produção

Este guia explica como verificar se todas as tabelas necessárias existem no banco de dados de produção.

## Opção 1: Executar Script Node.js (Recomendado)

### Passo 1: Configurar variáveis de ambiente

Configure as credenciais do banco de produção:

```bash
export DB_HOST=seu_host_producao
export DB_PORT=5432
export DB_USER=seu_usuario
export DB_PASSWORD=sua_senha
export DB_NAME=nome_do_banco
```

### Passo 2: Executar verificação

```bash
cd backend
npm run check-tables
```

### Ou executar em uma linha:

```bash
DB_HOST=seu_host DB_USER=seu_user DB_PASSWORD=sua_senha DB_NAME=seu_banco npm run check-tables
```

## Opção 2: Executar SQL diretamente no banco

### Via DBeaver ou cliente PostgreSQL:

1. Conecte-se ao banco de produção
2. Execute o arquivo: `backend/create_all_tables.sql`
3. Ou execute a query abaixo para verificar:

```sql
-- Verificar tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar tabelas necessárias
SELECT 
    CASE 
        WHEN table_name IN (
            'users', 'courses', 'enrollments', 'sales', 
            'landing_pages', 'affiliates', 'affiliate_sales', 
            'app_configs', 'brandings', 'user_enrolled_courses'
        ) THEN '✅ ' || table_name || ' - EXISTE'
        ELSE '❌ ' || table_name || ' - FALTANDO'
    END as status
FROM (
    SELECT unnest(ARRAY[
        'users', 'courses', 'enrollments', 'sales', 
        'landing_pages', 'affiliates', 'affiliate_sales', 
        'app_configs', 'brandings', 'user_enrolled_courses'
    ]) as table_name
) required
LEFT JOIN information_schema.tables t 
    ON t.table_name = required.table_name 
    AND t.table_schema = 'public'
ORDER BY required.table_name;
```

## Opção 3: Criar todas as tabelas

Se faltarem tabelas, execute o script SQL completo:

1. Abra o arquivo `backend/create_all_tables.sql`
2. Execute no banco de produção via DBeaver ou psql

### Via psql:

```bash
psql -h seu_host -U seu_usuario -d seu_banco -f backend/create_all_tables.sql
```

## Tabelas Necessárias

O banco deve ter estas 10 tabelas:

1. `users` - Usuários do sistema
2. `courses` - Cursos
3. `enrollments` - Matrículas
4. `sales` - Vendas
5. `landing_pages` - Páginas de destino
6. `affiliates` - Afiliados
7. `affiliate_sales` - Vendas de afiliados
8. `app_configs` - Configurações da aplicação
9. `brandings` - Personalização visual
10. `user_enrolled_courses` - Relação usuários-cursos

## ENUMs Necessários

O banco deve ter estes 8 ENUMs:

1. `users_role_enum` - Roles dos usuários
2. `courses_level_enum` - Níveis dos cursos
3. `courses_status_enum` - Status dos cursos
4. `sales_paymentmethod_enum` - Métodos de pagamento
5. `sales_status_enum` - Status das vendas
6. `landing_pages_status_enum` - Status das landing pages
7. `affiliates_status_enum` - Status dos afiliados
8. `affiliate_sales_status_enum` - Status das vendas de afiliados

