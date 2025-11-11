# 📚 Plataforma de Cursos Online

Plataforma completa de cursos online com frontend React e backend Node.js/TypeScript.

## 🚀 Tecnologias

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- bcryptjs

### Infraestrutura
- Docker & Docker Compose
- PostgreSQL 16
- Nginx (produção)

## 📦 Instalação Rápida com Docker

### Pré-requisitos
- Docker Desktop instalado

### Iniciar Aplicação

**Desenvolvimento:**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Produção:**
```bash
docker-compose up --build
```

Acesse:
- Frontend: http://localhost (produção) ou http://localhost:5173 (dev)
- Backend: http://localhost:3001/api/health

## 🛠️ Instalação Manual (Sem Docker)

### Backend

```bash
cd backend
npm install

# Configurar .env
cp env.example.txt .env

# Criar banco de dados PostgreSQL
createdb cursos_plataform

# Rodar seed
npm run seed

# Iniciar
npm run dev
```

### Frontend

```bash
# Instalar dependências
yarn install

# Iniciar
yarn dev
```

## 📖 Documentação

- [Guia Docker Completo](README.DOCKER.md)
- [Quick Start](QUICKSTART.md)
- [Backend README](backend/README.md)
- [Guia de Migração](backend/MIGRATION_COMPLETE.md)

## 🎯 Funcionalidades

- ✅ Autenticação (Login/Registro)
- ✅ Catálogo de Cursos
- ✅ Checkout e Pagamento
- ✅ Área de Aprendizado
- ✅ Dashboard do Aluno
- ✅ Área do Criador
- ✅ Landing Pages
- ✅ Gestão de Vendas
- ✅ Gestão de Alunos

## 📝 Licença

Este projeto é parte da plataforma de cursos online.
