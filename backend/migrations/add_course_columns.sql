-- Migration: Adicionar colunas faltantes na tabela courses
-- Execute este script no banco de dados PostgreSQL

SET search_path TO cursos, public;

-- Adicionar coluna sections (seções da página do curso)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'cursos' 
        AND table_name = 'courses' 
        AND column_name = 'sections'
    ) THEN
        ALTER TABLE cursos.courses 
        ADD COLUMN sections JSONB;
        RAISE NOTICE 'Coluna sections adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna sections já existe';
    END IF;
END $$;

-- Adicionar coluna platformConfig (configurações da plataforma)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'cursos' 
        AND table_name = 'courses' 
        AND column_name = 'platformConfig'
    ) THEN
        ALTER TABLE cursos.courses 
        ADD COLUMN "platformConfig" JSONB;
        RAISE NOTICE 'Coluna platformConfig adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna platformConfig já existe';
    END IF;
END $$;

-- Adicionar coluna customization (personalização visual)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'cursos' 
        AND table_name = 'courses' 
        AND column_name = 'customization'
    ) THEN
        ALTER TABLE cursos.courses 
        ADD COLUMN customization JSONB;
        RAISE NOTICE 'Coluna customization adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna customization já existe';
    END IF;
END $$;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'cursos' 
AND table_name = 'courses'
AND column_name IN ('sections', 'platformConfig', 'customization')
ORDER BY column_name;

