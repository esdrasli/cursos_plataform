# Build e Deploy para Produção

Este diretório contém scripts e configurações para build e deploy da aplicação em produção.

## Estrutura

```
build/
├── build.sh              # Script para build local
├── docker-build.sh       # Script para build de imagens Docker
├── deploy.sh             # Script completo de deploy
├── Dockerfile.frontend.prod  # Dockerfile do frontend para produção
├── Dockerfile.backend.prod    # Dockerfile do backend para produção
└── README.md             # Este arquivo
```

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Variáveis de ambiente configuradas

## Configuração

### 1. Criar arquivo `.env.production`

Crie um arquivo `.env.production` na raiz do projeto com as seguintes variáveis:

```env
# Database
DB_USER=postgres
DB_PASSWORD=senha_segura_aqui
DB_NAME=cursos_plataform
DB_PORT=5432

# JWT
JWT_SECRET=chave_secreta_jwt_muito_segura_aqui

# URLs
FRONTEND_URL=https://seusite.com
NGINX_HOST=seusite.com

# Portas
FRONTEND_PORT=80
```

### 2. Tornar scripts executáveis

```bash
chmod +x build/*.sh
```

## Build Local

Para fazer build local dos arquivos (sem Docker):

```bash
./build/build.sh
```

Os arquivos buildados estarão em:
- `build/frontend/` - Frontend buildado
- `build/backend/` - Backend buildado

## Build Docker

Para construir as imagens Docker:

```bash
./build/docker-build.sh
```

Isso criará as imagens:
- `cursos-backend:latest`
- `cursos-frontend:latest`

## Deploy Completo

Para fazer deploy completo usando Docker Compose:

```bash
./build/deploy.sh
```

Este script irá:
1. Verificar se `.env.production` existe
2. Buildar as imagens Docker
3. Parar containers existentes
4. Iniciar novos containers
5. Verificar status

## Deploy Manual

### 1. Build das imagens

```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Iniciar serviços

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verificar logs

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Parar serviços

```bash
docker-compose -f docker-compose.prod.yml down
```

## Verificação

Após o deploy, verifique:

1. **Frontend**: Acesse `http://localhost` (ou a URL configurada)
2. **Backend**: Verifique logs com `docker-compose -f docker-compose.prod.yml logs backend`
3. **Database**: Verifique conexão com `docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d cursos_plataform`

## Troubleshooting

### Containers não iniciam

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

### Rebuild completo

```bash
# Parar tudo
docker-compose -f docker-compose.prod.yml down -v

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

### Limpar volumes

```bash
# CUIDADO: Isso apagará todos os dados do banco!
docker-compose -f docker-compose.prod.yml down -v
```

## Otimizações de Produção

As imagens Docker de produção incluem:

- ✅ Multi-stage builds para reduzir tamanho
- ✅ Usuário não-root para segurança
- ✅ Healthchecks configurados
- ✅ Nginx otimizado para SPA
- ✅ Compressão Gzip habilitada
- ✅ Cache de assets estáticos
- ✅ Variáveis de ambiente seguras

## Backup

Para fazer backup do banco de dados:

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres cursos_plataform > backup_$(date +%Y%m%d_%H%M%S).sql
```

Para restaurar:

```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres cursos_plataform < backup.sql
```

