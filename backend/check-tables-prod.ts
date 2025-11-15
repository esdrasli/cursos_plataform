// Script para verificar tabelas no banco de produção
// Permite sobrescrever credenciais via variáveis de ambiente
import 'reflect-metadata';
import { AppDataSource } from './src/config/database.js';
import dotenv from 'dotenv';

// Carregar .env primeiro
dotenv.config();

// Permitir sobrescrever com variáveis de ambiente (para produção)
const dbConfig = {
  host: process.env.DB_HOST_PROD || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT_PROD || process.env.DB_PORT || '5432'),
  username: process.env.DB_USER_PROD || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME_PROD || process.env.DB_NAME || 'cursos_plataform',
};

// Tabelas necessárias
const requiredTables = [
  'users',
  'courses',
  'enrollments',
  'sales',
  'landing_pages',
  'affiliates',
  'affiliate_sales',
  'app_configs',
  'brandings',
  'user_enrolled_courses'
];

async function checkTables() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    console.log(`📊 Configuração:`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   User: ${dbConfig.username}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log('');

    // Criar DataSource customizado para produção
    const { DataSource } = await import('typeorm');
    const prodDataSource = new DataSource({
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      logging: false,
    });

    await prodDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');
    console.log('');

    const queryRunner = prodDataSource.createQueryRunner();
    
    // Verificar qual schema usar (cursos ou public)
    const schemaCheck = await queryRunner.query(`
      SELECT 
        has_schema_privilege('${dbConfig.username}', 'public', 'CREATE') as can_create_public,
        has_schema_privilege('${dbConfig.username}', 'cursos', 'CREATE') as can_create_cursos
    `);
    
    const useSchema = schemaCheck[0].can_create_cursos ? 'cursos' : 
                     schemaCheck[0].can_create_public ? 'public' : 'public';
    
    // Listar todas as tabelas no schema correto
    const allTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${useSchema}' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📂 Verificando schema: ${useSchema}`);
    console.log('');

    console.log('📋 TABELAS EXISTENTES NO BANCO:');
    console.log('='.repeat(50));
    if (allTables.length === 0) {
      console.log('❌ Nenhuma tabela encontrada no banco!');
    } else {
      allTables.forEach((row: any) => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }
    console.log('');

    // Verificar tabelas necessárias
    console.log('🔍 VERIFICAÇÃO DE TABELAS NECESSÁRIAS:');
    console.log('='.repeat(50));
    
    const existingTableNames = allTables.map((row: any) => row.table_name);
    const missingTables: string[] = [];
    const existingTables: string[] = [];

    requiredTables.forEach(table => {
      if (existingTableNames.includes(table)) {
        existingTables.push(table);
        console.log(`  ✅ ${table} - EXISTE`);
      } else {
        missingTables.push(table);
        console.log(`  ❌ ${table} - FALTANDO`);
      }
    });

    console.log('');
    console.log('📊 RESUMO:');
    console.log('='.repeat(50));
    console.log(`  Total de tabelas no banco: ${allTables.length}`);
    console.log(`  Tabelas necessárias: ${requiredTables.length}`);
    console.log(`  Tabelas existentes: ${existingTables.length}`);
    console.log(`  Tabelas faltando: ${missingTables.length}`);

    if (missingTables.length > 0) {
      console.log('');
      console.log('⚠️  TABELAS FALTANDO:');
      missingTables.forEach(table => {
        console.log(`    - ${table}`);
      });
      console.log('');
      console.log('💡 SOLUÇÃO:');
      console.log('   Execute o script create_all_tables.sql no banco de dados');
    } else {
      console.log('');
      console.log('✅ Todas as tabelas necessárias estão presentes!');
    }

    // Verificar ENUMs
    console.log('');
    console.log('🔍 VERIFICAÇÃO DE ENUMs:');
    console.log('='.repeat(50));
    
    // Verificar ENUMs (podem estar em qualquer schema)
    const enums = await queryRunner.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${useSchema}' OR nspname = 'public' LIMIT 1)
      ORDER BY typname;
    `);

    const requiredEnums = [
      'users_role_enum',
      'courses_level_enum',
      'courses_status_enum',
      'sales_paymentmethod_enum',
      'sales_status_enum',
      'landing_pages_status_enum',
      'affiliates_status_enum',
      'affiliate_sales_status_enum'
    ];

    const existingEnumNames = enums.map((row: any) => row.typname);
    requiredEnums.forEach(enumName => {
      if (existingEnumNames.includes(enumName)) {
        console.log(`  ✅ ${enumName} - EXISTE`);
      } else {
        console.log(`  ❌ ${enumName} - FALTANDO`);
      }
    });

    await queryRunner.release();
    await prodDataSource.destroy();
    
    process.exit(missingTables.length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   Erro: Não foi possível resolver o host do banco de dados');
      console.error('   Verifique se DB_HOST_PROD está correto');
    } else if (error.code === '28P01') {
      console.error('   Erro: Autenticação falhou');
      console.error('   Verifique DB_USER_PROD e DB_PASSWORD_PROD');
    } else if (error.code === '3D000') {
      console.error('   Erro: Banco de dados não existe');
      console.error('   Verifique se DB_NAME_PROD está correto');
    }
    process.exit(1);
  }
}

checkTables();

