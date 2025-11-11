# Backend - Plataforma de Cursos

API REST desenvolvida com Node.js, TypeScript, Express e PostgreSQL para a plataforma de cursos online.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação tipada
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **TypeORM** - ORM para TypeScript/JavaScript
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando

## 🔧 Instalação

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações:
```
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cursos_plataform
NODE_ENV=development
```

4. Crie o banco de dados PostgreSQL:
```bash
createdb cursos_plataform
```

## 🏃 Executando

### Modo Desenvolvimento
```bash
npm run dev
```
O TypeScript será compilado automaticamente com `tsx watch`.

### Compilar TypeScript
```bash
npm run build
```

### Modo Produção
```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil do usuário logado (requer autenticação)

### Cursos
- `GET /api/courses` - Listar cursos (com filtros: search, category, level, page, limit)
- `GET /api/courses/:id` - Obter curso por ID
- `POST /api/courses` - Criar curso (requer autenticação de criador)
- `PUT /api/courses/:id` - Atualizar curso (requer autenticação de criador)
- `DELETE /api/courses/:id` - Deletar curso (requer autenticação de criador)
- `GET /api/courses/creator/my-courses` - Obter cursos do criador (requer autenticação de criador)

### Checkout
- `POST /api/checkout/process` - Processar pagamento (requer autenticação)
- `GET /api/checkout/course/:courseId` - Obter informações do checkout

### Dashboard (Aluno)
- `GET /api/dashboard/my-courses` - Obter cursos matriculados (requer autenticação)
- `GET /api/dashboard/stats` - Obter estatísticas (requer autenticação)
- `GET /api/dashboard/recommendations` - Obter cursos recomendados (requer autenticação)

### Aprendizado
- `GET /api/learning/course/:courseId` - Obter curso para aprendizado (requer autenticação)
- `POST /api/learning/complete-lesson` - Marcar lição como concluída (requer autenticação)
- `GET /api/learning/progress/:courseId` - Obter progresso do curso (requer autenticação)

### Criador
- `GET /api/creator/dashboard/stats` - Estatísticas do dashboard (requer autenticação de criador)
- `GET /api/creator/sales` - Listar vendas (requer autenticação de criador)
- `GET /api/creator/students` - Listar alunos (requer autenticação de criador)
- `GET /api/creator/landing-pages` - Listar landing pages (requer autenticação de criador)
- `GET /api/creator/landing-pages/:id` - Obter landing page (requer autenticação de criador)
- `POST /api/creator/landing-pages` - Criar landing page (requer autenticação de criador)
- `PUT /api/creator/landing-pages/:id` - Atualizar landing page (requer autenticação de criador)
- `DELETE /api/creator/landing-pages/:id` - Deletar landing page (requer autenticação de criador)

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Para autenticar, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 📝 Exemplos de Uso

### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "role": "student"
  }'
```

### Fazer Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Listar Cursos
```bash
curl http://localhost:3001/api/courses?search=react&category=Desenvolvimento%20Web
```

### Processar Pagamento
```bash
curl -X POST http://localhost:3001/api/checkout/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "courseId": "<course_id>",
    "paymentMethod": "credit",
    "paymentData": {}
  }'
```

## 🗄️ Modelos de Dados

### User
- Informações do usuário (estudante ou criador)
- Roles: `student`, `creator`, `admin`

### Course
- Cursos com módulos e lições
- Status: `draft`, `published`

### Enrollment
- Matrículas de alunos em cursos
- Progresso e lições concluídas

### Sale
- Registros de vendas
- Status: `pending`, `completed`, `failed`, `refunded`

### LandingPage
- Páginas de vendas dos criadores
- Status: `Publicada`, `Rascunho`

## 🧪 Dados de Teste

Para popular o banco com dados de teste, você pode usar o script de seed:

```bash
npm run seed
```

Isso criará usuários de teste (criadores e alunos) e alguns cursos.

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── entities/    # Entidades TypeORM (modelos)
│   ├── routes/      # Rotas da API
│   ├── middleware/  # Middlewares (auth, etc)
│   ├── config/      # Configurações (banco de dados)
│   ├── types/       # Tipos TypeScript
│   ├── server.ts    # Arquivo principal
│   └── seed.ts      # Script de seed
├── dist/            # Arquivos compilados (TypeScript)
├── package.json     # Dependências
└── README.md        # Documentação
```

## 🔄 Integração com Frontend

O backend está configurado para aceitar requisições do frontend. Certifique-se de que o CORS está configurado corretamente no frontend para fazer requisições para `http://localhost:3001`.

## 🐛 Troubleshooting

- **Erro de conexão com PostgreSQL**: Verifique se o PostgreSQL está rodando e se as credenciais estão corretas no `.env`
- **Erro de autenticação**: Verifique se o token JWT está sendo enviado corretamente no header
- **Erro 404**: Verifique se a rota está correta e se o servidor está rodando

## 📄 Licença

Este projeto é parte da plataforma de cursos online.

