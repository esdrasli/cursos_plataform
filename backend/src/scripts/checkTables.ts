// Script para verificar tabelas no banco de dados
import 'reflect-metadata';
import { AppDataSource } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Tabelas necessárias baseadas nas entidades
const requiredTables = [
  'users',
  'courses',
  'enrollments',
  'sales',
  'landing_pages',
  'affiliates',
  'affiliate_sales',
  'app_configs',
  'brandings', // Note: plural, como definido na entidade
  'user_enrolled_courses'
];

async function checkTables() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');
    console.log(`📊 Banco: ${AppDataSource.options.database}`);
    console.log(`🏠 Host: ${(AppDataSource.options as any).host}:${(AppDataSource.options as any).port}`);
    console.log('');

    const queryRunner = AppDataSource.createQueryRunner();
    
    // Listar todas as tabelas no schema public
    const allTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

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
      console.log('   Ou execute: npm run init-db');
    } else {
      console.log('');
      console.log('✅ Todas as tabelas necessárias estão presentes!');
    }

    // Verificar ENUMs necessários
    console.log('');
    console.log('🔍 VERIFICAÇÃO DE ENUMs:');
    console.log('='.repeat(50));
    
    const enums = await queryRunner.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
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
    await AppDataSource.destroy();
    
    process.exit(missingTables.length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    console.error('   Detalhes:', error);
    process.exit(1);
  }
}

checkTables();

