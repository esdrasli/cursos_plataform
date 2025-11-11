# 🚀 Quick Start - Docker

## Iniciar Tudo com Docker

### Opção 1: Modo Desenvolvimento (Recomendado)

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up --build

# Ou em background
docker-compose -f docker-compose.dev.yml up -d --build
```

**Acessos:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

### Opção 2: Modo Produção

```bash
# Iniciar todos os serviços
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

**Acessos:**
- Frontend: http://localhost
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

## 📋 Comandos Úteis

### Ver logs
```bash
docker-compose logs -f
```

### Parar serviços
```bash
docker-compose down
```

### Executar seed manualmente
```bash
docker-compose exec backend npm run seed
```

### Ver status
```bash
docker-compose ps
```

## 🔑 Credenciais de Teste

Após o seed:
- **Criador:** lucas@creator.com / 123456
- **Aluno:** carlos@student.com / 123456

## 📚 Mais Informações

Veja `README.DOCKER.md` para documentação completa.

