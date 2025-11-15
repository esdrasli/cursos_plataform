// Script de teste para verificar conexão FTP
// Uso: node test-ftp.js

import { Client } from 'basic-ftp';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

const host = process.env.SFTP_HOST || '195.35.16.131';
const port = parseInt(process.env.FTP_PORT || process.env.SFTP_PORT || '21');
const username = process.env.SFTP_USERNAME || '';
const password = process.env.SFTP_PASSWORD || '';

console.log('🧪 Teste de Conexão FTP');
console.log('='.repeat(50));
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Username: ${username}`);
console.log(`Password length: ${password.length}`);
console.log(`Password contém #: ${password.includes('#')}`);
console.log('='.repeat(50));

if (!username || !password) {
  console.error('❌ SFTP_USERNAME ou SFTP_PASSWORD não configurados no .env');
  process.exit(1);
}

const client = new Client();
client.ftp.verbose = true;

async function testConnection() {
  try {
    console.log('\n📤 Tentando conectar...');
    
    // Tentar FTP normal primeiro
    await client.access({
      host: host,
      port: port,
      user: username.trim(),
      password: password.trim(),
      secure: false,
    });
    
    console.log('✅ Conectado com sucesso!');
    
    const pwd = await client.pwd();
    console.log(`📂 Diretório atual: ${pwd}`);
    
    try {
      const list = await client.list();
      console.log(`📁 Arquivos no diretório (${list.length} itens):`);
      list.slice(0, 10).forEach(item => {
        console.log(`   - ${item.name} (${item.type === 'd' ? 'diretório' : 'arquivo'})`);
      });
    } catch (listError) {
      console.log(`⚠️ Erro ao listar: ${listError.message}`);
    }
    
    client.close();
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:', error.message);
    
    if (error.message.includes('530')) {
      console.log('\n💡 DICAS:');
      console.log('   1. Verifique se a senha está correta no painel da Hostinger');
      console.log('   2. Tente alterar a senha no painel e atualizar o .env');
      console.log('   3. Teste manualmente com FileZilla usando as mesmas credenciais');
      console.log('   4. Se funcionar no FileZilla, pode ser problema de encoding');
    }
    
    client.close();
    process.exit(1);
  }
}

testConnection();

