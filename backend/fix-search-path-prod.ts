import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Credenciais de produção
const client = new Client({
  host: process.env.DB_HOST_PROD || '195.35.16.131',
  port: parseInt(process.env.DB_PORT_PROD || '5433'),
  user: 'postgres', // Tentar como postgres primeiro
  password: process.env.POSTGRES_PASSWORD || '', // Pode precisar ser configurado
  database: process.env.DB_NAME_PROD || 'ndx_sisaatech',
});

async function fixSearchPath() {
  try {
    console.log('🔐 Conectando ao PostgreSQL como postgres...');
    await client.connect();
    console.log('✅ Conectado!');

    // Configurar search_path para ndx_admin
    console.log('📝 Configurando search_path...');
    await client.query(`ALTER USER ndx_admin SET search_path TO cursos, public;`);
    console.log('✅ Search path configurado!');

    // Verificar configuração
    const result = await client.query(`
      SELECT usename, useconfig 
      FROM pg_user 
      WHERE usename = 'ndx_admin';
    `);
    
    console.log('\n📋 Configuração do usuário:');
    console.log(result.rows);

    // Verificar permissões
    const permResult = await client.query(`
      SELECT 
        table_schema,
        table_name,
        has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'SELECT') as can_select,
        has_table_privilege('ndx_admin', table_schema||'.'||table_name, 'INSERT') as can_insert
      FROM information_schema.tables 
      WHERE table_schema = 'cursos' 
      AND table_name = 'users';
    `);

    console.log('\n📋 Permissões na tabela users:');
    console.log(permResult.rows);

    await client.end();
    console.log('\n✅ Concluído!');
  } catch (error: any) {
    if (error.message.includes('password authentication failed')) {
      console.error('❌ Erro: Senha do postgres incorreta ou não configurada.');
      console.error('\n💡 Execute manualmente no servidor:');
      console.error('   ssh root@195.35.16.131');
      console.error('   psql -h localhost -p 5433 -U postgres -d ndx_sisaatech');
      console.error('   ALTER USER ndx_admin SET search_path TO cursos, public;');
      console.error('   \\q');
    } else {
      console.error('❌ Erro:', error.message);
    }
    await client.end();
    process.exit(1);
  }
}

fixSearchPath();

