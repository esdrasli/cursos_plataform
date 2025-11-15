# 🔄 Como Reiniciar o Servidor de Produção

## 🎯 Servidor de Produção

- **URL**: `api.ndx.sisaatech.com`
- **IP**: `195.35.16.131`

## 🚀 Métodos para Reiniciar

### Método 1: Via CyberPanel (Mais Fácil)

1. Acesse o painel da Hostinger/CyberPanel
2. Vá em **Node.js Apps** ou **Applications**
3. Encontre a aplicação do backend
4. Clique em **Restart** ou **Reiniciar**

### Método 2: Via SSH

```bash
# Conectar ao servidor
ssh usuario@195.35.16.131

# Se usar Docker
docker restart cursos_backend_prod

# Se usar PM2
pm2 restart backend

# Se usar systemd
sudo systemctl restart backend
```

### Método 3: Via File Manager Terminal

1. Acesse: https://195.35.16.131:8090/filemanager/ndx.sisaatech.com
2. Abra o terminal integrado
3. Execute:
   ```bash
   pm2 restart backend
   # ou
   docker restart cursos_backend_prod
   ```

## ✅ Verificar se Reiniciou

Após reiniciar, verifique os logs:

```bash
# Docker
docker logs cursos_backend_prod --tail 50

# PM2
pm2 logs backend --lines 50

# Systemd
sudo journalctl -u backend -n 50
```

Procure por:
- ✅ "Conectado ao PostgreSQL"
- ✅ "Schema: cursos"
- ✅ "Servidor rodando na porta 3001"

## 🧪 Testar API

```bash
curl http://api.ndx.sisaatech.com/api/courses/creator/my-courses \
  -H "Authorization: Bearer SEU_TOKEN"
```

Se retornar dados (não erro 500) = ✅ Funcionando!

