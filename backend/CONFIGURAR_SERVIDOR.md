# 🔧 Como Configurar o Servidor de Produção

## 📍 Situação Atual

- **Backend**: `api.ndx.sisaatech.com`
- **Banco**: `195.35.16.131:5433` (schema: `cursos`)
- **Tabelas**: ✅ Todas criadas
- **Configuração necessária**: Adicionar `DB_SCHEMA_PROD=cursos` no `.env`

## 🚀 Opção 1: Via SSH (Recomendado)

Se você tem acesso SSH ao servidor:

### 1. Conectar ao servidor  ....

```bash
ssh usuario@195.35.16.131
# ou
ssh usuario@api.ndx.sisaatech.com
```

### 2. Navegar até o diretório do backend

```bash
cd /caminho/do/backend
# Exemplo: cd /var/www/backend ou cd /home/usuario/backend
```

### 3. Executar o script de configuração

```bash
# Copie o arquivo configure-prod-server.sh para o servidor primeiro
chmod +x configure-prod-server.sh
./configure-prod-server.sh
```

### 4. Ou editar manualmente o .env

```bash
nano .env
# ou
vi .env
```

Adicione a linha:
```env
DB_SCHEMA_PROD=cursos
```

### 5. Reiniciar o backend

```bash
# Se usar Docker
docker restart cursos_backend_prod

# Se usar PM2
pm2 restart backend

# Se usar systemd
sudo systemctl restart backend

# Se usar Node.js direto
# Pare o processo (Ctrl+C) e inicie novamente
```

## 🚀 Opção 2: Via File Manager (Hostinger)

Se o backend está na Hostinger e você não tem SSH:

### 1. Acesse o File Manager

- Acesse: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
- Ou pelo painel da Hostinger

### 2. Navegue até o diretório do backend

- Procure pela pasta onde está o backend
- Geralmente em: `/home/ndx.sisaatech.com/backend` ou similar

### 3. Edite o arquivo `.env`

- Clique com botão direito no arquivo `.env`
- Selecione "Edit" ou "Editar"
- Adicione no final do arquivo:

```env
DB_SCHEMA_PROD=cursos
```

- Salve o arquivo

### 4. Reiniciar o backend

- Se usar CyberPanel, vá em "Node.js Apps" e reinicie a aplicação
- Ou use o terminal do File Manager para executar comandos

## 🚀 Opção 3: Via FTP

### 1. Conecte via FTP

- Host: `195.35.16.131`
- Port: `21`
- User: `admin_user`
- Password: (sua senha FTP)

### 2. Navegue até o diretório do backend

### 3. Baixe o arquivo `.env`

### 4. Edite localmente e adicione:

```env
DB_SCHEMA_PROD=cursos
```

### 5. Faça upload do arquivo `.env` atualizado

### 6. Reinicie o backend (via painel ou SSH)

## ✅ Verificação

Após reiniciar, teste o endpoint:

```bash
curl -X GET http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN"
```

Se retornar dados (não erro 500), a configuração está correta!

## 🔍 Verificar Logs

Se ainda houver problemas, verifique os logs:

```bash
# Docker
docker logs cursos_backend_prod

# PM2
pm2 logs backend

# Systemd
sudo journalctl -u backend -f
```

Procure por mensagens como:
- "Conectado ao PostgreSQL"
- "Schema: cursos"
- Erros de conexão ou tabelas não encontradas

## 📋 Checklist

- [ ] Arquivo `.env` editado
- [ ] Linha `DB_SCHEMA_PROD=cursos` adicionada
- [ ] Backend reiniciado
- [ ] Endpoint testado
- [ ] Logs verificados (se necessário)

