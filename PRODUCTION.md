# Guia de Deploy em Produção

Este guia explica como fazer build e deploy da aplicação em produção.

## 📁 Estrutura de Build

A pasta `build/` contém todos os arquivos necessários para build e deploy:

```
build/
├── build.sh              # Script para build local
├── docker-build.sh       # Script para build de imagens Docker
├── deploy.sh             # Script completo de deploy
├── Dockerfile.frontend.prod  # Dockerfile do frontend
├── Dockerfile.backend.prod   # Dockerfile do backend
├── Makefile              # Comandos make para facilitar
└── README.md             # Documentação detalhada
```

## 🚀 Quick Start

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do projeto:

```bash
cp .env.production.example .env.production
# Edite o arquivo com suas configurações
```

### 2. Build e Deploy

```bash
# Opção 1: Usando scripts npm
npm run docker:deploy

# Opção 2: Usando script direto
./build/deploy.sh

# Opção 3: Usando make
cd build && make deploy
```

## 📦 Build Local (sem Docker)

Para fazer build local dos arquivos:

```bash
npm run build:all
# ou
./build/build.sh
```

Os arquivos buildados estarão em:
- `build/frontend/` - Frontend otimizado
- `build/backend/` - Backend compilado

## 🐳 Build Docker

Para construir apenas as imagens Docker:

```bash
npm run docker:build
# ou
./build/docker-build.sh
```

## 🎯 Deploy Completo

O script de deploy faz tudo automaticamente:

```bash
npm run docker:deploy
# ou
./build/deploy.sh
```

## ⚙️ Configurações de Produção

### Variáveis de Ambiente Necessárias

```env
# Database
DB_USER=postgres
DB_PASSWORD=senha_segura
DB_NAME=cursos_plataform

# JWT
JWT_SECRET=chave_secreta_jwt

# URLs
FRONTEND_URL=https://seusite.com
NGINX_HOST=seusite.com
```

### Otimizações Aplicadas

- ✅ Multi-stage Docker builds
- ✅ Minificação de código
- ✅ Remoção de console.log
- ✅ Code splitting
- ✅ Compressão Gzip
- ✅ Cache de assets
- ✅ Healthchecks
- ✅ Usuário não-root

## 📊 Verificação

Após o deploy, verifique:

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost/api/health
```

## 🔧 Comandos Úteis

```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Rebuild completo
docker-compose -f docker-compose.prod.yml build --no-cache

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Acessar container
docker-compose -f docker-compose.prod.yml exec backend sh
```

## 📝 Notas Importantes

1. **Segurança**: Sempre use senhas fortes e JWT secrets seguros
2. **Backup**: Configure backups regulares do banco de dados
3. **SSL**: Configure HTTPS em produção usando um proxy reverso (Nginx/Traefik)
4. **Monitoramento**: Configure logs e monitoramento adequados
5. **Variáveis**: Nunca commite arquivos `.env.production` no git

## 🆘 Troubleshooting

Consulte `build/README.md` para troubleshooting detalhado.

