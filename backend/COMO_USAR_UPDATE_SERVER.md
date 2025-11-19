# 📋 Como Usar o Script de Atualização no Servidor

## 🚀 Método 1: Copiar e Colar no Servidor

1. **Conecte ao servidor via SSH:**
   ```bash
   ssh root@195.35.16.131
   # ou
   ssh usuario@195.35.16.131
   ```

2. **Navegue até o diretório do backend:**
   ```bash
   cd /opt/apps/cursos_plataform/backend
   ```

3. **Crie o arquivo do script:**
   ```bash
   nano update-server.sh
   # ou
   vi update-server.sh
   ```

4. **Cole o conteúdo do arquivo `backend/update-server.sh`** e salve

5. **Torne o script executável:**
   ```bash
   chmod +x update-server.sh
   ```

6. **Execute o script:**
   ```bash
   ./update-server.sh
   ```

## 🚀 Método 2: Enviar o Arquivo via SCP

No seu computador local:

```bash
scp backend/update-server.sh root@195.35.16.131:/opt/apps/cursos_plataform/backend/
```

Depois, no servidor:

```bash
cd /opt/apps/cursos_plataform/backend
chmod +x update-server.sh
./update-server.sh
```

## 🚀 Método 3: Executar Comandos Diretamente

Se preferir executar os comandos manualmente:

```bash
cd /opt/apps/cursos_plataform/backend
git pull origin main
npm install
npm run build  # se usar TypeScript
pm2 restart cursos-api  # ou o nome do seu processo PM2
pm2 logs cursos-api --lines 20
```

## ✅ O que o Script Faz

1. ✅ Faz `git pull origin main` para atualizar o código
2. ✅ Verifica se a rota `create-checkout-session` existe
3. ✅ Instala dependências (`npm install`)
4. ✅ Faz build se usar TypeScript (`npm run build`)
5. ✅ Verifica qual processo PM2 está rodando
6. ✅ Reinicia o PM2
7. ✅ Mostra logs para confirmar

## 🔍 Verificar se Funcionou

Após executar o script, teste a rota:

```bash
curl -X POST https://api.ndx.sisaatech.com/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"courseId":"test"}'
```

Se retornar um erro diferente de 404, a rota está funcionando! ✅

