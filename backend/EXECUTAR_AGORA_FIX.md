# 🔧 CORREÇÃO URGENTE: Permission Denied for Table Users

## ⚠️ Problema
O erro "permission denied for table users" ocorre porque o PostgreSQL não está usando o schema `cursos` automaticamente.

## ✅ Solução (Execute AGORA)

### Passo 1: Conectar ao servidor
```bash
ssh root@195.35.16.131
# Senha: SisaaTTech1@
```

### Passo 2: Executar SQL como postgres
```bash
psql -h localhost -p 5433 -U postgres -d ndx_sisaatech
```

**Quando pedir a senha do postgres**, você precisa da senha do superusuário PostgreSQL. Se não souber, tente:
- A senha padrão do CyberPanel
- Ou verifique em `/root/.litespeed_password` (pode ser similar)

### Passo 3: Executar o comando SQL
```sql
ALTER USER ndx_admin SET search_path TO cursos, public;
```

### Passo 4: Verificar
```sql
SELECT usename, useconfig FROM pg_user WHERE usename = 'ndx_admin';
```

Você deve ver algo como:
```
  usename  |        useconfig        
-----------+-------------------------
 ndx_admin | {search_path=cursos,public}
```

### Passo 5: Sair e reiniciar backend
```sql
\q
```

```bash
cd /opt/storylinker/cursos_plataform/backend
pm2 restart all --update-env
pm2 logs cursos-api --lines 30
```

## 🔍 Verificar se funcionou

Nos logs do PM2, você deve ver:
```
✅ Conectado ao PostgreSQL
📊 Banco de dados: ndx_sisaatech
📂 Schema configurado: cursos
```

## 📝 Alternativa: Se não souber a senha do postgres

Se não conseguir a senha do postgres, podemos tentar uma solução alternativa configurando o search_path diretamente no código. Mas a solução acima é a mais eficiente.

---

**Execute estes comandos AGORA para resolver o problema de login!**

