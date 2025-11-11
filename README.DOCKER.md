# 🐳 Docker - Guia de Uso

Este projeto está totalmente containerizado com Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker Desktop instalado (ou Docker + Docker Compose)
- Portas disponíveis: 80, 3001, 5432

## 🚀 Uso Rápido

### Desenvolvimento

Para rodar em modo desenvolvimento (com hot-reload):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Ou em background:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Produção

Para rodar em modo produção:

```bash
docker-compose up --build
```

Ou em background:
```bash
docker-compose up -d --build
```

## 📦 Serviços

### 1. PostgreSQL (porta 5432)
- Banco de dados PostgreSQL 16
- Volume persistente: `postgres_data`
- Health check configurado

### 2. Backend (porta 3001)
- API Node.js/Express/TypeScript
- TypeORM com PostgreSQL
- Auto-seed na primeira inicialização (produção)

### 3. Frontend (porta 80)
- Aplicação React/Vite
- Nginx como servidor web
- Proxy para API backend

## 🔧 Comandos Úteis

### Ver logs
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Parar serviços
```bash
docker-compose down
```

### Parar e remover volumes (⚠️ apaga dados do banco)
```bash
docker-compose down -v
```

### Rebuild completo
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Executar comandos dentro dos containers

**Backend:**
```bash
docker-compose exec backend sh
# ou
docker exec -it cursos_backend sh
```

**Frontend:**
```bash
docker-compose exec frontend sh
```

**PostgreSQL:**
```bash
docker-compose exec postgres psql -U postgres -d cursos_plataform
```

### Rodar seed manualmente
```bash
docker-compose exec backend npm run seed
```

## 🌐 Acessos

Após iniciar os containers:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health
- **PostgreSQL:** localhost:5432

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto para customizar:

```env
JWT_SECRET=seu_secret_super_seguro
DB_PASSWORD=senha_personalizada
```

## 📝 Estrutura de Arquivos Docker

```
.
├── docker-compose.yml          # Produção
├── docker-compose.dev.yml      # Desenvolvimento
├── Dockerfile                   # Frontend (produção)
├── Dockerfile.dev               # Frontend (desenvolvimento)
├── nginx.conf                   # Configuração Nginx
├── .dockerignore                # Frontend ignore
├── backend/
│   ├── Dockerfile               # Backend (produção)
│   ├── Dockerfile.dev           # Backend (desenvolvimento)
│   └── .dockerignore            # Backend ignore
```

## 🐛 Troubleshooting

### Porta já em uso
Se alguma porta estiver em uso, altere no `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Mude a primeira porta
```

### Erro de conexão com banco
O backend espera o PostgreSQL estar pronto. Se houver erro, aguarde alguns segundos e verifique:
```bash
docker-compose logs postgres
```

### Rebuild após mudanças
Após mudanças no código, você pode precisar rebuild:
```bash
docker-compose up --build
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📊 Verificar Status

```bash
docker-compose ps
```

## 🔄 Atualizar Código

Em desenvolvimento, mudanças no código são refletidas automaticamente (volumes montados).

Em produção, após mudanças:
```bash
docker-compose up --build -d
```

