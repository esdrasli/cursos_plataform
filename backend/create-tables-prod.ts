// Script para criar todas as tabelas no banco de produção
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do banco (permite sobrescrever com variáveis de ambiente)
const dbConfig = {
  host: process.env.DB_HOST_PROD || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT_PROD || process.env.DB_PORT || '5432'),
  username: process.env.DB_USER_PROD || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD_PROD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME_PROD || process.env.DB_NAME || 'cursos_plataform',
};

async function createTables() {
  let dataSource: DataSource | null = null;
  
  try {
    console.log('🔄 Conectando ao banco de dados...');
    console.log(`📊 Configuração:`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   User: ${dbConfig.username}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log('');

    // Criar DataSource para executar queries SQL
    dataSource = new DataSource({
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      logging: false,
    });

    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados');
    console.log('');

    // Ler arquivo SQL
    const sqlPath = join(__dirname, 'create_all_tables.sql');
    console.log(`📄 Lendo arquivo SQL: ${sqlPath}`);
    
    let sql: string;
    try {
      sql = readFileSync(sqlPath, 'utf-8');
    } catch (error: any) {
      console.error(`❌ Erro ao ler arquivo SQL: ${error.message}`);
      process.exit(1);
    }

    console.log(`✅ Arquivo SQL lido (${sql.length} caracteres)`);
    console.log('');

    const queryRunner = dataSource.createQueryRunner();
    
    // Verificar permissões e schema correto
    console.log('🔍 Verificando permissões...');
    const permissions = await queryRunner.query(`
      SELECT 
        has_schema_privilege('${dbConfig.username}', 'public', 'CREATE') as can_create_public,
        has_schema_privilege('${dbConfig.username}', 'cursos', 'CREATE') as can_create_cursos
    `);
    
    const useSchema = permissions[0].can_create_cursos ? 'cursos' : 
                     permissions[0].can_create_public ? 'public' : 'public';
    
    console.log(`   Permissão CREATE no schema public: ${permissions[0].can_create_public}`);
    console.log(`   Permissão CREATE no schema cursos: ${permissions[0].can_create_cursos}`);
    console.log(`   Usando schema: ${useSchema}`);
    console.log('');
    
    // Criar extensão uuid-ossp se necessário
    try {
      console.log('🔧 Verificando extensão uuid-ossp...');
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      // Garantir que a função está disponível no schema
      await queryRunner.query(`SET search_path TO ${useSchema}, public;`);
      console.log('✅ Extensão uuid-ossp disponível');
      console.log('');
    } catch (error: any) {
      console.log(`⚠️  Aviso sobre extensão: ${error.message.split('\n')[0]}`);
      // Tentar usar a função do schema public
      sql = sql.replace(/uuid_generate_v4\(\)/g, `public.uuid_generate_v4()`);
      console.log('');
    }
    
    // Garantir que uuid_generate_v4() use o schema public se necessário
    if (!sql.includes('public.uuid_generate_v4')) {
      sql = sql.replace(/uuid_generate_v4\(\)/g, `public.uuid_generate_v4()`);
    }
    
    // Processar SQL - dividir por comandos completos
    console.log('🔨 Executando comandos SQL...');
    console.log('');
    
    // Substituir 'public' por o schema correto no SQL
    sql = sql.replace(/SET search_path TO public;/g, `SET search_path TO ${useSchema};`);
    sql = sql.replace(/public\./g, `${useSchema}.`);
    sql = sql.replace(/schema = 'public'/g, `schema = '${useSchema}'`);
    sql = sql.replace(/table_schema = 'public'/g, `table_schema = '${useSchema}'`);

    // Dividir SQL em comandos individuais
    // Remover comentários e linhas vazias
    const lines = sql.split('\n');
    let currentCommand = '';
    let inDoBlock = false;
    const commands: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Pular linhas vazias e comentários
      if (!trimmed || trimmed.startsWith('--')) {
        continue;
      }
      
      currentCommand += line + '\n';
      
      // Detectar início de bloco DO $$
      if (trimmed.startsWith('DO $$')) {
        inDoBlock = true;
      }
      
      // Detectar fim de bloco DO $$
      if (inDoBlock && trimmed.endsWith('$$;')) {
        inDoBlock = false;
        commands.push(currentCommand.trim());
        currentCommand = '';
      } else if (!inDoBlock && trimmed.endsWith(';')) {
        commands.push(currentCommand.trim());
        currentCommand = '';
      }
    }
    
    // Adicionar comando restante se houver
    if (currentCommand.trim()) {
      commands.push(currentCommand.trim());
    }

    console.log(`📋 Total de comandos SQL a executar: ${commands.length}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comandos vazios
      if (!command || command.trim().length === 0) {
        continue;
      }

      try {
        // Mostrar progresso para comandos importantes
        if (command.includes('CREATE TABLE') || command.includes('CREATE TYPE')) {
          const tableMatch = command.match(/CREATE (?:TABLE|TYPE) (?:IF NOT EXISTS )?[.\w]+\.?(\w+)/i);
          const name = tableMatch ? tableMatch[1] : 'objeto';
          console.log(`  [${i + 1}/${commands.length}] Criando ${name}...`);
        }

        await queryRunner.query(command);
        successCount++;
      } catch (error: any) {
        // Ignorar erros de "já existe" (IF NOT EXISTS)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          console.log(`  ⚠️  [${i + 1}/${commands.length}] ${error.message.split('\n')[0]}`);
          successCount++;
        } else {
          console.error(`  ❌ [${i + 1}/${commands.length}] Erro: ${error.message.split('\n')[0]}`);
          errorCount++;
        }
      }
    }

    console.log('');
    console.log('📊 RESUMO:');
    console.log('='.repeat(50));
    console.log(`  Comandos executados com sucesso: ${successCount}`);
    if (errorCount > 0) {
      console.log(`  Comandos com erro: ${errorCount}`);
    }
    console.log('');

    // Verificar tabelas criadas
    console.log('🔍 Verificando tabelas criadas...');
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${useSchema}' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`✅ Total de tabelas no banco: ${tables.length}`);
    if (tables.length > 0) {
      console.log('📋 Tabelas criadas:');
      tables.forEach((row: any) => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }

    await queryRunner.release();
    await dataSource.destroy();

    console.log('');
    console.log('✅ Processo concluído!');
    
    if (tables.length >= 10) {
      console.log('🎉 Todas as tabelas necessárias foram criadas!');
      process.exit(0);
    } else {
      console.log('⚠️  Algumas tabelas podem estar faltando. Verifique os erros acima.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   Erro: Não foi possível resolver o host do banco de dados');
      console.error('   Verifique se DB_HOST_PROD está correto');
    } else if (error.code === '28P01') {
      console.error('   Erro: Autenticação falhou');
      console.error('   Verifique DB_USER_PROD e DB_PASSWORD_PROD');
    } else if (error.code === '3D000') {
      console.error('   Erro: Banco de dados não existe');
      console.error('   Verifique se DB_NAME_PROD está correto');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Erro: Conexão recusada');
      console.error('   Verifique se o banco está rodando e a porta está correta');
    }
    
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

createTables();

