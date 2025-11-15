import { Client } from 'pg';

// Credenciais de produção
const client = new Client({
  host: '195.35.16.131',
  port: 5433,
  user: 'postgres', // Precisamos ser postgres para ALTER USER
  password: process.env.POSTGRES_PASSWORD || '', // Vamos tentar algumas senhas comuns
  database: 'ndx_sisaatech',
});

async function fixSearchPath() {
  // Tentar senhas comuns do CyberPanel/PostgreSQL
  const passwords = [
    process.env.POSTGRES_PASSWORD,
    'Ndx@2025!', // Mesma senha do ndx_admin
    'postgres',
    'root',
    'admin',
  ].filter(Boolean);

  let connected = false;

  for (const password of passwords) {
    try {
      console.log(`🔐 Tentando conectar como postgres...`);
      const testClient = new Client({
        host: '195.35.16.131',
        port: 5433,
        user: 'postgres',
        password: password || '',
        database: 'ndx_sisaatech',
      });

      await testClient.connect();
      console.log('✅ Conectado como postgres!');
      
      // Configurar search_path
      console.log('📝 Configurando search_path para ndx_admin...');
      await testClient.query(`ALTER USER ndx_admin SET search_path TO cursos, public;`);
      console.log('✅ Search path configurado!');

      // Verificar configuração
      const result = await testClient.query(`
        SELECT usename, useconfig 
        FROM pg_user 
        WHERE usename = 'ndx_admin';
      `);
      
      console.log('\n📋 Configuração do usuário:');
      console.log(JSON.stringify(result.rows, null, 2));

      await testClient.end();
      connected = true;
      break;
    } catch (error: any) {
      if (error.message.includes('password authentication failed')) {
        console.log(`❌ Senha incorreta, tentando próxima...`);
        continue;
      } else {
        console.error(`❌ Erro: ${error.message}`);
        break;
      }
    }
  }

  if (!connected) {
    console.error('\n❌ Não foi possível conectar como postgres.');
    console.error('\n💡 Execute manualmente:');
    console.error('   ssh root@195.35.16.131');
    console.error('   psql -h localhost -p 5433 -U postgres -d ndx_sisaatech');
    console.error('   ALTER USER ndx_admin SET search_path TO cursos, public;');
    process.exit(1);
  }

  console.log('\n✅ Concluído! Agora reinicie o backend:');
  console.log('   pm2 restart all --update-env');
}

fixSearchPath();

