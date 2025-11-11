# 🐳 Configuração Docker - Completa

## ✅ Arquivos Criados

### Dockerfiles
- `Dockerfile` - Frontend (produção)
- `Dockerfile.dev` - Frontend (desenvolvimento)
- `backend/Dockerfile` - Backend (produção)
- `backend/Dockerfile.dev` - Backend (desenvolvimento)

### Docker Compose
- `docker-compose.yml` - Produção (3 serviços: postgres, backend, frontend)
- `docker-compose.dev.yml` - Desenvolvimento (com hot-reload)

### Configuração
- `nginx.conf` - Configuração do Nginx para frontend
- `.dockerignore` - Arquivos ignorados no build
- `backend/.dockerignore` - Arquivos ignorados no build do backend
- `backend/docker-entrypoint.sh` - Script de inicialização do backend

### Scripts
- `start.sh` - Script helper para iniciar
- `Makefile` - Comandos úteis simplificados

## 🚀 Como Usar

### Método 1: Script Helper (Mais Fácil)

```bash
# Desenvolvimento
./start.sh dev

# Produção
./start.sh prod
```

### Método 2: Docker Compose Direto

**Desenvolvimento:**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Produção:**
```bash
docker-compose up --build
```

### Método 3: Makefile

```bash
# Ver todos os comandos
make help

# Desenvolvimento
make up-dev

# Produção
make up

# Ver logs
make logs

# Parar
make down
```

## 📊 Serviços

### PostgreSQL
- **Porta:** 5432
- **Banco:** cursos_plataform
- **User:** postgres
- **Password:** postgres
- **Volume:** Persistente (dados não são perdidos ao parar)

### Backend
- **Porta:** 3001
- **Health Check:** http://localhost:3001/api/health
- **Auto-seed:** Executa na primeira inicialização (produção)

### Frontend
- **Desenvolvimento:** http://localhost:5173
- **Produção:** http://localhost
- **Proxy:** /api -> backend:3001

## 🔄 Workflow de Desenvolvimento

### Primeira vez:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Mudanças no código:
- Frontend: Hot-reload automático
- Backend: Hot-reload automático (tsx watch)

### Rebuild após mudanças de dependências:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

## 📝 Comandos Úteis

### Logs
```bash
# Todos
docker-compose logs -f

# Específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Executar comandos
```bash
# Backend
docker-compose exec backend npm run seed

# PostgreSQL
docker-compose exec postgres psql -U postgres -d cursos_plataform

# Shell
docker-compose exec backend sh
```

### Limpar tudo
```bash
docker-compose down -v  # Remove volumes também
```

## 🔐 Variáveis de Ambiente

O Docker Compose já configura tudo automaticamente. Para customizar, crie `.env`:

```env
JWT_SECRET=seu_secret_personalizado
DB_PASSWORD=senha_personalizada
```

## ✅ Verificação

Após iniciar, verifique:

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Frontend:**
   - Abra http://localhost (prod) ou http://localhost:5173 (dev)

3. **Banco de dados:**
   ```bash
   docker-compose exec postgres psql -U postgres -d cursos_plataform -c "SELECT version();"
   ```

## 🎯 Pronto para Produção

O `docker-compose.yml` está configurado para produção com:
- ✅ Builds otimizados
- ✅ Nginx como servidor web
- ✅ Volumes persistentes
- ✅ Health checks
- ✅ Restart automático
- ✅ Network isolada

## 📚 Documentação Adicional

- [README.DOCKER.md](README.DOCKER.md) - Guia completo
- [QUICKSTART.md](QUICKSTART.md) - Início rápido

