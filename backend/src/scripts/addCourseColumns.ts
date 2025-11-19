import { AppDataSource } from '../config/database.js';

async function addCourseColumns() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('🔄 Adicionando colunas faltantes na tabela courses...');

    // Adicionar coluna sections
    await queryRunner.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'cursos' 
              AND table_name = 'courses' 
              AND column_name = 'sections'
          ) THEN
              ALTER TABLE cursos.courses ADD COLUMN sections JSONB;
              RAISE NOTICE 'Coluna sections adicionada';
          ELSE
              RAISE NOTICE 'Coluna sections já existe';
          END IF;
      END $$;
    `);
    console.log('✅ Coluna sections verificada/adicionada');

    // Adicionar coluna platformConfig
    await queryRunner.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'cursos' 
              AND table_name = 'courses' 
              AND column_name = 'platformConfig'
          ) THEN
              ALTER TABLE cursos.courses ADD COLUMN "platformConfig" JSONB;
              RAISE NOTICE 'Coluna platformConfig adicionada';
          ELSE
              RAISE NOTICE 'Coluna platformConfig já existe';
          END IF;
      END $$;
    `);
    console.log('✅ Coluna platformConfig verificada/adicionada');

    // Adicionar coluna customization
    await queryRunner.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'cursos' 
              AND table_name = 'courses' 
              AND column_name = 'customization'
          ) THEN
              ALTER TABLE cursos.courses ADD COLUMN customization JSONB;
              RAISE NOTICE 'Coluna customization adicionada';
          ELSE
              RAISE NOTICE 'Coluna customization já existe';
          END IF;
      END $$;
    `);
    console.log('✅ Coluna customization verificada/adicionada');

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('✅ Migration concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

addCourseColumns();

